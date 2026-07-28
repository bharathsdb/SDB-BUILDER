"""
Layout Optimizer - Places rooms, doors, windows in optimal positions.
Uses a non-overlapping packing algorithm to prevent rooms from stacking.
"""
import math


class LayoutOptimizer:
    def optimize(self, rooms: list[dict], inputs: dict) -> list[dict]:
        plot_w = inputs.get("plot_width", 40)
        plot_l = inputs.get("plot_length", 60)
        facing = inputs.get("facing", "East")
        variation = inputs.get("variation_type", "space_optimized")

        # Priority order for placement
        PRIORITY = {
            "living": 0, "dining": 1, "kitchen": 2,
            "master_bedroom": 3, "bedroom": 4,
            "bathroom": 5, "pooja": 6, "parking": 7, "garden": 8,
        }

        def sort_key(r):
            t = r.get("type", "other")
            if "master" in r.get("id", ""):
                t = "master_bedroom"
            
            # Introduce variation-based sorting
            offset = 0
            if variation == "eco_friendly":
                if t == "bedroom": offset = -1
                if t == "bathroom": offset = -2
            elif variation == "vastu_compliant":
                if t == "pooja": offset = -4
                if t == "kitchen": offset = -1

            return PRIORITY.get(t, 99) + offset

        sorted_rooms = sorted(rooms, key=sort_key)

        # Vastu-preferred anchor quadrants (row, col) in a 3-row × 2-col grid
        # row 0=North, row 2=South; col 0=West, col 1=East
        ANCHOR = {
            "living":          (1, 0),
            "dining":          (1, 1),
            "kitchen":         (2, 1),  # SE = Vastu for kitchen
            "master_bedroom":  (2, 0),  # SW = Vastu for master
            "bedroom":         (0, 0),  # NW for secondary bedrooms
            "bathroom":        (0, 0),  # NW
            "pooja":           (0, 1),  # NE
            "parking":         (0, 0),
            "garden":          (0, 0),
        }

        SETBACK = 2.0  # ft from plot boundary
        MIN_GAP = 1.0  # ft between rooms

        # Track placed bounding boxes: list of (x, y, w, l)
        placed: list[tuple[float, float, float, float]] = []

        def overlaps(x, y, w, l) -> bool:
            for px, py, pw, pl in placed:
                if (x < px + pw + MIN_GAP and x + w + MIN_GAP > px and
                        y < py + pl + MIN_GAP and y + l + MIN_GAP > py):
                    return True
            return False

        def find_position(w, l, preferred_x, preferred_y) -> tuple[float, float]:
            """Try preferred position first, then scan in a grid for a free spot."""
            step = 2.0
            
            # Add slight offsets based on variation to break symmetry
            if variation == "eco_friendly":
                preferred_x += step
                preferred_y -= step
            elif variation == "vastu_compliant":
                preferred_y += step

            # Try preferred position and nearby offsets in spiral
            for dx in [0, step, -step, step * 2, -step * 2, step * 3]:
                for dy in [0, step, -step, step * 2, -step * 2, step * 3]:
                    tx = max(SETBACK, min(preferred_x + dx, plot_w - w - SETBACK))
                    ty = max(SETBACK, min(preferred_y + dy, plot_l - l - SETBACK))
                    if not overlaps(tx, ty, w, l):
                        return tx, ty

            # Full grid scan fallback
            x = SETBACK
            while x + w <= plot_w - SETBACK:
                y = SETBACK
                while y + l <= plot_l - SETBACK:
                    if not overlaps(x, y, w, l):
                        return x, y
                    y += step
                x += step

            # Last resort: clamp to valid plot area
            return SETBACK, SETBACK

        row_h = (plot_l - 2 * SETBACK) / 3
        col_w = (plot_w - 2 * SETBACK) / 2

        bedroom_count = 0

        for room in sorted_rooms:
            rtype = room.get("type", "other")
            rid = room.get("id", "")
            is_master = "master" in rid

            anchor_key = "master_bedroom" if is_master else rtype
            anchor = ANCHOR.get(anchor_key, (1, 1))

            pref_x = SETBACK + anchor[1] * col_w
            pref_y = SETBACK + anchor[0] * row_h

            # Stagger secondary bedrooms vertically
            if rtype == "bedroom" and not is_master:
                pref_y += bedroom_count * (row_h * 0.4)
                bedroom_count += 1

            # Clamp dimensions to fit inside plot
            w = min(room["width"], col_w - MIN_GAP)
            l = min(room["length"], row_h - MIN_GAP)
            w = max(w, 4.0)
            l = max(l, 4.0)

            x, y = find_position(w, l, pref_x, pref_y)

            room["x"] = round(x, 1)
            room["y"] = round(y, 1)
            room["width"] = round(w, 1)
            room["length"] = round(l, 1)
            room["area"] = round(w * l, 1)

            placed.append((x, y, w, l))

        # Apply facing rotation: for South/West facing, mirror rooms horizontally
        if facing in ["South", "West"]:
            for room in sorted_rooms:
                room["x"] = round(plot_w - room["x"] - room["width"], 1)

        # Write back in original order
        room_map = {r["id"]: r for r in sorted_rooms}
        for r in rooms:
            updated = room_map.get(r["id"])
            if updated:
                r.update(updated)

        return rooms

    def create_layout(self, rooms: list[dict], inputs: dict) -> dict:
        return {
            "rooms": rooms,
            "plot_width": inputs.get("plot_width", 40),
            "plot_length": inputs.get("plot_length", 60),
        }

    def place_doors(self, layout: dict) -> list[dict]:
        doors = []
        for room in layout["rooms"]:
            door = {
                "room_id": room["id"],
                "wall": "South" if room["y"] < layout["plot_length"] / 2 else "North",
                "position": round(room["width"] / 2, 1),
                "width": 3.0,
                "height": 7.0,
            }
            doors.append(door)
        return doors

    def place_windows(self, layout: dict, facing: str) -> list[dict]:
        windows = []
        for room in layout["rooms"]:
            preferred_wall = "East" if room["x"] < layout["plot_width"] / 2 else "West"
            if facing in ["East", "North"]:
                preferred_wall = "East" if room["x"] < layout["plot_width"] * 0.6 else "West"
            window = {
                "room_id": room["id"],
                "wall": preferred_wall,
                "position": round(room["length"] / 2, 1),
                "width": 4.0,
                "height": 4.0,
                "type": "sliding",
            }
            windows.append(window)
        return windows
