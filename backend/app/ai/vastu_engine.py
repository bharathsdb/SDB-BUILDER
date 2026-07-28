"""
Vastu Engine - Applies Vastu Shastra principles to room placement and scoring.
"""

VASTU_RULES = {
    "Master Bedroom": {"best": "Southwest", "alt": "South", "score_weight": 25},
    "Kitchen": {"best": "Southeast", "alt": "Northwest", "score_weight": 25},
    "Living Room": {"best": "Northeast", "alt": "North", "score_weight": 15},
    "Pooja Room": {"best": "Northeast", "alt": "East", "score_weight": 15},
    "Bathrooms": {"best": "Northwest", "alt": "West", "score_weight": 10},
    "Entrance": {"best": "East", "alt": "Northeast", "score_weight": 10},
    "Master Bedroom": {"best": "Southwest", "alt": "South", "score_weight": 25},
}

VASTU_DIRECTION_MAP = {
    "master_bedroom": {"East": "Southeast", "West": "Southwest", "North": "Northwest", "South": "Southwest"},
    "kitchen": {"East": "Southeast", "West": "West", "North": "East", "South": "Southeast"},
    "living_room": {"East": "North", "West": "North", "North": "North", "South": "East"},
    "pooja_room": {"East": "Northeast", "West": "North", "North": "Northeast", "South": "East"},
    "bathroom": {"East": "West", "West": "West", "North": "Northwest", "South": "West"},
}

ZONE_POSITIONS = {
    "Northeast": (0, 0), "North": (0, 1), "Northwest": (0, 2),
    "East": (1, 0), "Center": (1, 1), "West": (1, 2),
    "Southeast": (2, 0), "South": (2, 1), "Southwest": (2, 2),
}


class VastuEngine:
    def apply_vastu(self, rooms: list[dict], facing: str) -> list[dict]:
        for room in rooms:
            room_id = room["id"]
            for prefix, dirs in VASTU_DIRECTION_MAP.items():
                if prefix in room_id:
                    target_dir = dirs.get(facing, "North")
                    pos = ZONE_POSITIONS.get(target_dir, (1, 1))
                    room["vastu_direction"] = target_dir
                    room["vastu_zone"] = pos
                    break
            if "vastu_direction" not in room:
                room["vastu_direction"] = "Center"
                room["vastu_zone"] = (1, 1)
        return rooms

    def score_rooms(self, rooms: list[dict], facing: str) -> dict:
        total_score = 0
        max_score = 0
        room_scores = []

        for room in rooms:
            room_name = room.get("name", "")
            rule = None
            for key, val in VASTU_RULES.items():
                if key in room_name or any(k in room.get("id", "") for k in ["master", "kitchen", "pooja"]):
                    if "master" in room.get("id", "") and "Master" in key:
                        rule = val
                    elif key.lower().replace(" ", "_") in room.get("id", ""):
                        rule = val
                    break

            if rule is None:
                for key, val in VASTU_RULES.items():
                    if key.lower() in room_name.lower():
                        rule = val
                        break

            if rule:
                max_score += rule["score_weight"]
                vastu_dir = room.get("vastu_direction", "")
                if vastu_dir == rule["best"]:
                    total_score += rule["score_weight"]
                    room_scores.append({"room": room_name, "score": 100, "position": "optimal"})
                elif vastu_dir == rule["alt"]:
                    total_score += rule["score_weight"] * 0.6
                    room_scores.append({"room": room_name, "score": 60, "position": "acceptable"})
                else:
                    room_scores.append({"room": room_name, "score": 30, "position": "suboptimal"})

        overall = (total_score / max_score * 100) if max_score > 0 else 80

        return {
            "score": round(min(100, overall), 1),
            "room_scores": room_scores,
            "vastu_compliant": overall >= 70,
        }
