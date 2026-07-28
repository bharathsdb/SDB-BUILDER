"""
PlanCraft AI Chat Assistant - Provides architectural advice in natural language.
Runs entirely on local Python - no external APIs.
"""
import re


class ArchitectChatAssistant:
    def __init__(self):
        self.context = {}

    def process_message(self, message: str, project_id: str = None) -> dict:
        lower = message.lower()

        if any(w in lower for w in ["vastu", "vastu"]):
            return self._vastu_response()

        if any(w in lower for w in ["cost", "budget", "price", "expensive"]):
            return self._cost_response(message)

        if any(w in lower for w in ["room size", "room sizes", "dimension", "size"]):
            return self._room_size_response()

        if any(w in lower for w in ["bedroom", "add room", "increase"]):
            return self._add_room_response(message)

        if any(w in lower for w in ["reduce", "save", "cheaper", "economy"]):
            return self._reduce_cost_response()

        if any(w in lower for w in ["design", "style", "modern", "traditional", "contemporary"]):
            return self._style_response(message)

        if any(w in lower for w in ["material", "material"]):
            return self._material_response(message)

        if any(w in lower for w in ["hello", "hi", "hey", "help"]):
            return self._greeting_response()

        return self._default_response()

    def _vastu_response(self) -> dict:
        return {
            "reply": ("According to Vastu Shastra principles:\n"
                      "- Master bedroom: Southwest corner\n"
                      "- Kitchen: Southeast direction (Agni corner)\n"
                      "- Living room: Northeast or North direction\n"
                      "- Pooja room: Northeast (Ishaan corner)\n"
                      "- Bathrooms: West or Northwest direction\n"
                      "- Ensure main entrance faces East or North for positive energy\n"
                      "- Avoid bedroom in Southwest direction\n"
                      "- Keep center of house open for free flow of energy"),
            "action": {"type": "RESTRUCTURE", "params": {"vastu": True}},
        }

    def _cost_response(self, message: str) -> dict:
        return {
            "reply": ("Construction cost estimates per sqft:\n"
                      "• Economy: ₹1,800/sqft (Basic finishing)\n"
                      "• Standard: ₹2,500/sqft (Good quality)\n"
                      "• Premium: ₹3,800/sqft (Premium finishes)\n"
                      "• Ultra Luxury: ₹5,500/sqft (Luxury specifications)\n\n"
                      "A typical 1500 sqft Standard home: ~₹37.5 lakhs total\n"
                      "Would you like me to optimize your current plan for cost?"),
            "action": {"type": "ANALYZE_COST", "params": {}},
        }

    def _room_size_response(self) -> dict:
        return {
            "reply": ("Recommended room sizes:\n"
                      "• Living Room: 16x22 ft (352 sqft)\n"
                      "• Master Bedroom: 14x16 ft (224 sqft)\n"
                      "• Standard Bedroom: 12x14 ft (168 sqft)\n"
                      "• Kitchen: 10x12 ft (120 sqft)\n"
                      "• Bathroom: 6x8 ft (48 sqft)\n"
                      "• Dining: 12x14 ft (168 sqft)\n"
                      "• Parking: 10x18 ft (180 sqft)\n"
                      "• Pooja Room: 6x6 ft (36 sqft)"),
            "action": None,
        }

    def _add_room_response(self, message: str) -> dict:
        return {
            "reply": "I can add another room to your plan. Which type would you like to add?\n"
                      "• Bedroom (12x14 ft)\n"
                      "• Bathroom (6x8 ft)\n"
                      "• Study Room (10x12 ft)\n"
                      "• Guest Room (12x14 ft)\n"
                      "• Store Room (6x8 ft)",
            "action": {"type": "ADD_ROOM", "params": {"name": "Additional Room"}},
        }

    def _reduce_cost_response(self) -> dict:
        return {
            "reply": ("Enacting cost-saving value engineering:\n"
                      "1. Reducing structural spans to optimize steel and concrete\n"
                      "2. Using standard grade materials instead of premium\n"
                      "3. Optimizing wall placements to reduce brickwork\n"
                      "4. Simplifying roof design\n"
                      "5. Using economical finishing materials\n\n"
                      "Estimated savings: 15-20% of total construction cost"),
            "action": {"type": "VALUE_ENGINEER", "params": {"budgetTier": "Economy"}},
        }

    def _style_response(self, message: str) -> dict:
        return {
            "reply": ("Popular architectural styles:\n"
                      "• Modern: Clean lines, flat roofs, large windows, open plans\n"
                      "• Contemporary: Current trends, sustainable materials, flexible spaces\n"
                      "• Traditional: Pitched roofs, symmetrical facades, classic details\n"
                      "• Scandinavian: Minimalist, natural light, functional layouts\n"
                      "• Mediterranean: Warm colors, terracotta, arched windows\n"
                      "• Farmhouse: Rustic elements, wraparound porches, gable roofs"),
            "action": None,
        }

    def _material_response(self, message: str) -> dict:
        return {
            "reply": ("I recommend materials based on your budget tier.\n"
                      "For Standard tier:\n"
                      "• Flooring: Vitrified Tiles (₹65/sqft)\n"
                      "• Walls: Putty finish + paint (₹35/sqft)\n"
                      "• Kitchen: Granite countertop (₹180/sqft)\n"
                      "• Bathroom: Premium ceramic tiles (₹55/sqft)\n"
                      "• Doors: Hardwood doors (₹8,500 each)\n"
                      "• Windows: UPVC windows (₹5,500 each)\n\n"
                      "Would you like material recommendations for a different budget?"),
            "action": None,
        }

    def _greeting_response(self) -> dict:
        return {
            "reply": ("Hello! I am the PlanCraftAI architectural assistant. I can help you with:\n"
                      "• Generating floor plan layouts\n"
                      "• Vastu compliance analysis\n"
                      "• Cost estimation and optimization\n"
                      "• Room size recommendations\n"
                      "• Material selection\n"
                      "• Design style guidance\n"
                      "• Construction advice\n\n"
                      "What would you like to work on today?"),
            "action": None,
        }

    def _default_response(self) -> dict:
        return {
            "reply": ("I understand your query. I am your PlanCraftAI architectural assistant.\n"
                      "I can restructure layouts, add rooms, apply Vastu principles, "
                      "optimize costs, or provide design recommendations.\n\n"
                      "Try asking me about:\n"
                      "- \"Make this Vastu compliant\"\n"
                      "- \"Reduce construction cost\"\n"
                      "- \"Add a bedroom\"\n"
                      "- \"What materials should I use?\"\n"
                      "- \"Recommended room sizes\""),
            "action": None,
        }
