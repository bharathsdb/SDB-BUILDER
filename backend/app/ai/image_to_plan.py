"""
Image-to-2D/3D AI Pipeline - Analyzes images and generates architectural plans.
8-stage pipeline: Enhancement -> Object Detection -> Feature Detection -> Layout Reconstruction
-> 2D Generation -> 3D Generation -> Rendering -> Quality Validation

Supports: blueprints, hand-drawn sketches, house images, site images
"""
import cv2
import numpy as np
import uuid
import base64
import logging
import math
import json
from typing import Optional

logger = logging.getLogger(__name__)


class ImageToPlanPipeline:
    def __init__(self, pixel_to_feet: float = 0.15):
        self.pixel_to_feet = pixel_to_feet
        self.logs: list[str] = []
        self.stage_progress: dict[int, float] = {}

    def log(self, stage: int, message: str):
        self.logs.append(f"Stage {stage}: {message}")
        self.stage_progress[stage] = min(100, len(self.logs) * 5)

    def _img_from_bytes(self, image_bytes: bytes) -> np.ndarray | None:
        nparr = np.frombuffer(image_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    def analyze(self, image_bytes: bytes, image_type: str = "blueprint") -> dict:
        self.logs = []
        self.stage_progress = {}

        img = self._img_from_bytes(image_bytes)
        if img is None:
            return {"success": False, "error": "Invalid image", "logs": self.logs}

        h, w = img.shape[:2]
        self.log(1, f"Image loaded: {w}x{h}px, type={image_type}")

        if image_type == "sketch":
            return self._analyze_sketch(img, w, h)
        elif image_type == "house":
            return self._analyze_house(img, w, h)
        elif image_type == "site":
            return self.analyze_site_image(image_bytes)

        enhanced = self._stage1_enhance(img)
        objects = self._stage2_detect_objects(enhanced)
        features = self._stage3_detect_features(enhanced, objects, image_type)
        layout = self._stage4_reconstruct_layout(features, enhanced, image_type)
        plan_2d = self._stage5_generate_2d(layout, w, h)
        plan_3d = self._stage6_generate_3d(layout)
        renders = self._stage7_render(plan_2d, plan_3d, img, enhanced)
        quality = self._stage8_validate(layout, objects, features)

        return {
            "success": True,
            "imageType": image_type,
            "dimensions": {"width": w, "height": h},
            "rooms": layout["rooms"],
            "walls": layout["walls"],
            "doors": layout["doors"],
            "windows": layout["windows"],
            "annotations": features["annotations"],
            "dimensions_data": features["dimensions"],
            "confidence_scores": quality,
            "logs": self.logs,
            "stageProgress": self.stage_progress,
            "processedImage": plan_2d.get("base64"),
            "processedSvg": plan_2d.get("svg"),
            "scene": plan_3d.get("scene"),
            "glbBase64": plan_3d.get("glbBase64"),
            "suggestions": quality.get("suggestions", []),
            "overallScore": quality.get("overallScore", 70),
            "elevations": renders.get("elevations", {}),
        }

    def _analyze_sketch(self, img: np.ndarray, w: int, h: int) -> dict:
        self.log(1, "Running hand-drawn sketch analysis pipeline...")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)

        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                        cv2.THRESH_BINARY_INV, 7, 3)
        kernel = np.ones((2, 2), np.uint8)
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel)

        edges = cv2.Canny(cleaned, 30, 100)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=50,
                                minLineLength=20, maxLineGap=15)
        detected_lines = []
        if lines is not None:
            for line in lines:
                x1, y1, x2, y2 = line[0]
                detected_lines.append({"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)})

        self.log(2, f"Sketch cleanup complete. {len(detected_lines)} line segments detected.")

        closed_kernel = np.ones((5, 5), np.uint8)
        closed = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, closed_kernel)
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        rooms = []
        walls = []
        l_scale = self.pixel_to_feet
        room_count = 0

        for contour in contours:
            area = cv2.contourArea(contour)
            if area < 500:
                continue
            x, y, cw, ch = cv2.boundingRect(contour)
            room_w = round(cw * l_scale, 1)
            room_l = round(ch * l_scale, 1)
            room_area = round(room_w * room_l, 1)
            room_type = self._classify_room(room_w, room_l, area, h * w)
            room_name = f"{room_type.capitalize()} {room_count + 1}"
            color = self._room_color(room_type)
            room_count += 1
            rooms.append({
                "id": f"room_{uuid.uuid4().hex[:8]}",
                "name": room_name, "type": room_type,
                "x": float(round(x * l_scale, 1)), "y": float(round(y * l_scale, 1)),
                "width": float(room_w), "length": float(room_l),
                "area_sqft": float(room_area), "color": color,
                "angle": 0, "confidence": round(min(90, 40 + area / 3000), 1),
            })
            wt = 0.5
            walls.extend([
                {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": x * l_scale, "y1": y * l_scale,
                 "x2": (x + cw) * l_scale, "y2": y * l_scale, "thickness": wt},
                {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": x * l_scale, "y1": (y + ch) * l_scale,
                 "x2": (x + cw) * l_scale, "y2": (y + ch) * l_scale, "thickness": wt},
                {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": (x + cw) * l_scale, "y1": y * l_scale,
                 "x2": (x + cw) * l_scale, "y2": (y + ch) * l_scale, "thickness": wt},
                {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": x * l_scale, "y1": y * l_scale,
                 "x2": x * l_scale, "y2": (y + ch) * l_scale, "thickness": wt},
            ])

        if not rooms:
            self.log(4, "No rooms from sketch, using fallback grid.")
            rooms, walls = self._fallback_layout(h, w, l_scale)

        doors_placed = []
        for i in range(min(len(rooms), max(1, len(walls) // 4))):
            wall_idx = i % max(len(walls), 1)
            if walls:
                doors_placed.append({
                    "id": f"door_{uuid.uuid4().hex[:8]}",
                    "wallId": walls[wall_idx]["id"],
                    "position": float((i + 1) * 3), "width": 3.0, "height": 7.0,
                })

        windows_placed = []
        for i in range(min(len(rooms), max(1, len(walls) // 4))):
            wall_idx = (i + 2) % max(len(walls), 1)
            if walls:
                windows_placed.append({
                    "id": f"window_{uuid.uuid4().hex[:8]}",
                    "wallId": walls[wall_idx]["id"],
                    "position": float((i + 1) * 4), "width": 4.0, "height": 4.0,
                })

        annotations = []
        for wall in detected_lines[:10]:
            annotations.append({
                "x": float(wall["x1"]), "y": float(wall["y1"]),
                "width": float(abs(wall["x2"] - wall["x1"])),
                "height": float(abs(wall["y2"] - wall["y1"])),
                "estimated_text": "Wall line",
                "position_ft": {"x_feet": round(wall["x1"] * l_scale, 1),
                                "y_feet": round(wall["y1"] * l_scale, 1)},
            })

        plan_2d = self._stage5_generate_2d({"rooms": rooms, "walls": walls, "doors": doors_placed, "windows": windows_placed}, w, h)
        plan_3d = self._stage6_generate_3d({"rooms": rooms, "walls": walls, "doors": doors_placed, "windows": windows_placed})
        renders = self._stage7_render(plan_2d, plan_3d, img, img)

        dims = []
        for r in rooms:
            dims.append({
                "x1": 0, "y1": 0, "x2": 0, "y2": 0,
                "length_px": int(r["width"] / l_scale),
                "length_ft": r["width"],
                "orientation": "horizontal",
            })

        quality = {
            "roomDetection": min(85, 40 + len(rooms) * 10),
            "wallDetection": min(80, 30 + len(walls) * 2),
            "doorDetection": 50, "windowDetection": 50,
            "layoutCoherence": min(80, 40 + len(rooms) * 5),
            "architecturalQuality": 65,
            "overallScore": 68,
            "suggestions": [
                "Sketch analyzed successfully. Rooms and walls extracted.",
                "Consider using a blueprint for higher accuracy.",
                "You can edit the generated plan in the workspace.",
            ],
        }

        self.log(8, f"Sketch analysis complete. {len(rooms)} rooms detected.")

        return {
            "success": True,
            "imageType": "sketch",
            "dimensions": {"width": w, "height": h},
            "rooms": rooms, "walls": walls,
            "doors": doors_placed, "windows": windows_placed,
            "annotations": annotations, "dimensions_data": dims,
            "confidence_scores": quality, "logs": self.logs,
            "stageProgress": self.stage_progress,
            "processedImage": plan_2d.get("base64"),
            "processedSvg": plan_2d.get("svg"),
            "scene": plan_3d.get("scene"),
            "glbBase64": plan_3d.get("glbBase64"),
            "suggestions": quality.get("suggestions", []),
            "overallScore": quality.get("overallScore", 68),
            "elevations": renders.get("elevations", {}),
        }

    def _analyze_house(self, img: np.ndarray, w: int, h: int) -> dict:
        self.log(1, "Running house image analysis pipeline...")
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        sky_mask = cv2.inRange(hsv, (0, 0, 180), (180, 30, 255))
        veg_mask = cv2.inRange(hsv, (35, 40, 40), (85, 255, 255))
        building_mask = cv2.bitwise_not(cv2.bitwise_or(sky_mask, veg_mask))
        building_mask = cv2.morphologyEx(building_mask, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))

        contours, _ = cv2.findContours(building_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        building_contour = None
        max_area = 0
        for c in contours:
            area = cv2.contourArea(c)
            if area > max_area:
                max_area = area
                building_contour = c

        enhanced = self._stage1_enhance(img)
        l_scale = self.pixel_to_feet
        rooms = []
        walls = []

        if building_contour is not None:
            x, y, cw, ch = cv2.boundingRect(building_contour)
            total_w = round(cw * l_scale, 1)
            total_l = round(ch * l_scale, 1)

            grid_cols = 2
            grid_rows = 2
            cell_w = cw // grid_cols
            cell_h = ch // grid_rows

            room_types = [["living", "kitchen"], ["bedroom", "bathroom"]]
            room_count = 0
            for row in range(grid_rows):
                for col in range(grid_cols):
                    cx = x + col * cell_w
                    cy = y + row * cell_h
                    rw = round(cell_w * l_scale, 1)
                    rl = round(cell_h * l_scale, 1)
                    rtype = room_types[row][col]
                    room_count += 1
                    rooms.append({
                        "id": f"room_{uuid.uuid4().hex[:8]}",
                        "name": f"{rtype.capitalize()}",
                        "type": rtype,
                        "x": float(round(cx * l_scale, 1)),
                        "y": float(round(cy * l_scale, 1)),
                        "width": rw, "length": rl,
                        "area_sqft": round(rw * rl, 1),
                        "color": self._room_color(rtype),
                        "angle": 0, "confidence": round(65 + row * 5, 1),
                    })
                    wt = 0.5
                    walls.extend([
                        {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": cx * l_scale, "y1": cy * l_scale,
                         "x2": (cx + cell_w) * l_scale, "y2": cy * l_scale, "thickness": wt},
                        {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": cx * l_scale, "y1": (cy + cell_h) * l_scale,
                         "x2": (cx + cell_w) * l_scale, "y2": (cy + cell_h) * l_scale, "thickness": wt},
                        {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": (cx + cell_w) * l_scale, "y1": cy * l_scale,
                         "x2": (cx + cell_w) * l_scale, "y2": (cy + cell_h) * l_scale, "thickness": wt},
                        {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": cx * l_scale, "y1": cy * l_scale,
                         "x2": cx * l_scale, "y2": (cy + cell_h) * l_scale, "thickness": wt},
                    ])
            self.log(4, f"House analyzed: estimated {len(rooms)} rooms from building footprint.")
        else:
            self.log(4, "Could not isolate building, using full image grid.")
            rooms, walls = self._fallback_layout(h, w, l_scale)

        doors_placed = []
        for i, room in enumerate(rooms):
            wall_idx = i * 4 % max(len(walls), 1)
            if walls:
                doors_placed.append({
                    "id": f"door_{uuid.uuid4().hex[:8]}",
                    "wallId": walls[wall_idx]["id"],
                    "position": 3.0 + i, "width": 3.0, "height": 7.0,
                })

        windows_placed = []
        for i, room in enumerate(rooms):
            wall_idx = (i * 4 + 1) % max(len(walls), 1)
            if walls:
                windows_placed.append({
                    "id": f"window_{uuid.uuid4().hex[:8]}",
                    "wallId": walls[wall_idx]["id"],
                    "position": 4.0 + i, "width": 4.0, "height": 4.0,
                })

        veg_ratio = round(np.sum(veg_mask > 0) / (h * w) * 100, 1)

        plan_2d = self._stage5_generate_2d({"rooms": rooms, "walls": walls, "doors": doors_placed, "windows": windows_placed}, w, h)
        plan_3d = self._stage6_generate_3d({"rooms": rooms, "walls": walls, "doors": doors_placed, "windows": windows_placed})
        renders = self._stage7_render(plan_2d, plan_3d, img, enhanced)

        quality = {
            "roomDetection": min(75, 30 + len(rooms) * 8),
            "wallDetection": 60, "doorDetection": 40, "windowDetection": 40,
            "layoutCoherence": min(70, 30 + len(rooms) * 5),
            "architecturalQuality": 55,
            "overallScore": 60,
            "suggestions": [
                "House image analyzed with estimated room layout.",
                "Confidence is moderate. For best results, upload a blueprint.",
                f"Vegetation detected: {veg_ratio}% of image.",
                "You can manually edit rooms in the workspace.",
            ],
        }
        self.log(8, f"House analysis complete. Estimated {len(rooms)} rooms.")

        return {
            "success": True,
            "imageType": "house",
            "dimensions": {"width": w, "height": h},
            "rooms": rooms, "walls": walls,
            "doors": doors_placed, "windows": windows_placed,
            "annotations": [], "dimensions_data": [],
            "confidence_scores": quality, "logs": self.logs,
            "stageProgress": self.stage_progress,
            "processedImage": plan_2d.get("base64"),
            "processedSvg": plan_2d.get("svg"),
            "scene": plan_3d.get("scene"),
            "glbBase64": plan_3d.get("glbBase64"),
            "suggestions": quality.get("suggestions", []),
            "overallScore": quality.get("overallScore", 60),
            "elevations": renders.get("elevations", {}),
        }

    def _stage1_enhance(self, img: np.ndarray) -> np.ndarray:
        self.log(1, "Applying CLAHE contrast enhancement...")
        if len(img.shape) == 2 or img.shape[2] == 1:
            denoised = cv2.fastNlMeansDenoising(img, None, 10, 7, 21)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            return clahe.apply(denoised)
        else:
            denoised = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)
            lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            enhanced = cv2.merge((l, a, b))
            self.log(1, "Noise reduction and contrast enhancement complete.")
            return cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

    def _stage2_detect_objects(self, img: np.ndarray) -> dict:
        self.log(2, "Detecting structural objects (walls, rooms, openings)...")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)

        kernel = np.ones((3, 3), np.uint8)
        closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        line_contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=80,
                                minLineLength=30, maxLineGap=10)
        detected_lines = []
        if lines is not None:
            for line in lines:
                x1, y1, x2, y2 = line[0]
                detected_lines.append({"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)})

        self.log(2, f"Found {len(contours)} structural contours, {len(detected_lines)} wall lines.")
        return {
            "contours": contours, "line_contours": line_contours,
            "lines": detected_lines, "edge_mask": edges, "closed_mask": closed,
        }

    def _stage3_detect_features(self, img: np.ndarray, objects: dict, image_type: str = "blueprint") -> dict:
        self.log(3, "Detecting architectural features (doors, windows, symbols)...")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                        cv2.THRESH_BINARY_INV, 11, 2)

        circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, dp=1.2, minDist=20,
                                    param1=50, param2=30, minRadius=5, maxRadius=30)

        doors = []
        windows = []
        annotations = []
        dimensions_data = []

        if circles is not None:
            circles = np.round(circles[0, :]).astype(int)
            for i, (cx, cy, r) in enumerate(circles):
                if r < 10:
                    windows.append({"id": f"w_{i}", "cx": int(cx), "cy": int(cy), "radius": int(r)})
                else:
                    doors.append({"id": f"d_{i}", "cx": int(cx), "cy": int(cy), "radius": int(r)})

        text_contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        valid_annotations = []
        l_scale = self.pixel_to_feet
        for c in text_contours:
            area = cv2.contourArea(c)
            if 50 < area < 2000:
                x, y, cw, ch = cv2.boundingRect(c)
                aspect = cw / max(ch, 1)
                if 0.3 < aspect < 5.0:
                    valid_annotations.append({
                        "x": float(x), "y": float(y), "width": float(cw), "height": float(ch),
                        "estimated_text": f"Annot_{len(valid_annotations)+1}",
                        "position_ft": {"x_feet": round(x * l_scale, 1),
                                        "y_feet": round(y * l_scale, 1)},
                    })

        lines = objects.get("lines", [])
        for line in lines:
            dx = abs(line["x2"] - line["x1"])
            dy = abs(line["y2"] - line["y1"])
            length_px = max(dx, dy)
            if 50 < length_px < 800:
                dim_ft = round(length_px * l_scale, 1)
                dimensions_data.append({
                    "x1": line["x1"], "y1": line["y1"],
                    "x2": line["x2"], "y2": line["y2"],
                    "length_px": int(length_px), "length_ft": dim_ft,
                    "orientation": "horizontal" if dx > dy else "vertical",
                })

        self.log(3, f"Found {len(doors)} doors, {len(windows)} windows, "
                    f"{len(valid_annotations)} annotations, {len(dimensions_data)} dimensions.")
        return {
            "doors": doors, "windows": windows,
            "annotations": valid_annotations, "dimensions": dimensions_data,
        }

    def _stage4_reconstruct_layout(self, features: dict, img: np.ndarray, image_type: str) -> dict:
        self.log(4, "Reconstructing architectural layout from detected features...")
        h, w = img.shape[:2]
        l_scale = self.pixel_to_feet

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                        cv2.THRESH_BINARY_INV, 11, 2)
        kernel = np.ones((7, 7), np.uint8)
        closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        rooms = []
        walls = []
        room_count = 0

        for contour in contours:
            area = cv2.contourArea(contour)
            if area < 800:
                continue
            x, y, cw, ch = cv2.boundingRect(contour)
            room_w = round(cw * l_scale, 1)
            room_l = round(ch * l_scale, 1)
            room_area = round(room_w * room_l, 1)

            rect = cv2.minAreaRect(contour)
            angle = rect[2] if rect else 0
            room_type = self._classify_room(room_w, room_l, area, h * w)
            room_name = f"{room_type.capitalize()} {room_count + 1}"
            color = self._room_color(room_type)
            room_count += 1
            rooms.append({
                "id": f"room_{uuid.uuid4().hex[:8]}",
                "name": room_name, "type": room_type,
                "x": float(round(x * l_scale, 1)), "y": float(round(y * l_scale, 1)),
                "width": float(room_w), "length": float(room_l),
                "area_sqft": float(room_area), "color": color,
                "angle": float(round(angle, 1)),
                "confidence": round(min(95, 50 + area / 5000), 1),
            })
            wall_thickness = 0.5
            walls.extend([
                {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": x * l_scale, "y1": y * l_scale,
                 "x2": (x + cw) * l_scale, "y2": y * l_scale, "thickness": wall_thickness},
                {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": x * l_scale, "y1": (y + ch) * l_scale,
                 "x2": (x + cw) * l_scale, "y2": (y + ch) * l_scale, "thickness": wall_thickness},
                {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": (x + cw) * l_scale, "y1": y * l_scale,
                 "x2": (x + cw) * l_scale, "y2": (y + ch) * l_scale, "thickness": wall_thickness},
                {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": x * l_scale, "y1": y * l_scale,
                 "x2": x * l_scale, "y2": (y + ch) * l_scale, "thickness": wall_thickness},
            ])

        if not rooms:
            self.log(4, "No rooms detected with default method, attempting fallback...")
            rooms, walls = self._fallback_layout(h, w, l_scale)

        doors_placed = []
        exit_doors = features.get("doors", [])
        for i, d in enumerate(exit_doors):
            wall_idx = i % max(len(walls), 1)
            if walls:
                doors_placed.append({
                    "id": f"door_{uuid.uuid4().hex[:8]}",
                    "wallId": walls[wall_idx]["id"],
                    "position": float(d["cx"]) * l_scale,
                    "width": 3.0, "height": 7.0,
                })

        windows_placed = []
        wins = features.get("windows", [])
        for i, w in enumerate(wins):
            wall_idx = (i + 2) % max(len(walls), 1)
            if walls:
                windows_placed.append({
                    "id": f"window_{uuid.uuid4().hex[:8]}",
                    "wallId": walls[wall_idx]["id"],
                    "position": float(w["cx"]) * l_scale,
                    "width": 4.0, "height": 4.0,
                })

        if not doors_placed and rooms:
            for i in range(len(rooms)):
                wall_idx = (i * 4) % max(len(walls), 1)
                if walls:
                    doors_placed.append({
                        "id": f"door_{uuid.uuid4().hex[:8]}",
                        "wallId": walls[wall_idx]["id"],
                        "position": 3.0, "width": 3.0, "height": 7.0,
                    })

        if not windows_placed and rooms:
            for i in range(len(rooms)):
                wall_idx = (i * 4 + 1) % max(len(walls), 1)
                if walls:
                    windows_placed.append({
                        "id": f"window_{uuid.uuid4().hex[:8]}",
                        "wallId": walls[wall_idx]["id"],
                        "position": 4.0, "width": 4.0, "height": 4.0,
                    })

        self.log(4, f"Layout reconstructed: {len(rooms)} rooms, {len(walls)} walls, "
                    f"{len(doors_placed)} doors, {len(windows_placed)} windows.")
        return {
            "rooms": rooms, "walls": walls,
            "doors": doors_placed, "windows": windows_placed,
        }

    def _classify_room(self, w: float, l: float, area_px: float, total_px: float) -> str:
        area_ratio = area_px / max(total_px, 1)
        max_dim = max(w, l)
        min_dim = min(w, l)
        if area_ratio > 0.25:
            return "living"
        elif max_dim > 20:
            return "living" if w * l > 300 else "bedroom"
        elif w * l < 80:
            return "bathroom"
        elif min_dim < 6:
            return "circulation"
        else:
            return "bedroom"

    def _room_color(self, room_type: str) -> str:
        colors = {
            "living": "#f0fdf4", "kitchen": "#fef2f2", "bedroom": "#eff6ff",
            "bathroom": "#f8fafc", "dining": "#fefce8", "office": "#f5f3ff",
            "circulation": "#f1f5f9", "parking": "#f1f5f9", "garden": "#f0fdf4",
        }
        return colors.get(room_type, "#f8fafc")

    def _fallback_layout(self, h: int, w: int, l_scale: float) -> tuple:
        rooms = []
        walls = []
        grid_cols = 2
        grid_rows = 2
        cell_w = w // grid_cols
        cell_h = h // grid_rows

        for row in range(grid_rows):
            for col in range(grid_cols):
                cx = col * cell_w
                cy = row * cell_h
                rw = round(cell_w * l_scale, 1)
                rl = round(cell_h * l_scale, 1)
                room_type = "living" if (row == 0 and col == 0) else "bedroom" if row == 0 else "bathroom"
                rooms.append({
                    "id": f"room_{uuid.uuid4().hex[:8]}",
                    "name": f"{room_type.capitalize()} {row * grid_cols + col + 1}",
                    "type": room_type,
                    "x": round(cx * l_scale, 1), "y": round(cy * l_scale, 1),
                    "width": rw, "length": rl,
                    "area_sqft": round(rw * rl, 1),
                    "color": self._room_color(room_type),
                    "angle": 0, "confidence": 60.0,
                })
                wt = 0.5
                walls.extend([
                    {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": cx * l_scale, "y1": cy * l_scale,
                     "x2": (cx + cell_w) * l_scale, "y2": cy * l_scale, "thickness": wt},
                    {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": cx * l_scale, "y1": (cy + cell_h) * l_scale,
                     "x2": (cx + cell_w) * l_scale, "y2": (cy + cell_h) * l_scale, "thickness": wt},
                    {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": (cx + cell_w) * l_scale, "y1": cy * l_scale,
                     "x2": (cx + cell_w) * l_scale, "y2": (cy + cell_h) * l_scale, "thickness": wt},
                    {"id": f"wall_{uuid.uuid4().hex[:8]}", "x1": cx * l_scale, "y1": cy * l_scale,
                     "x2": cx * l_scale, "y2": (cy + cell_h) * l_scale, "thickness": wt},
                ])
        self.log(4, f"Fallback layout generated: {len(rooms)} rooms, {len(walls)} walls.")
        return rooms, walls

    def _stage5_generate_2d(self, layout: dict, orig_w: int, orig_h: int) -> dict:
        self.log(5, "Generating 2D floor plan visualization...")
        try:
            from PIL import Image, ImageDraw, ImageFont

            scale = 8.0
            margin = 40
            plot_w = max(400, int(orig_w * scale * self.pixel_to_feet) + margin * 2)
            plot_h = max(300, int(orig_h * scale * self.pixel_to_feet) + margin * 2)

            img = Image.new("RGB", (plot_w, plot_h), (255, 255, 255))
            draw = ImageDraw.Draw(img)

            draw.rectangle([margin, margin, plot_w - margin, plot_h - margin],
                           outline=(30, 30, 30), width=3)

            for room in layout["rooms"]:
                rx = int(room["x"] * scale) + margin
                ry = int(room["y"] * scale) + margin
                rw = max(20, int(room["width"] * scale))
                rh = max(20, int(room["length"] * scale))

                color_hex = room.get("color", "#f8fafc")
                color_rgb = tuple(int(color_hex[i:i+2], 16) for i in (1, 3, 5))
                draw.rectangle([rx, ry, rx + rw, ry + rh],
                               fill=color_rgb, outline=(80, 80, 80), width=2)
                draw.text((rx + 5, ry + 5), room["name"], fill=(30, 30, 30))
                dim = f"{room['width']}'x{room['length']}' ({room['area_sqft']}sqft)"
                draw.text((rx + 5, ry + 22), dim, fill=(100, 100, 100))

                door_color = (180, 130, 50)
                draw.arc([rx + rw - 20, ry + rh - 20, rx + rw, ry + rh],
                         0, 90, fill=door_color, width=3)
                win_color = (50, 130, 200)
                draw.line([rx + 10, ry, rx + rw - 10, ry], fill=win_color, width=4)

            for wall in layout["walls"]:
                sx = int(wall["x1"] * scale) + margin
                sy = int(wall["y1"] * scale) + margin
                ex = int(wall["x2"] * scale) + margin
                ey = int(wall["y2"] * scale) + margin
                draw.line([sx, sy, ex, ey], fill=(60, 60, 60), width=3)

            for i, room in enumerate(layout["rooms"]):
                rx = int(room["x"] * scale) + margin
                ry = int(room["y"] * scale) + margin
                rw = max(20, int(room["width"] * scale))
                rh = max(20, int(room["length"] * scale))
                draw.line([rx, ry - 8, rx + rw, ry - 8], fill=(200, 50, 50), width=1)
                draw.text((rx + rw // 2 - 15, ry - 22), f"{room['width']}'", fill=(200, 50, 50))
                draw.line([rx - 8, ry, rx - 8, ry + rh], fill=(200, 50, 50), width=1)
                if ry + rh // 2 > 20:
                    draw.text((rx - 30, ry + rh // 2 - 5), f"{room['length']}'", fill=(200, 50, 50))

            _, encoded = cv2.imencode(".png", np.array(img))
            b64 = base64.b64encode(encoded).decode("utf-8")

            svg_parts = [
                f'<svg xmlns="http://www.w3.org/2000/svg" width="{plot_w}" height="{plot_h}" '
                f'viewBox="0 0 {plot_w} {plot_h}">'
            ]
            svg_parts.append(
                f'<rect x="{margin}" y="{margin}" width="{plot_w - 2*margin}" '
                f'height="{plot_h - 2*margin}" fill="none" stroke="#1e293b" stroke-width="3"/>'
            )
            for room in layout["rooms"]:
                rx = room["x"] * scale + margin
                ry = room["y"] * scale + margin
                rw = max(20, room["width"] * scale)
                rh = max(20, room["length"] * scale)
                svg_parts.append(
                    f'<rect x="{rx}" y="{ry}" width="{rw}" height="{rh}" '
                    f'fill="{room.get("color", "#f8fafc")}" stroke="#555" stroke-width="2" rx="2"/>'
                )
                svg_parts.append(
                    f'<text x="{rx + 5}" y="{ry + 15}" font-family="sans-serif" '
                    f'font-size="11" font-weight="bold" fill="#1e293b">{room["name"]}</text>'
                )
                svg_parts.append(
                    f'<text x="{rx + 5}" y="{ry + 28}" font-family="sans-serif" '
                    f'font-size="9" fill="#64748b">{room["width"]}\'x{room["length"]}\'</text>'
                )
            svg_parts.append("</svg>")

            self.log(5, "2D floor plan generated successfully.")
            return {"base64": f"data:image/png;base64,{b64}", "svg": "\n".join(svg_parts)}
        except ImportError:
            self.log(5, "Pillow not available, skipping 2D render.")
            return {"base64": None, "svg": None}

    def _stage6_generate_3d(self, layout: dict) -> dict:
        self.log(6, "Generating 3D model data from layout...")
        scene = {
            "version": "1.0",
            "metadata": {"generator": "PlanCraftAI Image-to-3D"},
            "scene": {"elements": [], "materials": []},
        }
        glb_bytes = None

        for room in layout["rooms"]:
            rx = room["x"]
            ry = 0
            rz = room["y"]
            rw = room["width"]
            rd = room["length"]
            rh = 10.0

            scene["scene"]["elements"].append({
                "type": "box", "position": [rx + rw / 2, -0.1, rz + rd / 2],
                "size": [rw, 0.2, rd],
                "material": {"color": room.get("color", "#e0e0e0"), "type": "standard"},
                "roomId": room["id"], "roomName": room["name"], "roomType": room["type"],
            })

            wall_t = 0.5
            walls_def = [
                ([rw, rh, wall_t], [rx + rw / 2, rh / 2, rz], "#f0f0f0"),
                ([rw, rh, wall_t], [rx + rw / 2, rh / 2, rz + rd], "#f0f0f0"),
                ([wall_t, rh, rd], [rx + rw, rh / 2, rz + rd / 2], "#f0f0f0"),
                ([wall_t, rh, rd], [rx, rh / 2, rz + rd / 2], "#f0f0f0"),
            ]
            for size, pos, color in walls_def:
                scene["scene"]["elements"].append({
                    "type": "box", "position": list(pos), "size": list(size),
                    "material": {"color": color, "type": "standard"},
                    "roomId": room["id"],
                })

            scene["scene"]["elements"].append({
                "type": "box", "position": [rx + rw / 2, rh, rz + rd / 2],
                "size": [rw, 0.2, rd],
                "material": {"color": "#d0d0d0", "type": "standard"},
                "roomId": room["id"],
            })

            scene["scene"]["elements"].append({
                "type": "box", "position": [rx + rw, rh / 2, rz + rd / 2],
                "size": [0.1, 6, 3],
                "material": {"color": "#8B4513", "type": "standard"},
                "roomId": room["id"], "elementType": "door",
            })

            scene["scene"]["elements"].append({
                "type": "box", "position": [rx + rw / 2, rh / 2, rz],
                "size": [4, 4, 0.1],
                "material": {"color": "#87CEEB", "type": "standard", "opacity": 0.6},
                "roomId": room["id"], "elementType": "window",
            })

        try:
            import trimesh
            mesh_scene = trimesh.Scene()
            for room in layout["rooms"]:
                rx, rz_base, rw_, rd_ = room["x"], room["y"], room["width"], room["length"]
                rh_ = 10.0

                floor = trimesh.creation.box(extents=[rw_, 0.2, rd_])
                floor.visual.face_colors = [200, 200, 200, 255]
                mesh_scene.add_geometry(
                    floor,
                    transform=trimesh.transformations.translation_matrix(
                        [rx + rw_ / 2, -0.1, rz_base + rd_ / 2]
                    ),
                )
                wt = 0.5
                for size, pos in [
                    ([rw_, rh_, wt], [rx + rw_ / 2, rh_ / 2, rz_base]),
                    ([rw_, rh_, wt], [rx + rw_ / 2, rh_ / 2, rz_base + rd_]),
                    ([wt, rh_, rd_], [rx + rw_, rh_ / 2, rz_base + rd_ / 2]),
                    ([wt, rh_, rd_], [rx, rh_ / 2, rz_base + rd_ / 2]),
                ]:
                    wall = trimesh.creation.box(extents=size)
                    wall.visual.face_colors = [240, 240, 240, 255]
                    mesh_scene.add_geometry(
                        wall, transform=trimesh.transformations.translation_matrix(pos)
                    )

                roof = trimesh.creation.box(extents=[rw_, 0.3, rd_])
                roof.visual.face_colors = [180, 160, 140, 255]
                mesh_scene.add_geometry(
                    roof,
                    transform=trimesh.transformations.translation_matrix(
                        [rx + rw_ / 2, rh_, rz_base + rd_ / 2]
                    ),
                )

            glb_bytes = mesh_scene.export(file_type="glb")
            glb_b64 = base64.b64encode(glb_bytes).decode("utf-8")
            self.log(6, "3D model (GLB) generated successfully.")
            return {"scene": scene, "glbBase64": glb_b64}
        except ImportError:
            self.log(6, "trimesh not available, returning scene data only.")
            return {"scene": scene, "glbBase64": None}

    def _stage7_render(self, plan_2d: dict, plan_3d: dict,
                       original: np.ndarray, enhanced: np.ndarray) -> dict:
        self.log(7, "Generating elevation views and renders...")
        elevations = {}
        try:
            h, w = original.shape[:2]
            elevations["top"] = plan_2d.get("base64")

            gray = cv2.cvtColor(enhanced, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            edges_colored = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
            front = cv2.addWeighted(enhanced, 0.7, edges_colored, 0.3, 0)
            _, front_enc = cv2.imencode(".png", front)
            elevations["front"] = f"data:image/png;base64,{base64.b64encode(front_enc).decode('utf-8')}"

            side = cv2.rotate(front, cv2.ROTATE_90_CLOCKWISE)
            _, side_enc = cv2.imencode(".png", side)
            elevations["side"] = f"data:image/png;base64,{base64.b64encode(side_enc).decode('utf-8')}"

            bird = cv2.resize(enhanced, (w // 2, h // 2))
            bird_gray = cv2.cvtColor(bird, cv2.COLOR_BGR2GRAY)
            _, bird_thresh = cv2.threshold(bird_gray, 128, 255, cv2.THRESH_BINARY)
            bird_color = cv2.cvtColor(bird_thresh, cv2.COLOR_GRAY2BGR)
            _, bird_enc = cv2.imencode(".png", bird_color)
            elevations["birdsEye"] = f"data:image/png;base64,{base64.b64encode(bird_enc).decode('utf-8')}"

            self.log(7, "All elevation views generated.")
        except Exception as e:
            self.log(7, f"Elevation generation partially failed: {e}")

        return {"elevations": elevations}

    def _stage8_validate(self, layout: dict, objects: dict, features: dict) -> dict:
        self.log(8, "Validating generated plan quality...")
        scores = {}
        suggestions = []

        room_count = len(layout["rooms"])
        wall_count = len(layout["walls"])
        door_count = len(layout["doors"])
        window_count = len(layout["windows"])

        if room_count > 0:
            scores["roomDetection"] = min(95, 50 + room_count * 10)
        else:
            scores["roomDetection"] = 10
            suggestions.append("No rooms detected. Try uploading a clearer image.")

        scores["wallDetection"] = min(90, 40 + wall_count * 2) if wall_count > 0 else 20
        scores["doorDetection"] = min(85, 30 + door_count * 15) if door_count > 0 else 30
        scores["windowDetection"] = min(85, 30 + window_count * 15) if window_count > 0 else 30
        scores["layoutCoherence"] = min(95, 60 + room_count * 5) if room_count >= 2 else 40
        scores["architecturalQuality"] = round(
            (scores.get("roomDetection", 0) + scores.get("wallDetection", 0) +
             scores.get("layoutCoherence", 0)) / 3, 1)

        if door_count < room_count:
            suggestions.append(
                f"Consider adding {room_count - door_count} more door(s) for proper access.")
        if window_count < room_count:
            suggestions.append(
                f"Add {room_count - window_count} more window(s) for natural lighting.")
        if scores["roomDetection"] < 50:
            suggestions.append(
                "For better results, upload a high-contrast blueprint or sketch.")

        suggestions.append("AI analysis complete. You can edit the generated plan in the workspace.")
        scores["suggestions"] = suggestions
        scores["overallScore"] = round(
            (scores.get("roomDetection", 0) * 0.3 +
             scores.get("wallDetection", 0) * 0.2 +
             scores.get("architecturalQuality", 0) * 0.3 +
             scores.get("layoutCoherence", 0) * 0.2), 1)

        self.log(8, f"Quality validation complete. Overall score: {scores['overallScore']}/100.")
        return scores

    def analyze_site_image(self, image_bytes: bytes) -> dict:
        self.logs = []
        self.stage_progress = {}
        img = self._img_from_bytes(image_bytes)
        if img is None:
            return {"success": False, "error": "Invalid image"}

        h, w = img.shape[:2]
        self.log(1, f"Site image loaded: {w}x{h}px")
        enhanced = self._stage1_enhance(img)
        gray = cv2.cvtColor(enhanced, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)
        edges = cv2.Canny(blurred, 30, 100)
        kernel = np.ones((5, 5), np.uint8)
        closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        l_scale = self.pixel_to_feet
        largest_contour = None
        max_area = 0
        for c in contours:
            area = cv2.contourArea(c)
            if area > max_area:
                max_area = area
                largest_contour = c

        plot_boundary = None
        if largest_contour is not None:
            x, y, cw, ch = cv2.boundingRect(largest_contour)
            plot_boundary = {
                "x": int(x), "y": int(y), "width": int(cw), "height": int(ch),
                "width_ft": round(cw * l_scale, 1),
                "length_ft": round(ch * l_scale, 1),
                "area_sqft": round(cw * ch * l_scale * l_scale, 1),
            }

        buildable_area = None
        if plot_boundary:
            buildable_area = {
                "width_ft": round(plot_boundary["width_ft"] * 0.6, 1),
                "length_ft": round(plot_boundary["length_ft"] * 0.6, 1),
                "area_sqft": round(plot_boundary["area_sqft"] * 0.6, 1),
                "max_coverage": "60%",
            }

        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        green_mask = cv2.inRange(hsv, (35, 40, 40), (85, 255, 255))
        vegetation_ratio = round(np.sum(green_mask > 0) / (h * w) * 100, 1)
        terrain_type = "vegetated" if vegetation_ratio > 30 else "clear" if vegetation_ratio < 10 else "mixed"

        suggestions = []
        if plot_boundary:
            suggestions.append(
                f"Buildable area: {buildable_area['area_sqft']} sqft (60% coverage).")
            if terrain_type == "vegetated":
                suggestions.append(
                    "Site has significant vegetation. Consider clearing before construction.")
            suggestions.append(
                "Suggested building orientation: South-facing for optimal light.")

        self.log(4, f"Site analysis complete. Plot: {plot_boundary['width_ft']}x{plot_boundary['length_ft']}ft "
                    f"if plot_boundary else 'N/A'.")

        return {
            "success": True,
            "plotBoundary": plot_boundary,
            "buildableArea": buildable_area,
            "suggestedPlacement": {
                "x_ft": round(plot_boundary["width_ft"] * 0.2, 1) if plot_boundary else 0,
                "y_ft": round(plot_boundary["length_ft"] * 0.2, 1) if plot_boundary else 0,
                "orientation": "South",
                "setback_front": 10, "setback_back": 8, "setback_sides": 5,
            } if plot_boundary else None,
            "terrainType": terrain_type,
            "vegetationCoverage": vegetation_ratio,
            "confidenceScores": {
                "boundaryDetection": round(min(95, 60 + (max_area / (h * w)) * 40)),
                "terrainAnalysis": round(70 + (30 if terrain_type != "mixed" else 0)),
            },
            "logs": self.logs,
        }
