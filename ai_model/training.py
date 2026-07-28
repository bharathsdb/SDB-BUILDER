"""
PlanCraft AI - Training Pipeline

Supports future fine-tuning with PyTorch.
Model architecture for learning room layout optimization.
"""

import json
import math
import random
from dataclasses import dataclass, field
from typing import Optional

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("PyTorch not available. Install with: pip install torch")


@dataclass
class TrainingExample:
    plot_length: float
    plot_width: float
    facing: str
    budget_tier: str
    style: str
    bedrooms: int
    bathrooms: int
    kitchens: int
    floors: int
    vastu: bool
    room_layouts: list[dict]
    scores: dict


# Training data schema / sample generator
def generate_synthetic_data(num_samples: int = 1000) -> list[TrainingExample]:
    data = []
    facings = ["East", "West", "North", "South"]
    styles = ["Modern", "Contemporary", "Scandinavian", "Mediterranean", "Farmhouse"]
    budgets = ["Economy", "Standard", "Premium", "Ultra Luxury"]

    for _ in range(num_samples):
        plot_l = random.uniform(30, 100)
        plot_w = random.uniform(20, 80)
        facing = random.choice(facings)
        style = random.choice(styles)
        budget = random.choice(budgets)
        beds = random.randint(1, 5)
        baths = random.randint(1, 4)
        kitchens = 1
        floors = random.randint(1, 3)
        vastu = random.choice([True, False])

        rooms = []
        area_used = 0
        max_area = plot_l * plot_w * 0.6

        for i in range(beds):
            w = random.uniform(10, 18)
            l = random.uniform(12, 20)
            area = w * l
            if area_used + area < max_area:
                rooms.append({"name": f"Bedroom {i+1}", "width": round(w, 1),
                              "length": round(l, 1), "type": "bedroom", "area": round(area)})
                area_used += area

        for i in range(baths):
            w = random.uniform(5, 9)
            l = random.uniform(6, 10)
            area = w * l
            if area_used + area < max_area:
                rooms.append({"name": f"Bathroom {i+1}", "width": round(w, 1),
                              "length": round(l, 1), "type": "bathroom", "area": round(area)})
                area_used += area

        if area_used + 180 < max_area:
            rooms.append({"name": "Living Room", "width": 15, "length": 20,
                          "type": "living", "area": 300})
            area_used += 300

        if area_used + 120 < max_area:
            rooms.append({"name": "Kitchen", "width": 10, "length": 12,
                          "type": "kitchen", "area": 120})
            area_used += 120

        coverage = area_used / max_area if max_area > 0 else 0.5
        scores = {
            "space_score": min(100, coverage * 120),
            "ventilation_score": min(100, beds * 15 + 20),
            "vastu_score": 85 if vastu else 60,
            "cost_score": random.uniform(60, 95),
            "efficiency_score": min(100, (1 - abs((plot_l / plot_w) - 1.5) / 2.5) * 100),
        }

        data.append(TrainingExample(
            plot_length=round(plot_l, 1),
            plot_width=round(plot_w, 1),
            facing=facing, budget_tier=budget, style=style,
            bedrooms=beds, bathrooms=baths, kitchens=kitchens,
            floors=floors, vastu=vastu,
            room_layouts=rooms, scores=scores,
        ))

    return data


if TORCH_AVAILABLE:
    class LayoutPredictor(nn.Module):
        """Neural network for predicting optimal room layout parameters."""

        def __init__(self, input_dim: int = 12, hidden_dim: int = 128):
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
                nn.Linear(hidden_dim // 4, 5),
                nn.Sigmoid(),
            )

        def forward(self, x):
            return self.net(x)

    class LayoutDataset(torch.utils.data.Dataset):
        def __init__(self, data: list[TrainingExample]):
            self.examples = data

        def __len__(self):
            return len(self.examples)

        def __getitem__(self, idx):
            ex = self.examples[idx]
            facing_map = {"East": 0, "West": 1, "North": 2, "South": 3}
            style_map = {"Modern": 0, "Contemporary": 1, "Scandinavian": 2,
                         "Mediterranean": 3, "Farmhouse": 4}
            budget_map = {"Economy": 0, "Standard": 1, "Premium": 2, "Ultra Luxury": 3}

            features = torch.tensor([
                ex.plot_length / 100, ex.plot_width / 80, facing_map.get(ex.facing, 0) / 3,
                budget_map.get(ex.budget_tier, 1) / 3, style_map.get(ex.style, 0) / 4,
                ex.bedrooms / 5, ex.bathrooms / 4, ex.kitchens / 2, ex.floors / 3,
                1.0 if ex.vastu else 0.0,
                len(ex.room_layouts) / 10,
                sum(r["area"] for r in ex.room_layouts) / 5000,
            ], dtype=torch.float32)

            target = torch.tensor([
                ex.scores.get("space_score", 50) / 100,
                ex.scores.get("ventilation_score", 50) / 100,
                ex.scores.get("vastu_score", 50) / 100,
                ex.scores.get("cost_score", 50) / 100,
                ex.scores.get("efficiency_score", 50) / 100,
            ], dtype=torch.float32)

            return features, target

    def train_model(data: list[TrainingExample], epochs: int = 50, batch_size: int = 32):
        dataset = LayoutDataset(data)
        loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)
        model = LayoutPredictor()
        criterion = nn.MSELoss()
        optimizer = optim.Adam(model.parameters(), lr=0.001)

        print(f"Training on {len(data)} examples for {epochs} epochs...")
        for epoch in range(epochs):
            total_loss = 0
            for features, targets in loader:
                optimizer.zero_grad()
                outputs = model(features)
                loss = criterion(outputs, targets)
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
            if (epoch + 1) % 10 == 0:
                print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(loader):.4f}")

        torch.save(model.state_dict(), "ai_model/data/layout_predictor.pth")
        print("Model saved to ai_model/data/layout_predictor.pth")
        return model

    def evaluate_model(model, data: list[TrainingExample]) -> dict:
        dataset = LayoutDataset(data)
        loader = torch.utils.data.DataLoader(dataset, batch_size=32)
        model.eval()
        total_loss = 0
        with torch.no_grad():
            for features, targets in loader:
                outputs = model(features)
                loss = nn.MSELoss()(outputs, targets)
                total_loss += loss.item()
        return {"mse": total_loss / len(loader)}

else:
    def train_model(data, epochs=50, batch_size=32):
        print("PyTorch not available. Install with: pip install torch")
        return None

    def evaluate_model(model, data):
        return {"error": "PyTorch not available"}


if __name__ == "__main__":
    print("Generating synthetic training data...")
    data = generate_synthetic_data(100)

    output_path = "ai_model/data/training_data.json"
    serializable = [
        {
            "plot_length": ex.plot_length,
            "plot_width": ex.plot_width,
            "facing": ex.facing,
            "budget_tier": ex.budget_tier,
            "style": ex.style,
            "bedrooms": ex.bedrooms,
            "bathrooms": ex.bathrooms,
            "kitchens": ex.kitchens,
            "floors": ex.floors,
            "vastu": ex.vastu,
            "rooms": ex.room_layouts,
            "scores": ex.scores,
        }
        for ex in data
    ]
    with open(output_path, "w") as f:
        json.dump(serializable, f, indent=2)
    print(f"Generated {len(data)} training examples -> {output_path}")

    if TORCH_AVAILABLE:
        model = train_model(data, epochs=20)
        eval_result = evaluate_model(model, data)
        print(f"Evaluation: {eval_result}")
    else:
        print("Training data saved. Install PyTorch to train the neural model.")
