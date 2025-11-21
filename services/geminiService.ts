import { GoogleGenAI } from "@google/genai";
import { TrackSession } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTripJournal = async (session: TrackSession): Promise<string> => {
  if (!session.points || session.points.length < 2) {
    return "Not enough data to generate a journal.";
  }

  const durationSeconds = session.endTime 
    ? (session.endTime - session.startTime) / 1000 
    : (Date.now() - session.startTime) / 1000;

  const startPoint = session.points[0];
  const endPoint = session.points[session.points.length - 1];
  
  // Calculate approximate distance (simplified haversine for prompt context)
  // We don't need perfect math here, just context for the AI
  const distanceContext = `started at ${startPoint.lat.toFixed(4)},${startPoint.lng.toFixed(4)} and ended at ${endPoint.lat.toFixed(4)},${endPoint.lng.toFixed(4)}`;
  
  // Calculate elevation gain/loss roughly
  let minAlt = Infinity;
  let maxAlt = -Infinity;
  let validAltCount = 0;
  
  session.points.forEach(p => {
    if (p.alt !== null) {
      if (p.alt < minAlt) minAlt = p.alt;
      if (p.alt > maxAlt) maxAlt = p.alt;
      validAltCount++;
    }
  });

  const altContext = validAltCount > 0 
    ? `Elevation ranged from ${minAlt.toFixed(1)}m to ${maxAlt.toFixed(1)}m.` 
    : "Altitude data was unavailable.";

  const prompt = `
    I just finished a tracked trip. 
    Duration: ${(durationSeconds / 60).toFixed(1)} minutes.
    Location Data: ${distanceContext}.
    Altitude Data: ${altContext}.
    
    Please write a short, creative, and "Apple-style" minimalist travel journal entry (max 3 sentences) describing this journey. 
    Focus on the feeling of exploration and the verticality of the trip if applicable. 
    Do not include technical stats in the output text, just the prose.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Journal generation failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate journal at this time.";
  }
};
