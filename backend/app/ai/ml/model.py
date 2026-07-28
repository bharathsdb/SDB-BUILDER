"""
Machine Learning Model Architecture
PyTorch feed-forward network for predicting optimal layout scores.
Supports ONNX export for production inference.
"""
from typing import Optional
import json
import os
import logging

logger = logging.getLogger(__name__)

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    logger.warning("PyTorch not available. Install with: pip install torch")


if TORCH_AVAILABLE:
    class LayoutPredictor(nn.Module):
        def __init__(self, input_dim: int = 12, hidden_dim: int = 128, output_dim: int = 5):
            super().__init__()
            self.net = nn.Sequential(
                nn.Linear(input_dim, hidden_dim),
                nn.ReLU(),
                nn.Dropout(0.2),
                nn.Linear(hidden_dim, hidden_dim // 2),
                nn.ReLU(),
                nn.Dropout(0.1),
                nn.Linear(hidden_dim // 2, hidden_dim // 4),
                nn.ReLU(),
                nn.Linear(hidden_dim // 4, output_dim),
                nn.Sigmoid(),
            )

        def forward(self, x):
            return self.net(x)

        def export_to_onnx(self, output_path: str):
            self.eval()
            dummy_input = torch.randn(1, 12)
            torch.onnx.export(
                self,
                dummy_input,
                output_path,
                input_names=["input"],
                output_names=["scores"],
                dynamic_axes={"input": {0: "batch_size"}, "scores": {0: "batch_size"}},
                opset_version=14,
            )
            logger.info(f"Model exported to ONNX: {output_path}")

    class LayoutDataset(torch.utils.data.Dataset):
        def __init__(self, data: list):
            self.examples = data

        def __len__(self):
            return len(self.examples)

        def __getitem__(self, idx):
            ex = self.examples[idx]
            facing_map = {"East": 0, "West": 1, "North": 2, "South": 3}

            features = torch.tensor([
                ex.get("plot_length", 60) / 100,
                ex.get("plot_width", 40) / 80,
                facing_map.get(ex.get("facing", "East"), 0) / 3,
                {"Economy": 0, "Standard": 1, "Premium": 2, "Ultra Luxury": 3}.get(ex.get("budget_tier", "Standard"), 1) / 3,
                {"Modern": 0, "Contemporary": 1, "Scandinavian": 2, "Mediterranean": 3, "Farmhouse": 4}.get(ex.get("style", "Modern"), 0) / 4,
                ex.get("bedrooms", 3) / 5,
                ex.get("bathrooms", 2) / 4,
                ex.get("kitchens", 1) / 2,
                ex.get("floors", 1) / 3,
                1.0 if ex.get("vastu", True) else 0.0,
                len(ex.get("rooms", [])) / 10,
                sum(r.get("area", 0) for r in ex.get("rooms", [])) / 5000,
            ], dtype=torch.float32)

            scores = ex.get("scores", {})
            target = torch.tensor([
                scores.get("space_score", 50) / 100,
                scores.get("ventilation_score", 50) / 100,
                scores.get("vastu_score", 50) / 100,
                scores.get("cost_score", 50) / 100,
                scores.get("efficiency_score", 50) / 100,
            ], dtype=torch.float32)

            return features, target

else:
    class LayoutPredictor:
        def __init__(self, *args, **kwargs):
            self.available = False

        def __call__(self, *args, **kwargs):
            raise RuntimeError("PyTorch not available")

        def forward(self, x):
            raise RuntimeError("PyTorch not available")

        def export_to_onnx(self, output_path: str):
            raise RuntimeError("PyTorch not available")
