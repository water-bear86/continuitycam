import { GoogleGenAI, VideoGenerationReferenceImage, VideoGenerationReferenceType } from "@google/genai";
import { Character } from "../types";

// Helper to strip data URI scheme
const stripBase64Header = (base64: string) => {
  return base64.replace(/^data:image\/[a-z]+;base64,/, "");
};

const getMimeType = (base64: string) => {
  const match = base64.match(/^data:(image\/[a-z]+);base64,/);
  return match ? match[1] : "image/png";
};

export const generateVideo = async (
  prompt: string, 
  character?: Character
): Promise<string> => {
  // Always create a new instance to get the latest selected API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let config: any = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: '16:9', // Required for reference images in veo-3.1-generate-preview
  };

  // If a character is selected, add reference images
  if (character && character.images.length > 0) {
    const referenceImagesPayload: VideoGenerationReferenceImage[] = character.images.slice(0, 3).map(img => ({
      image: {
        imageBytes: stripBase64Header(img),
        mimeType: getMimeType(img),
      },
      referenceType: VideoGenerationReferenceType.ASSET, // Treat as character asset
    }));

    config.referenceImages = referenceImagesPayload;
  }

  // Use the preview model capable of reference images
  const modelName = 'veo-3.1-generate-preview';

  try {
    let operation = await ai.models.generateVideos({
      model: modelName,
      prompt: prompt,
      config: config,
    });

    // Polling loop
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No video URI returned from generation.");
    }

    // Append API key for access
    return `${videoUri}&key=${process.env.API_KEY}`;
    
  } catch (error: any) {
    console.error("Video generation error:", error);
    throw error;
  }
};