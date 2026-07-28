"""
Dataset Schema for layout training data.
Provides data loading, validation, and transformation utilities.
"""
import json
import os
from typing import Optional


class DatasetSchema:
    SCHEMA_VERSION = "1.0"

    @staticmethod
    def validate(example: dict) -> bool:
        required = ["plot_length", "plot_width", "facing", "budget_tier", "bedrooms", "bathrooms"]
        for field in required:
            if field not in example:
                return False
        return True

    @staticmethod
    def load(path: str) -> list:
        if not os.path.exists(path):
            return []
        with open(path) as f:
            data = json.load(f)
        return [ex for ex in data if DatasetSchema.validate(ex)]

    @staticmethod
    def save(data: list, path: str):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

    @staticmethod
    def transform(example: dict) -> dict:
        return {
            "plot_length": float(example.get("plot_length", 60)),
            "plot_width": float(example.get("plot_width", 40)),
            "facing": example.get("facing", "East"),
            "budget_tier": example.get("budget_tier", "Standard"),
            "style": example.get("style", "Modern"),
            "bedrooms": int(example.get("bedrooms", 3)),
            "bathrooms": int(example.get("bathrooms", 2)),
            "kitchens": int(example.get("kitchens", 1)),
            "floors": int(example.get("floors", 1)),
            "vastu": bool(example.get("vastu", True)),
            "rooms": example.get("rooms", []),
            "scores": example.get("scores", {}),
        }
