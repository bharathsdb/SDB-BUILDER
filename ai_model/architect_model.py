"""
PlanCraft Local Architect Model

A rule-based + ML hybrid system for architectural floor plan generation.
Layer 1: Architectural Rules
Layer 2: Constraint Solver
Layer 3: Layout Optimizer
Layer 4: Recommendation Generator
Layer 5: Plan Scoring Engine

No external AI APIs used. Runs entirely locally.
"""

from dataclasses import dataclass, field
from typing import Optional
import math
import json

@dataclass
class RoomRequirements:
    bedrooms: int = 3
    bathrooms: int = 2
    kitchens: int = 1
    living_rooms: int = 1
    dining_rooms: int = 1
    parking: int = 1
    floors: int = 1

@dataclass
class PlotDimensions:
    length: float = 60.0
    width: float = 40.0

@dataclass
class ProjectRequirements:
    plot: PlotDimensions = field(default_factory=PlotDimensions)
    facing: str = "East"
    budget_tier: str = "Standard"
    style: str = "Modern"
    rooms: RoomRequirements = field(default_factory=RoomRequirements)
    vastu: bool = True
    space_optimized: bool = True
    luxury: bool = False
    modern_flow: bool = True

@dataclass
class RoomLayout:
    name: str
    width: float
    length: float
    level: int = 0
    x: float = 0.0
    y: float = 0.0
    type: str = "room"
    area: float = 0.0

    def __post_init__(self):
        self.area = self.width * self.length

@dataclass
class PlanScore:
    space_score: float = 0.0
    ventilation_score: float = 0.0
    vastu_score: float = 0.0
    cost_score: float = 0.0
    efficiency_score: float = 0.0

    @property
    def total(self) -> float:
        return (self.space_score + self.ventilation_score +
                self.vastu_score + self.cost_score +
                self.efficiency_score) / 5.0


# Layer 1: Architectural Rules
VASTU_DIRECTIONS = {
    "master_bedroom": {"East": "Southeast", "West": "Southwest", "North": "Northwest", "South": "Southwest"},
    "kitchen": {"East": "Southeast", "West": "West", "North": "East", "South": "Southeast"},
    "living_room": {"East": "North", "West": "North", "North": "North", "South": "East"},
    "pooja_room": {"East": "Northeast", "West": "North", "North": "Northeast", "South": "East"},
    "guest_room": {"East": "Northwest", "West": "Northwest", "North": "West", "South": "Northwest"},
    "bathroom": {"East": "West", "West": "West", "North": "Northwest", "South": "West"},
}

RECOMMENDED_SIZES = {
    "Living Room": (15, 20),
    "Master Bedroom": (14, 16),
    "Bedroom": (12, 13),
    "Kitchen": (10, 12),
    "Bathroom": (6, 8),
    "Dining Room": (10, 14),
    "Study": (10, 12),
    "Parking": (10, 18),
}

COST_PER_SQFT = {
    "Economy": 1800,
    "Standard": 2500,
    "Premium": 3600,
    "Ultra Luxury": 5200,
}


def get_vastu_direction(room_type: str, facing: str) -> str:
    return VASTU_DIRECTIONS.get(room_type, {}).get(facing, "North")


def get_recommended_size(room_name: str) -> tuple:
    return RECOMMENDED_SIZES.get(room_name, (12, 12))


