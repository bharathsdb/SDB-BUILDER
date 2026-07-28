"""
Inference Pipeline for LayoutPredictor
Runs predictions using trained model or fallback rule-based system.
"""
import json
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


class LayoutInference:
    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self.model_loaded = False

        if TORCH_AVAILABLE and model_path and os.path.exists(model_path):
            try:
                from app.ai.ml.model import LayoutPredictor
                self.model = LayoutPredictor()
                self.model.load_state_dict(torch.load(model_path, map_location="cpu"))
                self.model.eval()
                self.model_loaded = True
                logger.info(f"Model loaded from {model_path}")
            except Exception as e:
                logger.warning(f"Failed to load model: {e}")

    def predict(self, inputs: dict) -> dict:
        if self.model_loaded:
            try:
                return self._predict_with_model(inputs)
            except Exception as e:
                logger.warning(f"Model prediction failed, falling back: {e}")

        return self._predict_rule_based(inputs)

    def _predict_with_model(self, inputs: dict) -> dict:
        facing_map = {"East": 0, "West": 1, "North": 2, "South": 3}
        features = torch.tensor([[
            inputs.get("plot_length", 60) / 100,
            inputs.get("plot_width", 40) / 80,
            facing_map.get(inputs.get("facing", "East"), 0) / 3,
            {"Economy": 0, "Standard": 1, "Premium": 2, "Ultra Luxury": 3}.get(inputs.get("budget_tier", "Standard"), 1) / 3,
            {"Modern": 0, "Contemporary": 1, "Scandinavian": 2, "Mediterranean": 3, "Farmhouse": 4}.get(inputs.get("style", "Modern"), 0) / 4,
            inputs.get("bedrooms", 3) / 5,
            inputs.get("bathrooms", 2) / 4,
            1 / 2,  # kitchens
            inputs.get("floors", 1) / 3,
            1.0 if inputs.get("vastu", True) else 0.0,
            inputs.get("bedrooms", 3) / 10,
            inputs.get("plot_length", 60) * inputs.get("plot_width", 40) * 0.5 / 5000,
        ]])

        with torch.no_grad():
            output = self.model(features)[0]

        return {
            "space_score": round(float(output[0]) * 100, 1),
            "ventilation_score": round(float(output[1]) * 100, 1),
            "vastu_score": round(float(output[2]) * 100, 1),
            "cost_score": round(float(output[3]) * 100, 1),
            "efficiency_score": round(float(output[4]) * 100, 1),
            "predicted": True,
        }

    def _predict_rule_based(self, inputs: dict) -> dict:
        plot_area = inputs.get("plot_length", 60) * inputs.get("plot_width", 40)
        bedrooms = inputs.get("bedrooms", 3)

        space_score = min(100, (plot_area / 2400) * 100)
        vent_score = min(100, bedrooms * 15 + 20)
        vastu_score = 85.0 if inputs.get("vastu", True) else 60.0
        cost_score = 80.0
        efficiency_score = min(100, (1 - abs(1.5 / 1.5 - 1.5) / 2.5) * 100 + 10)

        return {
            "space_score": round(space_score, 1),
            "ventilation_score": round(vent_score, 1),
            "vastu_score": round(vastu_score, 1),
            "cost_score": round(cost_score, 1),
            "efficiency_score": round(efficiency_score, 1),
            "predicted": False,
        }
