from pydantic import BaseModel
from typing import Optional, Any


class PlanRequest(BaseModel):
    plot_length: float
    plot_width: float
    facing: str = "East"
    floors: int = 1
    budget_tier: str = "Standard"
    style: str = "Modern"
    vastu: bool = True
    bedrooms: int = 3
    bathrooms: int = 2
    kitchens: int = 1
    future_expansion: bool = False
    variation_type: str = "space_optimized"
    parking: int = 1
    garden: bool = False
    generate_variants: bool = False


class PlanResponse(BaseModel):
    rooms: list
    logs: list[str]
    cost_estimate: dict
    scores: dict
    sustainability_score: float
    suggestions: list[str]
    plot_size: str
    facing: str
    style: str
    variants: Optional[list] = None
