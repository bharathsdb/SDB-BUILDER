from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.transaction import Transaction
from app.models.subscription import Subscription, SubscriptionPlan
from app.utils.paytm import PaytmClient
from app.config import get_settings
from fastapi import HTTPException, status
import uuid
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.paytm = PaytmClient()

    async def create_checkout(self, user_id: str, plan_id: str) -> dict:
        result = await self.db.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id, SubscriptionPlan.is_active == True)
        )
        plan = result.scalar_one_or_none()
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
        
        if plan.name == "free":
            return {"success": True, "plan": "free"}
        
        order_id = f"ORDER_{uuid.uuid4().hex[:12].upper()}"
        
        txn = Transaction(
            user_id=user_id,
            amount=plan.price_monthly,
            currency="INR",
            status="PENDING",
            order_id=order_id,
            plan_name=plan.name,
        )
        self.db.add(txn)
        await self.db.flush()
        
        paytm_response = await self.paytm.initiate_transaction(
            order_id=order_id,
            amount=str(plan.price_monthly),
            customer_id=user_id,
        )
        
        return {
            "success": True,
            "order_id": order_id,
            "txn_token": paytm_response.get("body", {}).get("txnToken", ""),
            "amount": plan.price_monthly,
            "mid": settings.PAYTM_MID,
            "is_mock": settings.PAYTM_MERCHANT_KEY == "SampleMerchantKey12345",
            "paytm_url": paytm_response.get("paytm_url", ""),
        }

    async def verify_payment(self, data: dict) -> str:
        order_id = data.get("ORDERID")
        txn_id = data.get("TXNID")
        status_val = data.get("STATUS")
        amount = data.get("TXNAMOUNT")
        resp_msg = data.get("RESPMSG")
        
        result = await self.db.execute(
            select(Transaction).where(Transaction.order_id == order_id)
        )
        txn = result.scalar_one_or_none()
        if not txn:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
        
        if status_val == "TXN_SUCCESS":
            txn.status = "SUCCESS"
            txn.txn_id = txn_id
            txn.resp_msg = resp_msg
            txn.gateway_name = data.get("GATEWAYNAME")
            txn.payment_mode = data.get("PAYMENTMODE")
            txn.amount = float(amount) if amount else txn.amount
            
            await self._activate_subscription(txn.user_id, txn.plan_name)
        elif status_val == "PENDING":
            txn.status = "PENDING"
        else:
            txn.status = "FAILED"
            txn.resp_msg = resp_msg or "Payment failed"
        
        await self.db.flush()
        return status_val or "FAILED"

    async def get_history(self, user_id: str) -> list:
        result = await self.db.execute(
            select(Transaction).where(Transaction.user_id == user_id)
            .order_by(desc(Transaction.created_at))
        )
        transactions = result.scalars().all()
        return [
            {
                "id": t.id,
                "user_id": t.user_id,
                "amount": t.amount,
                "currency": t.currency,
                "status": t.status,
                "order_id": t.order_id,
                "txn_id": t.txn_id,
                "gateway_name": t.gateway_name,
                "payment_mode": t.payment_mode,
                "plan_name": t.plan_name,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in transactions
        ]

    async def _activate_subscription(self, user_id: str, plan_name: str):
        from app.models.user import User
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user.plan = plan_name.lower()
            await self.db.flush()
