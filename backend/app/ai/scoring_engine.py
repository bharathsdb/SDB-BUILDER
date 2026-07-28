"""
Scoring Engine - Evaluates overall plan quality across multiple dimensions.
"""


class ScoringEngine:
    def evaluate(self, rooms: list[dict], ventilation: dict, lighting: dict,
                 cost: dict, vastu: dict, inputs: dict) -> dict:
        space_score = self._score_space(rooms, inputs)
        vent_score = ventilation["score"]
        light_score = lighting["score"]
        cost_score = cost["score"]
        vastu_score = vastu["score"]
        efficiency_score = self._score_efficiency(rooms, inputs)

        overall = (space_score + vent_score + light_score + cost_score +
                   vastu_score + efficiency_score) / 6

        return {
            "space_score": round(space_score, 1),
            "ventilation_score": round(vent_score, 1),
            "lighting_score": round(light_score, 1),
            "cost_score": round(cost_score, 1),
            "vastu_score": round(vastu_score, 1),
            "efficiency_score": round(efficiency_score, 1),
            "overall_score": round(overall, 1),
        }

    def _score_space(self, rooms: list[dict], inputs: dict) -> float:
        if not rooms:
            return 50.0
        plot_area = inputs.get("plot_width", 40) * inputs.get("plot_length", 60)
        built_up = sum(r.get("width", 0) * r.get("length", 0) for r in rooms)
        coverage = built_up / plot_area if plot_area > 0 else 0
        score = min(100, coverage * 120)
        if inputs.get("variation_type") == "space_optimized":
            score += 5
        return max(0, min(100, score))

    def _score_efficiency(self, rooms: list[dict], inputs: dict) -> float:
        plot_l = inputs.get("plot_length", 60)
        plot_w = inputs.get("plot_width", 40)
        aspect = plot_l / plot_w if plot_w > 0 else 1
        efficiency = min(100, (1 - abs(aspect - 1.5) / 2.5) * 100)
        if inputs.get("space_optimized", False):
            efficiency += 10
        return min(100, efficiency)
