"""
Ventilation Engine - Analyzes cross-ventilation and air exchange.
"""


class VentilationEngine:
    def analyze(self, rooms: list[dict], windows: list[dict], inputs: dict) -> dict:
        total_rooms = len(rooms)
        rooms_with_windows = len(set(w["room_id"] for w in windows))

        has_cross = rooms_with_windows >= total_rooms * 0.6 if total_rooms > 0 else False
        openable_windows = rooms_with_windows * 2

        score = 88.0 if has_cross else 72.0
        if inputs.get("floors", 1) > 1:
            score += 5.0  # Stack effect improves ventilation

        return {
            "score": round(min(100, score), 1),
            "cross_ventilation": has_cross,
            "rooms_with_windows": rooms_with_windows,
            "total_rooms": total_rooms,
            "openable_windows": openable_windows,
            "air_changes_per_hour": 2.5 if has_cross else 1.2,
            "recommendations": self._recommendations(score, rooms_with_windows, total_rooms),
        }

    def _recommendations(self, score: float, rooms_with_windows: int, total: int) -> list[str]:
        recs = []
        if score < 80:
            missing = total - rooms_with_windows
            if missing > 0:
                recs.append(f"Add windows to {missing} room(s) without natural ventilation")
            recs.append("Consider installing exhaust fans in bathrooms and kitchen")
        if rooms_with_windows > 0:
            recs.append("Ensure windows are positioned on opposite walls for cross-ventilation")
        return recs
