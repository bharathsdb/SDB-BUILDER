import os
import uuid
import base64
import re
from typing import Dict, Any, Tuple
import logging
from app.ai.engine import ArchitectEngine
from app.rendering.floor_plan_2d import FloorPlan2DRenderer
from app.rendering.three_d_gen import ThreeDGenerator

logger = logging.getLogger(__name__)

class AIImageGenerator:
    def __init__(self):
        self.engine = ArchitectEngine()
        self.renderer_2d = FloorPlan2DRenderer()
        self.generator_3d = ThreeDGenerator()
        
        # Ensure temp dir exists for rendering
        self.temp_dir = os.path.join("uploads", "temp")
        os.makedirs(self.temp_dir, exist_ok=True)

    def parse_prompt(self, prompt: str) -> Dict[str, Any]:
        """Extracts parameters from the user's text prompt using heuristic rules."""
        prompt_lower = prompt.lower()
        
        # Default parameters
        params = {
            "name": "AI Generated Model",
            "description": prompt,
            "plotLength": 50,
            "plotWidth": 40,
            "facing": "East",
            "floors": 1,
            "budgetTier": "Standard",
            "style": "Modern",
            "vastu": True,
            "preferences": {
                "openPlan": True,
                "luxury": False
            }
        }
        
        # Extract style
        styles = ["modern", "contemporary", "scandinavian", "mediterranean", "farmhouse", "minimalist"]
        for style in styles:
            if style in prompt_lower:
                params["style"] = style.capitalize()
                break
                
        # Extract rooms (e.g. "3 bedroom", "2bhk")
        bedrooms_match = re.search(r'(\d+)\s*(?:bedroom|bhk|bed)', prompt_lower)
        if bedrooms_match:
            # We don't have direct input for bedrooms in ArchitectEngine yet, but we can set description
            pass
            
        # Extract dimensions (e.g. "40x60" or "40 x 60")
        dim_match = re.search(r'(\d+)\s*[xX*]\s*(\d+)', prompt_lower)
        if dim_match:
            val1, val2 = int(dim_match.group(1)), int(dim_match.group(2))
            params["plotWidth"] = min(val1, val2)
            params["plotLength"] = max(val1, val2)
            
        # Extract facing
        facings = ["north", "south", "east", "west"]
        for f in facings:
            if f"{f} facing" in prompt_lower or f"{f}-facing" in prompt_lower:
                params["facing"] = f.capitalize()
                break
                
        return params

    def generate_2d(self, prompt: str) -> Dict[str, Any]:
        """Generates 2D PNG and SVG representations from a prompt."""
        params = self.parse_prompt(prompt)
        
        # Generate internal layout
        plan_result = self.engine.generate_plan(params)
        if not plan_result.get("success"):
            return {"success": False, "error": "Failed to generate layout"}
            
        project = plan_result["plan"]
        rooms = plan_result["rooms"]
        
        temp_id = uuid.uuid4().hex
        png_path = os.path.join(self.temp_dir, f"{temp_id}.png")
        svg_path = os.path.join(self.temp_dir, f"{temp_id}.svg")
        
        try:
            self.renderer_2d.render(project, rooms, png_path)
            self.renderer_2d.render_svg(project, rooms, svg_path)
            
            # Read files to base64
            png_base64 = ""
            if os.path.exists(png_path):
                with open(png_path, "rb") as f:
                    png_base64 = f"data:image/png;base64,{base64.b64encode(f.read()).decode('utf-8')}"
                    
            svg_base64 = ""
            if os.path.exists(svg_path):
                with open(svg_path, "rb") as f:
                    svg_base64 = f"data:image/svg+xml;base64,{base64.b64encode(f.read()).decode('utf-8')}"
                    
            return {
                "success": True,
                "pngBase64": png_base64,
                "svgBase64": svg_base64,
                "rooms": [r.to_dict() if hasattr(r, 'to_dict') else r for r in rooms]
            }
            
        finally:
            # Cleanup
            if os.path.exists(png_path):
                os.remove(png_path)
            if os.path.exists(svg_path):
                os.remove(svg_path)

    def generate_3d(self, prompt: str) -> Dict[str, Any]:
        """Generates a 3D scene and GLB from a prompt."""
        params = self.parse_prompt(prompt)
        
        # Generate internal layout
        plan_result = self.engine.generate_plan(params)
        if not plan_result.get("success"):
            return {"success": False, "error": "Failed to generate layout"}
            
        rooms = plan_result["rooms"]
        # Convert rooms to dicts if they are objects
        rooms_dict = [r.to_dict() if hasattr(r, 'to_dict') else r.__dict__ if hasattr(r, '__dict__') else r for r in rooms]
        
        # Convert any Decimal to float in rooms_dict
        for r in rooms_dict:
            for k, v in r.items():
                if hasattr(v, 'quantize'):  # Decimal check
                    r[k] = float(v)
        
        scene = self.generator_3d.generate_scene(rooms_dict, floors=params.get("floors", 1))
        glb_bytes = self.generator_3d.generate_glb(rooms_dict)
        
        glb_base64 = ""
        if glb_bytes:
            glb_base64 = base64.b64encode(glb_bytes).decode('utf-8')
            
        # Basic mock elevations since we don't have a real 3D render engine
        # In a real app we would render these from the 3D scene
        elevations = {
            "front": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmYWZjIi8+PHRleHQgeD0iNTAiIHk9IjEwMCIgZmlsbD0iIzY0NzQ4YiI+RnJvbnQgRWxldmF0aW9uPC90ZXh0Pjwvc3ZnPg==",
            "side": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmYWZjIi8+PHRleHQgeD0iNTAiIHk9IjEwMCIgZmlsbD0iIzY0NzQ4YiI+U2lkZSBFbGV2YXRpb248L3RleHQ+PC9zdmc+"
        }
        
        return {
            "success": True,
            "scene": scene,
            "glbBase64": glb_base64,
            "elevations": elevations,
            "rooms": rooms_dict
        }

    def generate_both(self, prompt: str) -> Dict[str, Any]:
        """Generates both 2D and 3D assets."""
        params = self.parse_prompt(prompt)
        
        plan_result = self.engine.generate_plan(params)
        if not plan_result.get("success"):
            return {"success": False, "error": "Failed to generate layout"}
            
        project = plan_result["plan"]
        rooms = plan_result["rooms"]
        rooms_dict = [r.to_dict() if hasattr(r, 'to_dict') else r.__dict__ if hasattr(r, '__dict__') else r for r in rooms]
        
        for r in rooms_dict:
            for k, v in r.items():
                if hasattr(v, 'quantize'):  # Decimal check
                    r[k] = float(v)
        
        # 2D Generation
        temp_id = uuid.uuid4().hex
        png_path = os.path.join(self.temp_dir, f"{temp_id}.png")
        svg_path = os.path.join(self.temp_dir, f"{temp_id}.svg")
        
        png_base64 = ""
        svg_base64 = ""
        try:
            self.renderer_2d.render(project, rooms, png_path)
            self.renderer_2d.render_svg(project, rooms, svg_path)
            
            if os.path.exists(png_path):
                with open(png_path, "rb") as f:
                    png_base64 = f"data:image/png;base64,{base64.b64encode(f.read()).decode('utf-8')}"
                    
            if os.path.exists(svg_path):
                with open(svg_path, "rb") as f:
                    svg_base64 = f"data:image/svg+xml;base64,{base64.b64encode(f.read()).decode('utf-8')}"
        finally:
            if os.path.exists(png_path): os.remove(png_path)
            if os.path.exists(svg_path): os.remove(svg_path)
            
        # 3D Generation
        scene = self.generator_3d.generate_scene(rooms_dict, floors=params.get("floors", 1))
        glb_bytes = self.generator_3d.generate_glb(rooms_dict)
        glb_base64 = base64.b64encode(glb_bytes).decode('utf-8') if glb_bytes else ""
        
        elevations = {
            "front": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmYWZjIi8+PHRleHQgeD0iNTAiIHk9IjEwMCIgZmlsbD0iIzY0NzQ4YiI+RnJvbnQgRWxldmF0aW9uPC90ZXh0Pjwvc3ZnPg==",
            "side": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmYWZjIi8+PHRleHQgeD0iNTAiIHk9IjEwMCIgZmlsbD0iIzY0NzQ4YiI+U2lkZSBFbGV2YXRpb248L3RleHQ+PC9zdmc+"
        }
        
        return {
            "success": True,
            "pngBase64": png_base64,
            "svgBase64": svg_base64,
            "scene": scene,
            "glbBase64": glb_base64,
            "elevations": elevations,
            "rooms": rooms_dict,
            "params": params
        }
