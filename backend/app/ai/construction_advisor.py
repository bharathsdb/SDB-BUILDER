"""
Construction Advisor - Provides construction methodology and sequencing advice.
"""


class ConstructionAdvisor:
    def advise(self, rooms: list[dict], inputs: dict) -> dict:
        total_area = sum(r.get("width", 0) * r.get("length", 0) for r in rooms)
        floors = inputs.get("floors", 1)
        budget = inputs.get("budget_tier", "Standard")

        phases = self._generate_phases(total_area, floors)

        return {
            "total_estimated_time_months": self._estimate_duration(total_area, floors),
            "construction_phases": phases,
            "foundation_type": self._recommend_foundation(floors, inputs.get("style", "Modern")),
            "structural_system": self._recommend_structure(floors, budget),
            "recommendations": self._recommendations(floors, budget),
        }

    def _generate_phases(self, area: float, floors: int) -> list[dict]:
        months_per_floor = max(2, area / 2000)
        phases = [
            {"phase": 1, "name": "Site Preparation & Foundation", "duration_weeks": 4},
            {"phase": 2, "name": "Ground Floor Structure", "duration_weeks": max(6, months_per_floor * 2)},
        ]
        if floors > 1:
            for f in range(1, floors):
                phases.append({
                    "phase": f + 2,
                    "name": f"Floor {f + 1} Structure",
                    "duration_weeks": max(4, months_per_floor * 1.5),
                })
        phases.append({
            "phase": len(phases) + 1,
            "name": "Roofing & Waterproofing",
            "duration_weeks": 3,
        })
        phases.append({
            "phase": len(phases) + 1,
            "name": "Finishing & Interiors",
            "duration_weeks": max(4, months_per_floor * 2),
        })
        return phases

    def _estimate_duration(self, area: float, floors: int) -> int:
        return max(6, round(area * floors / 500))

    def _recommend_foundation(self, floors: int, style: str) -> str:
        if floors <= 2:
            return "Shallow Foundation (Isolated Footing)"
        return "Deep Foundation (Pile Foundation)"

    def _recommend_structure(self, floors: int, budget: str) -> str:
        if budget in ["Premium", "Ultra Luxury"]:
            return "RC Frame Structure with Shear Walls"
        return "Load Bearing Masonry / RC Frame"

    def _recommendations(self, floors: int, budget: str) -> list[str]:
        recs = []
        recs.append("Use M20 grade concrete for all structural elements")
        if floors > 2:
            recs.append("Earthquake-resistant design with seismic bands at each floor level")
        if budget in ["Economy", "Standard"]:
            recs.append("Optimize column spacing to reduce material costs")
        recs.append("Ensure proper curing of concrete for minimum 14 days")
        return recs
