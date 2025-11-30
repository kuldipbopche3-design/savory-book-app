import { GoogleGenAI, Type } from "@google/genai";
import { Restaurant } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchRestaurantsWithAI = async (
  query: string, 
  availableRestaurants: Restaurant[]
): Promise<string[]> => {
  // Minimize the payload sent to LLM to save tokens, just send relevant metadata
  const restaurantContext = availableRestaurants.map(r => ({
    id: r.id,
    name: r.name,
    cuisine: r.cuisine,
    description: r.description,
    price: r.priceRange,
    rating: r.rating
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User Query: "${query}"
      
      Here is the database of restaurants:
      ${JSON.stringify(restaurantContext)}
      
      Return a JSON object containing an array of restaurant IDs that best match the user's query based on cuisine, description, vibe, or price.
      If the user asks for something generic, recommend high-rated ones.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result.recommendedIds || [];

  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};