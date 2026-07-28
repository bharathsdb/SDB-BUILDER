from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.payment import CheckoutRequest
from app.services.payment_service import PaymentService
from app.models.user import User
from app.models.transaction import Transaction
from app.models.subscription import SubscriptionPlan
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.post("/paytm/checkout")
async def checkout(
    req: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PaymentService(db)
    return await service.create_checkout(current_user.id, req.plan_id)


@router.post("/paytm/verify")
async def verify_payment(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    form_data = await request.form()
    data = {k: v for k, v in form_data.items()}

    service = PaymentService(db)
    status_val = await service.verify_payment(data)

    if status_val == "TXN_SUCCESS":
        return Response(
            content="<html><body><script>window.location.href='/dashboard/billing?status=success&orderId=" +
                    data.get("ORDERID", "") + "'</script></body></html>",
            media_type="text/html",
            status_code=303,
        )
    else:
        return Response(
            content="<html><body><script>window.location.href='/dashboard/billing?status=failed&orderId=" +
                    data.get("ORDERID", "") + "&msg=" + data.get("RESPMSG", "") +
                    "'</script></body></html>",
            media_type="text/html",
            status_code=303,
        )


@router.post("/paytm/webhook")
async def paytm_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    from app.utils.paytm import PaytmClient
    body = await request.json()

    paytm = PaytmClient()
    if not paytm.verify_checksum(body):
        logger.warning("Invalid webhook checksum")
        return {"status": "INVALID"}

    service = PaymentService(db)
    await service.verify_payment(body)

    return {"status": "RECEIVED"}


@router.get("/paytm/history")
async def payment_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PaymentService(db)
    transactions = await service.get_history(current_user.id)
    return {"transactions": transactions}


@router.get("/paytm/invoice")
async def generate_invoice(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(Transaction.order_id == order_id, Transaction.user_id == current_user.id)
    )
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    html = f"""<!DOCTYPE html><html><head><title>Invoice - PlanCraftAI</title>
<style>body{{font-family:Arial;padding:40px;max-width:800px;margin:auto}}
h1{{color:#1a73e8}}.details{{margin:20px 0}}.row{{display:flex;padding:8px 0;border-bottom:1px solid #eee}}
.label{{font-weight:bold;width:200px}}.total{{font-size:24px;color:#1a73e8;margin-top:20px}}
</style></head><body>
<h1>PlanCraftAI Invoice</h1>
<div class="details">
<div class="row"><span class="label">Invoice #:</span><span>INV-{txn.order_id}</span></div>
<div class="row"><span class="label">Order ID:</span><span>{txn.order_id}</span></div>
<div class="row"><span class="label">Transaction ID:</span><span>{txn.txn_id or 'N/A'}</span></div>
<div class="row"><span class="label">Plan:</span><span>{txn.plan_name}</span></div>
<div class="row"><span class="label">Status:</span><span>{txn.status}</span></div>
<div class="row"><span class="label">Date:</span><span>{txn.created_at}</span></div>
<div class="row"><span class="label">Payment Mode:</span><span>{txn.payment_mode or 'N/A'}</span></div>
</div>
<div class="total">Total: ₹{txn.amount:,.2f}</div>
<p style="margin-top:40px;color:#666;font-size:12px">Thank you for choosing PlanCraftAI</p>
</body></html>"""
    return Response(content=html, media_type="text/html")


@router.get("/plans")
async def get_plans(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.is_active == True))
    plans = result.scalars().all()

    return {
        "plans": [
            {
                "id": p.id,
                "name": p.name,
                "price_monthly": p.price_monthly,
                "price_yearly": p.price_yearly,
                "credits": p.credits,
                "storage_mb": p.storage_mb,
                "max_projects": p.max_projects,
                "features": p.features or [],
                "is_active": p.is_active,
            }
            for p in plans
        ]
    }
