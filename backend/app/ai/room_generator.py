import math


class RoomGenerator:
    RECOMMENDED_SIZES = {
        "Living Room": {"w": 16, "l": 22, "min_w": 12, "min_l": 16},
        "Master Bedroom": {"w": 14, "l": 16, "min_w": 12, "min_l": 14},
        "Bedroom": {"w": 12, "l": 14, "min_w": 10, "min_l": 12},
        "Kitchen": {"w": 10, "l": 12, "min_w": 8, "min_l": 10},
        "Dining Room": {"w": 12, "l": 14, "min_w": 10, "min_l": 12},
        "Bathroom": {"w": 6, "l": 8, "min_w": 5, "min_l": 7},
        "Pooja Room": {"w": 6, "l": 6, "min_w": 5, "min_l": 5},
        "Parking": {"w": 10, "l": 18, "min_w": 9, "min_l": 16},
        "Corridor": {"w": 4, "l": 8, "min_w": 3, "min_l": 6},
        "Garden": {"w": 10, "l": 10, "min_w": 8, "min_l": 8},
    }

    def generate_rooms(self, inputs: dict, zones: list[dict]) -> list[dict]:
        rooms = []
        plot_w = inputs.get("plot_width", 40)
        plot_l = inputs.get("plot_length", 60)
        bedrooms_count = inputs.get("bedrooms", 3)
        bathrooms_count = inputs.get("bathrooms", 2)
        kitchens_count = inputs.get("kitchens", 1)
        parking_count = inputs.get("parking", 1)
        garden = inputs.get("garden", False)

        # Master Bedroom
        sizes = self.RECOMMENDED_SIZES["Master Bedroom"]
        w = min(sizes["w"], plot_w * 0.4)
        l = min(sizes["l"], plot_l * 0.3)
        rooms.append(self._make_room("master_bedroom", "Master Bedroom", w, l, 0,
                                     type="bedroom", color="#e0f2fe"))

        # Additional Bedrooms
        for i in range(1, bedrooms_count):
            sizes = self.RECOMMENDED_SIZES["Bedroom"]
            w = min(sizes["w"], plot_w * 0.35)
            l = min(sizes["l"], plot_l * 0.25)
            level = 1 if inputs.get("floors", 1) > 1 and i >= 2 else 0
            rooms.append(self._make_room(f"bedroom_{i+1}", f"Bedroom {i+1}", w, l, level,
                                         type="bedroom", color="#faf5ff"))

        # Kitchen
        sizes = self.RECOMMENDED_SIZES["Kitchen"]
        w = min(sizes["w"], plot_w * 0.3)
        l = min(sizes["l"], plot_l * 0.25)
        rooms.append(self._make_room("kitchen", "Kitchen", w, l, 0, type="kitchen", color="#fee2e2"))

        # Living Room
        sizes = self.RECOMMENDED_SIZES["Living Room"]
        w = min(sizes["w"], plot_w * 0.45)
        l = min(sizes["l"], plot_l * 0.4)
        rooms.append(self._make_room("living_room", "Living Room", w, l, 0,
                                     type="living", color="#f0fdf4"))

        # Dining Room
        sizes = self.RECOMMENDED_SIZES["Dining Room"]
        w = min(sizes["w"], plot_w * 0.3)
        l = min(sizes["l"], plot_l * 0.3)
        rooms.append(self._make_room("dining_room", "Dining Room", w, l, 0,
                                     type="dining", color="#fef3c7"))

        # Bathrooms
        for i in range(bathrooms_count):
            sizes = self.RECOMMENDED_SIZES["Bathroom"]
            level = 0 if i == 0 else (1 if inputs.get("floors", 1) > 1 else 0)
            rooms.append(self._make_room(f"bathroom_{i+1}", f"Bathroom {i+1}",
                                         sizes["w"], sizes["l"], level,
                                         type="bathroom", color="#f1f5f9"))

        # Pooja Room (if Vastu)
        if inputs.get("vastu"):
            sizes = self.RECOMMENDED_SIZES["Pooja Room"]
            rooms.append(self._make_room("pooja_room", "Pooja Room",
                                         sizes["w"], sizes["l"], 0,
                                         type="pooja", color="#fef3c7"))

        # Parking
        for i in range(parking_count):
            sizes = self.RECOMMENDED_SIZES["Parking"]
            rooms.append(self._make_room(f"parking_{i+1}", f"Parking {i+1}",
                                         sizes["w"], sizes["l"], 0,
                                         type="parking", color="#e5e7eb"))

        # Garden
        if garden:
            sizes = self.RECOMMENDED_SIZES["Garden"]
            rooms.append(self._make_room("garden", "Garden",
                                         sizes["w"], sizes["l"], 0,
                                         type="garden", color="#dcfce7"))

        return rooms

    def _make_room(self, id: str, name: str, width: float, length: float,
                   level: int, type: str, color: str) -> dict:
        return {
            "id": id,
            "name": name,
            "width": round(width, 1),
            "length": round(length, 1),
            "level": level,
            "type": type,
            "color": color,
            "x": 0.0,
            "y": 0.0,
            "area": round(width * length, 1),
        }
