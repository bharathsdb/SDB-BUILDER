"""
Space Planner - Divides plot into functional zones based on requirements.
"""


class SpacePlanner:
    VASTU_ZONES = {
        "northeast": (0, 0, 33, 33),
        "northwest": (0, 66, 33, 33),
        "southeast": (66, 0, 33, 33),
        "southwest": (66, 66, 33, 33),
        "center": (33, 33, 33, 33),
        "north": (0, 33, 33, 33),
        "east": (33, 0, 33, 33),
        "west": (33, 66, 33, 33),
        "south": (66, 33, 33, 33),
    }

    def plan_zones(self, inputs: dict) -> list[dict]:
        plot_w = inputs.get("plot_width", 40)
        plot_l = inputs.get("plot_length", 60)

        zones = [
            {"name": "Living Area", "zone": "northeast", "type": "living",
             "preferred_size": 0.25, "min_size": 200},
            {"name": "Master Suite", "zone": "southwest", "type": "bedroom",
             "preferred_size": 0.15, "min_size": 180},
            {"name": "Kitchen Area", "zone": "southeast", "type": "kitchen",
             "preferred_size": 0.10, "min_size": 100},
            {"name": "Bedrooms Area", "zone": "west", "type": "bedroom",
             "preferred_size": 0.20, "min_size": 250},
            {"name": "Bathrooms Area", "zone": "northwest", "type": "bathroom",
             "preferred_size": 0.08, "min_size": 60},
            {"name": "Dining Area", "zone": "east", "type": "dining",
             "preferred_size": 0.10, "min_size": 120},
            {"name": "Circulation", "zone": "center", "type": "circulation",
             "preferred_size": 0.12, "min_size": 0},
        ]

        total_area = plot_w * plot_l
        for zone in zones:
            zone["target_area"] = max(zone["min_size"], total_area * zone["preferred_size"])

        if inputs.get("garden"):
            zones.append({"name": "Garden", "zone": "north", "type": "garden",
                          "preferred_size": 0.08, "min_size": 100,
                          "target_area": total_area * 0.08})

        return zones

    def get_zone_coordinates(self, zone_name: str, plot_w: float, plot_l: float) -> dict:
        vals = self.VASTU_ZONES.get(zone_name, (0, 0, 50, 50))
        return {
            "x": plot_w * vals[0] / 100,
            "y": plot_l * vals[1] / 100,
            "width": plot_w * vals[2] / 100,
            "length": plot_l * vals[3] / 100,
        }
