from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class CheckoutRequest(BaseModel):
    plan_id: str


class CheckoutResponse(BaseModel):
    success: bool
    order_id: Optional[str] = None
    txn_token: Optional[str] = None
    amount: Optional[float] = None
    mid: Optional[str] = None
    is_mock: bool = False
    paytm_url: Optional[str] = None
    plan: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    ORDERID: str
    TXNID: Optional[str] = None
    TXNAMOUNT: Optional[str] = None
    STATUS: Optional[str] = None
    RESPMSG: Optional[str] = None
    CHECKSUMHASH: Optional[str] = None
    GATEWAYNAME: Optional[str] = None
    PAYMENTMODE: Optional[str] = None


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    amount: float
    currency: str
    status: str
    order_id: str
    txn_id: Optional[str] = None
    gateway_name: Optional[str] = None
    payment_mode: Optional[str] = None
    plan_name: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubscriptionPlanResponse(BaseModel):
    id: str
    name: str
    price_monthly: float
    price_yearly: float
    credits: int
    storage_mb: int
    max_projects: int
    features: Optional[Any] = None
    is_active: bool

    class Config:
        from_attributes = True