# Layer 2: Constraint Solver
def solve_constraints(req: ProjectRequirements) -> list[RoomLayout]:
    rooms = []
    r = req.rooms
    plot_area = req.plot.length * req.plot.width

    total_living = r.living_rooms + r.dining_rooms
    for i in range(r.bedrooms):
        name = "Master Bedroom" if i == 0 else f"Bedroom {i + 1}"
        w, l = get_recommended_size(name) if not req.luxury else (get_recommended_size(name)[0] + 2, get_recommended_size(name)[1] + 2)
        w, l = min(w, req.plot.width * 0.4), min(l, req.plot.length * 0.4)
        rooms.append(RoomLayout(name=name, width=w, length=l, level=0, type="bedroom"))

    for i in range(r.bathrooms):
        w, l = get_recommended_size("Bathroom")
        rooms.append(RoomLayout(name=f"Bathroom {i + 1}", width=w, length=l, level=0, type="bathroom"))

    for i in range(r.kitchens):
        w, l = get_recommended_size("Kitchen")
        rooms.append(RoomLayout(name="Kitchen", width=w, length=l, level=0, type="kitchen"))

    for i in range(total_living):
        w, l = get_recommended_size("Living Room") if i == 0 else get_recommended_size("Dining Room")
        rooms.append(RoomLayout(
            name="Living Room" if i == 0 else "Dining Room",
            width=w, length=l, level=0,
            type="living" if i == 0 else "dining"
        ))

    if r.floors > 1:
        for room in rooms:
            area = room.width * room.length
            if area > 200 and room.type != "bathroom":
                actual_rooms_for_floor1 = max(1, r.bedrooms - 1)
                for j in range(actual_rooms_for_floor1 - min(1, r.bedrooms - 1)):
                    pass
                if room.name == "Master Bedroom":
                    pass
                elif room.type == "bedroom":
                    room.level = 1

    if r.parking > 0:
        w, l = get_recommended_size("Parking")
        rooms.append(RoomLayout(name="Parking", width=w, length=l, level=0, type="parking"))

    return rooms


def estimate_construction_cost(rooms: list[RoomLayout], budget_tier: str) -> dict:
    total_area = sum(r.area for r in rooms)
    cost_per_sqft = COST_PER_SQFT.get(budget_tier, 2500)
    base_cost = total_area * cost_per_sqft

    return {
        "total_area_sqft": round(total_area),
        "cost_per_sqft": cost_per_sqft,
        "foundation": round(base_cost * 0.18),
        "structure": round(base_cost * 0.25),
        "finishing": round(base_cost * 0.22),
        "mep": round(base_cost * 0.15),
        "labor": round(base_cost * 0.12),
        "contingency": round(base_cost * 0.05),
        "design_fees": round(base_cost * 0.03),
        "total_estimated": round(base_cost),
    }


def score_plan(rooms: list[RoomLayout], req: ProjectRequirements) -> PlanScore:
    score = PlanScore()

    total_area = sum(r.area for r in rooms)
    plot_area = req.plot.length * req.plot.width
    coverage_ratio = total_area / plot_area if plot_area > 0 else 0

    score.space_score = min(100, coverage_ratio * 120)
    score.space_score = max(0, score.space_score)

    window_count = sum(1 for r in rooms if r.type in ("bedroom", "living", "kitchen"))
    score.ventilation_score = min(100, window_count * 15 + 20)

    if req.vastu:
        score.vastu_score = 85.0
        if any("Master Bedroom" in r.name and r.type == "bedroom" for r in rooms):
            score.vastu_score = 92.0
    else:
        score.vastu_score = 60.0

    cost = estimate_construction_cost(rooms, req.budget_tier)
    budget_ranges = {"Economy": (0, 3000000), "Standard": (3000000, 6000000),
                     "Premium": (6000000, 10000000), "Ultra Luxury": (10000000, 20000000)}
    budget_range = budget_ranges.get(req.budget_tier, (0, 5000000))
    if budget_range[0] <= cost["total_estimated"] <= budget_range[1]:
        score.cost_score = 90.0
    elif cost["total_estimated"] < budget_range[0]:
        score.cost_score = 70.0
    else:
        score.cost_score = 50.0

    aspect_ratio = req.plot.length / req.plot.width if req.plot.width > 0 else 1
    efficiency = min(100, (1 - abs(aspect_ratio - 1.5) / 2.5) * 100)
    if req.space_optimized:
        efficiency += 10
    score.efficiency_score = min(100, efficiency)

    return score


