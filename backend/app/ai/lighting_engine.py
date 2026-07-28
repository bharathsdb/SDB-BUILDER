"""
Lighting Engine - Analyzes natural daylighting based on orientation.
"""


class LightingEngine:
    def analyze(self, rooms: list[dict], facing: str, windows: list[dict]) -> dict:
        favorable_facings = ["East", "North"]
        base = 90.0 if facing in favorable_facings else 82.0

        window_factor = min(len(windows) * 3, 10)
        score = base + window_factor

        return {
            "score": round(min(100, score), 1),
            "favorable_orientation": facing in favorable_facings,
            "window_count": len(windows),
            "natural_light_hours": self._estimate_sunlight(facing),
            "recommendations": self._recommendations(score, facing),
        }

    def _estimate_sunlight(self, facing: str) -> dict:
        estimates = {
            "East": {"morning": 6, "afternoon": 2, "total": 8},
            "West": {"morning": 2, "afternoon": 6, "total": 8},
            "North": {"morning": 4, "afternoon": 4, "total": 8},
            "South": {"morning": 5, "afternoon": 5, "total": 10},
        }
        return estimates.get(facing, {"morning": 4, "afternoon": 4, "total": 8})

    def _recommendations(self, score: float, facing: str) -> list[str]:
        recs = []
        if score < 80:
            if facing == "North":
                recs.append("Consider adding skylights to increase natural light")
            elif facing == "West":
                recs.append("Use reflective surfaces to bounce light deeper into rooms")
            recs.append("Use lighter color schemes to maximize light reflection")
        return recs
