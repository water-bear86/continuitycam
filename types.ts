export interface Character {
  id: string;
  name: string;
  images: string[]; // Base64 strings
  thumbnail: string;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  status: 'generating' | 'completed' | 'failed';
  characterId?: string;
  createdAt: number;
  error?: string;
}

export interface GenerationConfig {
  prompt: string;
  selectedCharacterId: string | null;
}

// Fix: Augment the existing AIStudio interface to include the required methods
// This avoids conflicts with the global declaration that expects 'aistudio' to be of type 'AIStudio'
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => void;
  }
}