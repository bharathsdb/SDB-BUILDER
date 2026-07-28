"""
Cost Optimizer - Estimates construction costs and suggests optimizations.
"""

MATERIAL_COSTS = {
    "Economy": {"rate": 1800, "cement": 0.16, "steel": 0.22, "sand": 0.12,
                "aggregate": 0.10, "brick": 0.15, "flooring": 0.10, "labor": 0.15},
    "Standard": {"rate": 2500, "cement": 0.16, "steel": 0.21, "sand": 0.11,
                 "aggregate": 0.10, "brick": 0.14, "flooring": 0.13, "labor": 0.15},
    "Premium": {"rate": 3800, "cement": 0.15, "steel": 0.20, "sand": 0.10,
                "aggregate": 0.09, "brick": 0.12, "flooring": 0.19, "labor": 0.15},
    "Ultra Luxury": {"rate": 5500, "cement": 0.14, "steel": 0.18, "sand": 0.09,
                     "aggregate": 0.08, "brick": 0.10, "flooring": 0.26, "labor": 0.15},
}


class CostOptimizer:
    def estimate(self, rooms: list[dict], inputs: dict) -> dict:
        total_area = sum(r.get("width", 0) * r.get("length", 0) for r in rooms)
        budget = inputs.get("budget_tier", "Standard")
        rates = MATERIAL_COSTS.get(budget, MATERIAL_COSTS["Standard"])
        base_rate = rates["rate"]
        total_cost = total_area * base_rate

        estimate = {
            "total_area_sqft": round(total_area),
            "cost_per_sqft": base_rate,
            "foundation": round(total_cost * 0.18),
            "concrete": round(total_cost * rates["cement"] * 1000),
            "steel": round(total_cost * rates["steel"] * 80),
            "brick": round(total_cost * rates["brick"] * 100),
            "flooring": round(total_cost * rates["flooring"]),
            "plumbing": round(total_cost * 0.08),
            "electrical": round(total_cost * 0.08),
            "labor": round(total_cost * rates["labor"]),
            "contingency": round(total_cost * 0.05),
            "designFees": round(total_cost * 0.03),
            "total": round(total_cost),
        }

        score = 95.0 if inputs.get("variation_type") == "space_optimized" else 85.0

        return {
            "estimate": estimate,
            "score": score,
            "budget_tier": budget,
            "cost_breakdown": self._breakdown(total_cost),
        }

    def _breakdown(self, total: float) -> dict:
        return {
            "materials_percent": 52,
            "labor_percent": 25,
            "finishing_percent": 13,
            "services_percent": 10,
        }

    def optimize(self, estimate: dict, target_budget: float) -> dict:
        if estimate["estimate"]["total"] > target_budget:
            reduction_factor = target_budget / estimate["estimate"]["total"]
            optimized = estimate["estimate"].copy()
            for k in ["foundation", "concrete", "steel", "brick", "flooring",
                       "plumbing", "electrical", "labor", "contingency", "designFees", "total"]:
                if k in optimized:
                    optimized[k] = round(optimized[k] * reduction_factor)
            optimized["total_area_sqft"] = round(optimized["total_area_sqft"] * reduction_factor)
            return {"estimate": optimized, "optimized": True, "reduction": (1 - reduction_factor) * 100}
        return {"estimate": estimate["estimate"], "optimized": False, "reduction": 0}
