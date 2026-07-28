"""Unit tests for PlanCraft AI Local Architect Model."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from architect_model import (
    ProjectRequirements, RoomRequirements, PlotDimensions,
    generate_floor_plan, score_plan, suggest_improvements,
    solve_constraints, estimate_construction_cost,
    RECOMMENDED_SIZES, COST_PER_SQFT, chat_response
)


def test_generate_floor_plan():
    req = ProjectRequirements()
    result = generate_floor_plan(req)
    assert "rooms" in result
    assert "scores" in result
    assert "cost_estimate" in result
    assert len(result["rooms"]) > 0
    assert result["total_rooms"] == len(result["rooms"])


def test_custom_requirements():
    req = ProjectRequirements(
        plot=PlotDimensions(length=40, width=30),
        facing="East",
        budget_tier="Premium",
        style="Contemporary",
        rooms=RoomRequirements(bedrooms=2, bathrooms=2, floors=1),
        vastu=True,
    )
    result = generate_floor_plan(req)
    assert result["facing"] == "East"
    assert result["style"] == "Contemporary"
    assert result["vastu_compliant"] == True


def test_scores_range():
    req = ProjectRequirements()
    result = generate_floor_plan(req)
    scores = result["scores"]
    for key in ["space_score", "ventilation_score", "vastu_score",
                 "cost_score", "efficiency_score", "overall_score"]:
        assert 0 <= scores[key] <= 100, f"{key} out of range: {scores[key]}"


def test_cost_estimate_structure():
    req = ProjectRequirements()
    result = generate_floor_plan(req)
    cost = result["cost_estimate"]
    required_keys = ["total_area_sqft", "cost_per_sqft", "total_estimated",
                     "foundation", "structure", "finishing"]
    for key in required_keys:
        assert key in cost, f"Missing cost key: {key}"
    assert cost["total_estimated"] > 0


def test_vastu_disabled():
    req = ProjectRequirements(vastu=False)
    result = generate_floor_plan(req)
    assert result["vastu_compliant"] == False
    assert result["scores"]["vastu_score"] < 80


def test_chat_responses():
    vastu_resp = chat_response("Tell me about vastu")
    assert "Vastu" in vastu_resp or "vastu" in vastu_resp

    cost_resp = chat_response("What is the cost?")
    assert "₹" in cost_resp or "cost" in cost_resp

    room_resp = chat_response("What are room sizes?")
    assert "Living Room" in room_resp or "room" in room_resp


def test_luxury_mode():
    req = ProjectRequirements(luxury=True)
    result = generate_floor_plan(req)
    assert len(result["rooms"]) > 0


def test_large_plot():
    req = ProjectRequirements(
        plot=PlotDimensions(length=100, width=80),
        rooms=RoomRequirements(bedrooms=5, bathrooms=4, floors=2),
    )
    result = generate_floor_plan(req)
    assert result["total_rooms"] >= 8


def test_suggestions():
    req = ProjectRequirements()
    result = generate_floor_plan(req)
    assert len(result["suggestions"]) > 0


def test_cost_tiers():
    for tier in COST_PER_SQFT:
        req = ProjectRequirements(budget_tier=tier)
        result = generate_floor_plan(req)
        assert result["cost_estimate"]["cost_per_sqft"] == COST_PER_SQFT[tier]


if __name__ == "__main__":
    test_generate_floor_plan()
    test_custom_requirements()
    test_scores_range()
    test_cost_estimate_structure()
    test_vastu_disabled()
    test_chat_responses()
    test_luxury_mode()
    test_large_plot()
    test_suggestions()
    test_cost_tiers()
    print("All tests passed!")
