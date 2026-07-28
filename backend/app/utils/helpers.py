import re
import uuid
import pytz
from datetime import datetime
from typing import Any


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


def generate_id() -> str:
    return f"pc_{uuid.uuid4().hex[:24]}"


def generate_share_url() -> str:
    return uuid.uuid4().hex[:12]


def now_utc() -> datetime:
    return datetime.now(pytz.UTC)


def format_currency(amount: float, currency: str = "INR") -> str:
    symbols = {"INR": "₹", "USD": "$", "EUR": "€"}
    sym = symbols.get(currency, "₹")
    return f"{sym}{amount:,.2f}"


def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
