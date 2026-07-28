"""
Paytm Payment Gateway Integration
Handles checksum generation/verification and API calls.
"""
import hashlib
import hmac
import json
import uuid
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class PaytmClient:
    def __init__(self):
        self.mid = settings.PAYTM_MID
        self.merchant_key = settings.PAYTM_MERCHANT_KEY
        self.is_stage = settings.PAYTM_ENVIRONMENT == "stage"
        
        if self.is_stage:
            self.base_url = "https://securegw-stage.paytm.in"
        else:
            self.base_url = "https://securegw.paytm.in"

    def generate_checksum(self, params: dict) -> str:
        sorted_keys = sorted(params.keys())
        param_str = "|".join(str(params[k]) for k in sorted_keys)
        param_str += "|" + self.merchant_key
        
        if self.merchant_key == "SampleMerchantKey12345":
            return "mock_checksum_hash_for_testing"
        
        return hashlib.sha256(param_str.encode()).hexdigest()

    def verify_checksum(self, params: dict) -> bool:
        if self.merchant_key == "SampleMerchantKey12345":
            return True
        
        checksum = params.pop("CHECKSUMHASH", "")
        sorted_keys = sorted(params.keys())
        param_str = "|".join(str(params[k]) for k in sorted_keys)
        param_str += "|" + self.merchant_key
        
        expected = hashlib.sha256(param_str.encode()).hexdigest()
        return hmac.compare_digest(expected, checksum)

    async def initiate_transaction(self, order_id: str, amount: str, customer_id: str) -> dict:
        if self.merchant_key == "SampleMerchantKey12345":
            return self._mock_response(order_id, amount)
        
        body = {
            "requestType": "Payment",
            "mid": self.mid,
            "websiteName": settings.PAYTM_WEBSITE,
            "orderId": order_id,
            "txnAmount": {
                "value": amount,
                "currency": "INR",
            },
            "userInfo": {
                "custId": customer_id,
            },
            "callbackUrl": settings.PAYTM_CALLBACK_URL,
        }
        
        import httpx
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{self.base_url}/themerchant/v1/initiateTransaction",
                    json={"body": body, "head": {"signature": self.generate_checksum(body)}},
                    headers={"Content-Type": "application/json"},
                )
                return response.json()
        except Exception as e:
            logger.error(f"Paytm initiation failed: {e}")
            raise

    async def check_status(self, order_id: str) -> dict:
        if self.merchant_key == "SampleMerchantKey12345":
            return {"status": "TXN_SUCCESS", "orderId": order_id}
        
        body = {
            "mid": self.mid,
            "orderId": order_id,
        }
        
        import httpx
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{self.base_url}/v3/order/status",
                    json={"body": body, "head": {"signature": self.generate_checksum(body)}},
                )
                return response.json()
        except Exception as e:
            logger.error(f"Paytm status check failed: {e}")
            raise

    def _mock_response(self, order_id: str, amount: str) -> dict:
        return {
            "body": {
                "resultInfo": {
                    "resultStatus": "S",
                    "resultCode": "0000",
                    "resultMsg": "Mock success",
                },
                "txnToken": f"mock_txn_token_{uuid.uuid4().hex[:12]}",
                "isPromoCodeValid": False,
                "authenticated": False,
            },
            "head": {"responseTimestamp": "0", "version": "v1", "signature": "mock"},
            "paytm_url": f"{self.base_url}/themerchant/api/v1/initiateTransaction?mid={self.mid}&orderId={order_id}",
        }
