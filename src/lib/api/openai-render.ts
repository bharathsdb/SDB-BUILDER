export interface RoomLayout {
  name: string;
  width: number;
  length: number;
  level?: number;
  area?: number;
  x?: number; // center X coordinate in feet relative to top-left
  y?: number; // center Y coordinate in feet relative to top-left
}

export async function generateFloorPlanRenders(roomLayoutData: RoomLayout[], apiKey: string) {
  const roomList = roomLayoutData.map(r => r.name).join(", ");
  const layoutString = roomLayoutData.map(r => `${r.name}: ${r.width}x${r.length}ft`).join("; ");

  const prompt2D = `An ultra-detailed 2D architectural floor plan of a modern luxury residence, top-down orthographic view, clean CAD-style line drawing with color-coded flooring zones. Layout includes: ${roomList} positioned roughly as specified: ${layoutString}. Style: precise wall thickness, accurately placed doors and windows with swing arcs, furniture layout shown in plan symbols, north direction arrow, professional blueprint-quality presentation, flat lighting, no shadows, no 3D depth — pure 2D technical drawing style suitable for construction reference. Note: Do NOT generate any text, labels, measurements, or typography in the image.`;

  const prompt3D = `An ultra-detailed isometric top-down 3D architectural cutaway render of a modern luxury residence, walls cut away at mid-height, no roof, matching this layout roughly: ${layoutString}. Style: photorealistic interior visualization, cinematic ambient lighting, soft glowing LED strip lighting, blue and grey luxury color palette with polished wooden flooring accents. Include realistic furniture per room (bedrooms, living hall with sectional sofa, dining area with round table, modular kitchen with island counter, bathrooms with realistic fittings, balcony, staircase). Rendering quality: ultra-realistic textures and materials, depth-accurate shadows, subtle reflections, 8K detail, premium interior visualization studio quality. Note: Do NOT generate any text or labels in the image.`;

  return {
    plan2D: { status: "success" as const, prompt: prompt2D, url: "" },
    render3D: { status: "success" as const, prompt: prompt3D, url: "" }
  };
}
