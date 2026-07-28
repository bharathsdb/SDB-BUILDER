"""
Training Pipeline for LayoutPredictor
Generates synthetic data, trains model, and exports to ONNX.
"""
import json
import random
import os
import logging

logger = logging.getLogger(__name__)

try:
    import torch
    import torch.optim as optim
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


def generate_synthetic_data(num_samples: int = 1000) -> list:
    data = []
    facings = ["East", "West", "North", "South"]
    styles = ["Modern", "Contemporary", "Scandinavian", "Mediterranean", "Farmhouse"]
    budgets = ["Economy", "Standard", "Premium", "Ultra Luxury"]

    for _ in range(num_samples):
        ex = {
            "plot_length": round(random.uniform(30, 100), 1),
            "plot_width": round(random.uniform(20, 80), 1),
            "facing": random.choice(facings),
            "style": random.choice(styles),
            "budget_tier": random.choice(budgets),
            "bedrooms": random.randint(1, 5),
            "bathrooms": random.randint(1, 4),
            "kitchens": 1,
            "floors": random.randint(1, 3),
            "vastu": random.choice([True, False]),
            "rooms": [],
            "scores": {},
        }

        area_used = 0
        max_area = ex["plot_length"] * ex["plot_width"] * 0.6

        for i in range(ex["bedrooms"]):
            w, l = random.uniform(10, 18), random.uniform(12, 20)
            area = w * l
            if area_used + area < max_area:
                ex["rooms"].append({"name": f"Bedroom {i+1}", "width": round(w, 1), "length": round(l, 1), "area": round(area)})
                area_used += area

        for i in range(ex["bathrooms"]):
            w, l = random.uniform(5, 9), random.uniform(6, 10)
            area = w * l
            if area_used + area < max_area:
                ex["rooms"].append({"name": f"Bathroom {i+1}", "width": round(w, 1), "length": round(l, 1), "area": round(area)})
                area_used += area

        if area_used + 300 < max_area:
            ex["rooms"].append({"name": "Living Room", "width": 16, "length": 22, "area": 352})
            area_used += 352

        if area_used + 120 < max_area:
            ex["rooms"].append({"name": "Kitchen", "width": 10, "length": 12, "area": 120})
            area_used += 120

        coverage = area_used / max_area if max_area > 0 else 0.5
        ex["scores"] = {
            "space_score": min(100, coverage * 120),
            "ventilation_score": min(100, ex["bedrooms"] * 15 + 20),
            "vastu_score": 85 if ex["vastu"] else 60,
            "cost_score": random.uniform(60, 95),
            "efficiency_score": min(100, (1 - abs((ex["plot_length"] / ex["plot_width"]) - 1.5) / 2.5) * 100),
        }
        data.append(ex)

    return data


def train_model(data: list, epochs: int = 50, batch_size: int = 32, model_dir: str = "ai_model/data"):
    if not TORCH_AVAILABLE:
        logger.warning("PyTorch not available. Cannot train model.")
        return None

    from app.ai.ml.model import LayoutPredictor, LayoutDataset

    os.makedirs(model_dir, exist_ok=True)

    dataset = LayoutDataset(data)
    loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)
    model = LayoutPredictor()
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    logger.info(f"Training on {len(data)} examples for {epochs} epochs...")
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
            logger.info(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(loader):.4f}")

    # Save PyTorch model
    pt_path = os.path.join(model_dir, "layout_predictor.pth")
    torch.save(model.state_dict(), pt_path)
    logger.info(f"PyTorch model saved to {pt_path}")

    # Export to ONNX
    try:
        onnx_path = os.path.join(model_dir, "layout_predictor.onnx")
        model.export_to_onnx(onnx_path)
    except Exception as e:
        logger.warning(f"ONNX export failed: {e}")

    return model


def evaluate_model(model, data: list) -> dict:
    if not TORCH_AVAILABLE:
        return {"error": "PyTorch not available"}

    from app.ai.ml.model import LayoutDataset

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


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Generating synthetic training data...")
    data = generate_synthetic_data(200)

    output_path = "ai_model/data/training_data.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    logger.info(f"Training data saved to {output_path}")

    model = train_model(data, epochs=30)
    if model:
        eval_result = evaluate_model(model, data)
        logger.info(f"Evaluation: {eval_result}")
