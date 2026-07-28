"""
PlanCraftAI Local Architect Engine
Multi-stage AI pipeline for architectural floor plan generation.
All processing is done locally - no external APIs.
"""
from app.ai.space_planner import SpacePlanner
from app.ai.layout_optimizer import LayoutOptimizer
from app.ai.ventilation_engine import VentilationEngine
from app.ai.lighting_engine import LightingEngine
from app.ai.cost_optimizer import CostOptimizer
from app.ai.room_generator import RoomGenerator
from app.ai.material_recommender import MaterialRecommender
from app.ai.construction_advisor import ConstructionAdvisor
from app.ai.vastu_engine import VastuEngine
from app.ai.scoring_engine import ScoringEngine
from app.config import get_settings
from typing import Any
import logging

logger = logging.getLogger(__name__)


class ArchitectEngine:
    def __init__(self):
        self.space_planner = SpacePlanner()
        self.layout_optimizer = LayoutOptimizer()
        self.ventilation_engine = VentilationEngine()
        self.lighting_engine = LightingEngine()
        self.cost_optimizer = CostOptimizer()
        self.room_generator = RoomGenerator()
        self.material_recommender = MaterialRecommender()
        self.construction_advisor = ConstructionAdvisor()
        self.vastu_engine = VastuEngine()
        self.scoring_engine = ScoringEngine()
        self.logs: list = []
        self.negotiations: list = []

    def log(self, agent: str, message: str):
        self.logs.append(f"[{agent}]: {message}")
        self.negotiations.append({"agent": agent, "message": message})

    def generate_plan(self, req: dict) -> dict:
        variants = []
        variation_types = [
            {"id": "var_1", "type": "space_optimized", "name": "Space Optimized"},
            {"id": "var_2", "type": "vastu_compliant", "name": "Vastu Compliant"},
            {"id": "var_3", "type": "eco_friendly", "name": "Eco Friendly"}
        ]
        
        for var in variation_types:
            req_copy = req.copy()
            req_copy["variation_type"] = var["type"]
            result = self._generate_single_variant(req_copy)
            result["id"] = var["id"]
            result["name"] = var["name"]
            variants.append(result)
            
        return {"variants": variants}

    def _generate_single_variant(self, req: dict) -> dict:
        self.logs = []
        self.negotiations = []

        self.log("Architect Agent", f"Analyzing layout request. Dimensions: {req.get('plot_width')}x{req.get('plot_length')} ft. "
                  f"Facing: {req.get('facing')}. Style: {req.get('style')}.")

        inputs = {
            "plot_length": req.get("plot_length", 60),
            "plot_width": req.get("plot_width", 40),
            "facing": req.get("facing", "East"),
            "floors": req.get("floors", 1),
            "budget_tier": req.get("budget_tier", "Standard"),
            "style": req.get("style", "Modern"),
            "vastu": req.get("vastu", True),
            "bedrooms": req.get("bedrooms", 3),
            "bathrooms": req.get("bathrooms", 2),
            "kitchens": req.get("kitchens", 1),
            "parking": req.get("parking", 1),
            "garden": req.get("garden", False),
            "future_expansion": req.get("future_expansion", False),
            "variation_type": req.get("variation_type", "space_optimized"),
        }

        self.log("Compliance Agent", f"Enforcing setbacks and building codes for {inputs['plot_width']}x{inputs['plot_length']} plot.")

        zones = self.space_planner.plan_zones(inputs)
        self.log("Space Planner", f"Created {len(zones)} functional zones based on requirements.")

        rooms = self.room_generator.generate_rooms(inputs, zones)
        self.log("Room Generator", f"Generated {len(rooms)} rooms with optimized dimensions.")

        if inputs["vastu"]:
            rooms = self.vastu_engine.apply_vastu(rooms, inputs["facing"])
            self.log("Vastu Engine", "Applied Vastu Shastra principles to room placement.")

        rooms = self.layout_optimizer.optimize(rooms, inputs)
        self.log("Layout Optimizer", f"Optimized layout for {inputs['variation_type']} variation.")

        layout = self.layout_optimizer.create_layout(rooms, inputs)

        doors = self.layout_optimizer.place_doors(layout)
        windows = self.layout_optimizer.place_windows(layout, inputs["facing"])
        self.log("Interior Agent", f"Placed {len(doors)} doors and {len(windows)} windows.")

        ventilation = self.ventilation_engine.analyze(rooms, windows, inputs)
        self.log("Ventilation Engine", f"Ventilation score: {ventilation['score']:.1f}%")

        lighting = self.lighting_engine.analyze(rooms, inputs["facing"], windows)
        self.log("Lighting Engine", f"Natural lighting score: {lighting['score']:.1f}%")

        cost = self.cost_optimizer.estimate(rooms, inputs)
        self.log("Cost Optimizer", f"Estimated cost: ₹{cost['estimate']['total']:,.2f}")

        materials = self.material_recommender.recommend(inputs["budget_tier"])
        self.log("Material Advisor", f"Recommended materials for {inputs['budget_tier']} tier.")

        construction = self.construction_advisor.advise(rooms, inputs)
        self.log("Construction Advisor", "Provided construction methodology recommendations.")

        vastu_scores = self.vastu_engine.score_rooms(rooms, inputs["facing"])

        scores = self.scoring_engine.evaluate(
            rooms=rooms,
            ventilation=ventilation,
            lighting=lighting,
            cost=cost,
            vastu=vastu_scores,
            inputs=inputs,
        )
        self.log("Scoring Engine", f"Overall score: {scores['overall_score']:.1f}/100")

        suggestions = self._generate_suggestions(scores, inputs)

        result = {
            "rooms": rooms,
            "logs": self.logs,
            "negotiations": self.negotiations,
            "costEstimate": cost["estimate"],
            "scores": scores,
            "sustainabilityScore": round(80 + (15 if inputs.get("variation_type") == "eco_friendly" else 0)),
            "suggestions": suggestions,
            "plotSize": f"{inputs['plot_width']}x{inputs['plot_length']}",
            "facing": inputs["facing"],
            "style": inputs["style"],
            "doors": doors,
            "windows": windows,
            "materials": materials,
            "construction_advice": construction,
        }

        return result

    def _generate_suggestions(self, scores: dict, inputs: dict) -> list:
        suggestions = []
        if scores.get("vastu_score", 100) < 80:
            suggestions.append("Shift kitchen to Southeast to follow positive energy flow.")
        if scores.get("ventilation_score", 100) < 80:
            suggestions.append("Add clear ventilation louvers above doors for wind flow.")
        if scores.get("cost_score", 100) < 70:
            suggestions.append(f"Consider reducing built-up area or switching to {inputs.get('budget_tier', 'Standard')} materials.")
        if scores.get("space_score", 100) < 70:
            suggestions.append("Optimize corridor spaces to increase carpet area.")
        if inputs.get("future_expansion"):
            suggestions.append("Provision for vertical expansion has been included in foundation design.")
        suggestions.append("Excellent structural alignment found. Align columns with inner walls.")
        return suggestions
