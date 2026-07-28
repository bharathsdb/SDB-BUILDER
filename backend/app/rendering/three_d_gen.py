"""
3D Generation Engine - Creates 3D building meshes from floor plan data.
"""
import json
import os
import base64
import logging

logger = logging.getLogger(__name__)


class ThreeDGenerator:
    def generate_scene(self, rooms: list[dict], floors: int = 1) -> dict:
        scene = {
            "version": "1.0",
            "metadata": {"generator": "PlanCraftAI 3D Engine"},
            "scene": {
                "elements": [],
                "materials": [],
            },
        }
        
        for room in rooms:
            rx = room.get("x", 0)
            ry = 0
            rz = room.get("y", 0)
            rw = room.get("width", 10)
            rd = room.get("length", 10)
            height = room.get("height", 10)
            
            # Floor
            floor = {
                "type": "box",
                "position": [rx + rw / 2, -0.1, rz + rd / 2],
                "size": [rw, 0.2, rd],
                "material": {"color": "#e0e0e0", "type": "standard"},
            }
            scene["scene"]["elements"].append(floor)
            
            # Walls
            wall_thickness = 0.5
            wall_height = height * 1.0
            
            walls = [
                ([rw, wall_height, wall_thickness], [rx + rw / 2, wall_height / 2, rz]),
                ([rw, wall_height, wall_thickness], [rx + rw / 2, wall_height / 2, rz + rd]),
                ([wall_thickness, wall_height, rd], [rx + rw, wall_height / 2, rz + rd / 2]),
                ([wall_thickness, wall_height, rd], [rx, wall_height / 2, rz + rd / 2]),
            ]
            
            for size, pos in walls:
                wall = {
                    "type": "box",
                    "position": pos,
                    "size": size,
                    "material": {"color": "#f0f0f0", "type": "standard"},
                }
                scene["scene"]["elements"].append(wall)
            
            # Ceiling for top floor
            if room.get("level", 0) == floors - 1:
                ceiling = {
                    "type": "box",
                    "position": [rx + rw / 2, wall_height, rz + rd / 2],
                    "size": [rw, 0.2, rd],
                    "material": {"color": "#d0d0d0", "type": "standard"},
                }
                scene["scene"]["elements"].append(ceiling)
        
        return scene

    def generate_glb(self, rooms: list[dict]) -> bytes:
        try:
            import trimesh
            import numpy as np
            
            scene = trimesh.Scene()
            
            for room in rooms:
                rx = room.get("x", 0)
                rz = room.get("y", 0)
                rw = room.get("width", 10)
                rd = room.get("length", 10)
                
                floor = trimesh.creation.box(extents=[rw, 0.2, rd])
                floor.visual.face_colors = [200, 200, 200, 255]
                scene.add_geometry(
                    floor,
                    transform=trimesh.transformations.translation_matrix([rx + rw / 2, -0.1, rz + rd / 2]),
                )
                
                wall_t = 0.5
                wh = 10.0
                
                for size, pos in [
                    ([rw, wh, wall_t], [rx + rw / 2, wh / 2, rz]),
                    ([rw, wh, wall_t], [rx + rw / 2, wh / 2, rz + rd]),
                    ([wall_t, wh, rd], [rx + rw, wh / 2, rz + rd / 2]),
                    ([wall_t, wh, rd], [rx, wh / 2, rz + rd / 2]),
                ]:
                    wall = trimesh.creation.box(extents=size)
                    wall.visual.face_colors = [240, 240, 240, 255]
                    scene.add_geometry(
                        wall,
                        transform=trimesh.transformations.translation_matrix(pos),
                    )
            
            return scene.export(file_type="glb")
        except ImportError:
            logger.warning("trimesh not available, returning empty bytes")
            return b""

    def generate_roof(self, rooms: list[dict], roof_type: str = "flat") -> dict:
        if roof_type == "flat":
            return {
                "type": "flat",
                "thickness": 0.5,
                "insulation": True,
                "waterproofing": True,
            }
        elif roof_type == "pitched":
            return {
                "type": "pitched",
                "pitch": 30,
                "overhang": 2.0,
                "material": "clay_tiles",
            }
        return {"type": "flat"}
