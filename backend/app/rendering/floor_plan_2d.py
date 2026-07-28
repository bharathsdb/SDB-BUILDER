"""
2D Floor Plan Renderer - Generates PNG and SVG floor plan images.
"""
import math
import os
try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

import logging

logger = logging.getLogger(__name__)

COLORS = {
    "bedroom": (224, 242, 254),
    "kitchen": (254, 226, 226),
    "living": (240, 253, 244),
    "dining": (254, 243, 199),
    "bathroom": (241, 245, 249),
    "pooja": (254, 243, 199),
    "parking": (229, 231, 235),
    "garden": (220, 252, 231),
    "circulation": (248, 250, 252),
    "default": (248, 250, 252),
}


class FloorPlan2DRenderer:
    def __init__(self, scale: float = 5.0):
        self.scale = scale
        self.margin = 50

    def render(self, project, rooms, output_path: str):
        if not PIL_AVAILABLE:
            logger.warning("Pillow not available, skipping PNG render")
            return
        
        width = int(project.plot_width * self.scale) + self.margin * 2
        height = int(project.plot_length * self.scale) + self.margin * 2
        
        img = Image.new("RGB", (width, height), (255, 255, 255))
        draw = ImageDraw.Draw(img)
        
        # Draw plot boundary
        draw.rectangle(
            [self.margin, self.margin, width - self.margin, height - self.margin],
            outline=(0, 0, 0), width=3,
        )
        
        # Draw rooms
        for room in rooms:
            rx = int(room.x * self.scale) + self.margin
            ry = int(room.y * self.scale) + self.margin
            rw = int(room.width * self.scale)
            rh = int(room.length * self.scale)
            
            color = COLORS.get(getattr(room, 'room_type', 'default'), COLORS["default"])
            draw.rectangle([rx, ry, rx + rw, ry + rh], fill=color, outline=(100, 100, 100), width=2)
            
            label = room.name
            draw.text((rx + 5, ry + 5), label, fill=(50, 50, 50))
            
            dim = f"{room.width}'x{room.length}'"
            draw.text((rx + 5, ry + 20), dim, fill=(100, 100, 100))
        
        # Draw title
        draw.text((10, 10), f"PlanCraftAI - {project.name}", fill=(0, 0, 0))
        
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        img.save(output_path, "PNG")

    def render_svg(self, project, rooms, output_path: str):
        try:
            import svgwrite
        except ImportError:
            logger.warning("svgwrite not available, skipping SVG render")
            return
        
        width = int(project.plot_width * self.scale) + self.margin * 2
        height = int(project.plot_length * self.scale) + self.margin * 2
        
        dwg = svgwrite.Drawing(output_path, size=(width, height))
        
        dwg.add(dwg.rect(
            insert=(self.margin, self.margin),
            size=(width - self.margin * 2, height - self.margin * 2),
            fill="none", stroke="black", stroke_width=3,
        ))
        
        for room in rooms:
            rx = room.x * self.scale + self.margin
            ry = room.y * self.scale + self.margin
            rw = room.width * self.scale
            rh = room.length * self.scale
            
            color = COLORS.get(getattr(room, 'room_type', 'default'), COLORS["default"])
            hex_color = "#{:02x}{:02x}{:02x}".format(*color)
            
            dwg.add(dwg.rect(
                insert=(rx, ry), size=(rw, rh),
                fill=hex_color, stroke="gray", stroke_width=1,
            ))
            dwg.add(dwg.text(room.name, insert=(rx + 5, ry + 15), font_size=10))
            dwg.add(dwg.text(f"{room.width}'x{room.length}'", insert=(rx + 5, ry + 30), font_size=8))
        
        dwg.save()