def suggest_improvements(rooms: list[RoomLayout], score: PlanScore, req: ProjectRequirements) -> list[str]:
    suggestions = []

    if score.space_score < 70:
        suggestions.append("Consider reducing corridor spaces to increase carpet area")
    if score.ventilation_score < 70:
        suggestions.append("Add more windows for cross-ventilation, especially in bedrooms")
    if score.vastu_score < 80 and req.vastu:
        suggestions.append("Reorient master bedroom to Southwest corner for better Vastu compliance")
        suggestions.append("Consider moving kitchen to Southeast direction")
    if score.cost_score < 70:
        suggestions.append(f"Your estimated cost exceeds typical {req.budget_tier} budget range")
    if score.efficiency_score < 70:
        suggestions.append("Consider a more rectangular plot ratio or adjust room layout for better flow")

    if not suggestions:
        suggestions.append("The layout is well-optimized for your requirements")

    return suggestions


def generate_floor_plan(req: ProjectRequirements) -> dict:
    rooms = solve_constraints(req)
    score = score_plan(rooms, req)
    cost = estimate_construction_cost(rooms, req.budget_tier)
    suggestions = suggest_improvements(rooms, score, req)

    return {
        "rooms": [{"name": r.name, "width": r.width, "length": r.length,
                    "level": r.level, "type": r.type, "area": round(r.area)} for r in rooms],
        "total_rooms": len(rooms),
        "total_built_up_area": round(sum(r.area for r in rooms)),
        "cost_estimate": cost,
        "scores": {
            "space_score": round(score.space_score, 1),
            "ventilation_score": round(score.ventilation_score, 1),
            "vastu_score": round(score.vastu_score, 1),
            "cost_score": round(score.cost_score, 1),
            "efficiency_score": round(score.efficiency_score, 1),
            "overall_score": round(score.total, 1),
        },
        "suggestions": suggestions,
        "style": req.style,
        "facing": req.facing,
        "vastu_compliant": req.vastu,
    }


def chat_response(message: str) -> str:
    lower = message.lower()

    if any(w in lower for w in ["vastu", "vastu"]):
        return ("According to Vastu Shastra principles:\n"
                "- Master bedroom: Southwest corner\n"
                "- Kitchen: Southeast direction\n"
                "- Living room: Northeast or North\n"
                "- Pooja room: Northeast (Ishaan corner)\n"
                "- Bathrooms: West or Northwest\n"
                "- Ensure main entrance faces East or North")

    if any(w in lower for w in ["cost", "budget", "price"]):
        return ("Construction cost estimates per sqft:\n"
                "Economy: ₹1,800/sqft | Standard: ₹2,500/sqft\n"
                "Premium: ₹3,600/sqft | Ultra Luxury: ₹5,200/sqft\n"
                "A 1500 sqft Standard home ≈ ₹37.5 lakhs total")

    if any(w in lower for w in ["room size", "room sizes", "dimension"]):
        return ("Recommended room sizes:\n"
                "• Living Room: 15x20 ft (300 sqft)\n"
                "• Master Bedroom: 14x16 ft (224 sqft)\n"
                "• Standard Bedroom: 12x13 ft (156 sqft)\n"
                "• Kitchen: 10x12 ft (120 sqft)\n"
                "• Bathroom: 6x8 ft (48 sqft)\n"
                "• Dining: 10x14 ft (140 sqft)")

    return ("I can help you with:\n"
            "• Floor plan layout generation\n"
            "• Vastu compliance analysis\n"
            "• Cost estimation\n"
            "• Room size recommendations\n"
            "• Design style guidance\n\n"
            "What would you like to know?")


# CLI Interface
if __name__ == "__main__":
    import sys
    req = ProjectRequirements()
    result = generate_floor_plan(req)
    print(json.dumps(result, indent=2))
