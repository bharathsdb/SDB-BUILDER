"""
Material Recommender - Suggests materials based on budget tier and room types.
"""


class MaterialRecommender:
    MATERIALS_DB = {
        "Economy": {
            "flooring": [{"name": "Vitrified Tiles", "cost": 45, "unit": "sqft"},
                         {"name": "Cement Finish", "cost": 20, "unit": "sqft"}],
            "walls": [{"name": "Cement Plaster", "cost": 15, "unit": "sqft"},
                      {"name": "Emulsion Paint", "cost": 25, "unit": "sqft"}],
            "kitchen": [{"name": "Granite Countertop", "cost": 120, "unit": "sqft"}],
            "bathroom": [{"name": "Ceramic Tiles", "cost": 35, "unit": "sqft"}],
            "roofing": [{"name": "RCC Slab", "cost": 55, "unit": "sqft"}],
            "doors": [{"name": "Flush Door", "cost": 4500, "unit": "each"}],
            "windows": [{"name": "Aluminum Sliding", "cost": 3500, "unit": "each"}],
        },
        "Standard": {
            "flooring": [{"name": "Vitrified Tiles (Premium)", "cost": 65, "unit": "sqft"},
                         {"name": "Engineered Wood", "cost": 120, "unit": "sqft"}],
            "walls": [{"name": "Putty Finish + Paint", "cost": 35, "unit": "sqft"}],
            "kitchen": [{"name": "Granite Countertop", "cost": 180, "unit": "sqft"},
                        {"name": "Modular Kitchen", "cost": 65000, "unit": "lump_sum"}],
            "bathroom": [{"name": "Ceramic Tiles (Premium)", "cost": 55, "unit": "sqft"}],
            "roofing": [{"name": "RCC Slab + Waterproofing", "cost": 75, "unit": "sqft"}],
            "doors": [{"name": "Hardwood Door", "cost": 8500, "unit": "each"}],
            "windows": [{"name": "UPVC Windows", "cost": 5500, "unit": "each"}],
        },
        "Premium": {
            "flooring": [{"name": "Marble Flooring", "cost": 200, "unit": "sqft"},
                         {"name": "Hardwood Flooring", "cost": 250, "unit": "sqft"}],
            "walls": [{"name": "Texture Finish", "cost": 65, "unit": "sqft"}],
            "kitchen": [{"name": "Italian Marble Countertop", "cost": 350, "unit": "sqft"},
                        {"name": "Premium Modular Kitchen", "cost": 150000, "unit": "lump_sum"}],
            "bathroom": [{"name": "Imported Tiles", "cost": 120, "unit": "sqft"}],
            "roofing": [{"name": "RCC Slab + Insulation", "cost": 95, "unit": "sqft"}],
            "doors": [{"name": "Premium Hardwood Door", "cost": 18000, "unit": "each"}],
            "windows": [{"name": "UPVC Double Glazed", "cost": 12000, "unit": "each"}],
        },
        "Ultra Luxury": {
            "flooring": [{"name": "Imported Marble", "cost": 400, "unit": "sqft"},
                         {"name": "Engineered Wood (Imported)", "cost": 450, "unit": "sqft"}],
            "walls": [{"name": "Imported Wallpaper/Texture", "cost": 150, "unit": "sqft"}],
            "kitchen": [{"name": "Imported Stone Countertop", "cost": 600, "unit": "sqft"},
                        {"name": "Custom Modular Kitchen", "cost": 300000, "unit": "lump_sum"}],
            "bathroom": [{"name": "Imported Marble Tiles", "cost": 250, "unit": "sqft"}],
            "roofing": [{"name": "RCC Slab + Green Roof", "cost": 150, "unit": "sqft"}],
            "doors": [{"name": "Custom Wood Door", "cost": 35000, "unit": "each"}],
            "windows": [{"name": "Smart Glass Windows", "cost": 25000, "unit": "each"}],
        },
    }

    def recommend(self, budget_tier: str) -> dict:
        tier = budget_tier if budget_tier in self.MATERIALS_DB else "Standard"
        return self.MATERIALS_DB[tier]

    def recommend_for_room(self, room_type: str, budget_tier: str) -> list[dict]:
        materials = self.recommend(budget_tier)
        category_map = {
            "bedroom": ["flooring", "walls", "doors", "windows"],
            "living": ["flooring", "walls", "doors", "windows"],
            "kitchen": ["flooring", "walls", "kitchen", "windows"],
            "bathroom": ["flooring", "walls", "bathroom"],
            "dining": ["flooring", "walls", "doors"],
        }
        categories = category_map.get(room_type, ["flooring", "walls"])
        result = []
        for cat in categories:
            if cat in materials:
                result.extend(materials[cat])
        return result
