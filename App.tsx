import React, { useState, useEffect } from 'react';
import { CharacterSidebar } from './components/CharacterSidebar';
import { VideoGallery } from './components/VideoGallery';
import { Character, GeneratedVideo } from './types';
import { generateVideo } from './services/geminiService';
import { FilmIcon, LoaderIcon, AlertCircleIcon, UserIcon } from './components/Icons';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [keyError, setKeyError] = useState<string | null>(null);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const hasSelected = await window.aistudio.hasSelectedApiKey();
      setHasKey(hasSelected);
    } catch (e) {
      console.error("Error checking API key:", e);
    } finally {
      setIsCheckingKey(false);
    }
  };

  const handleSelectKey = async () => {
    try {
      window.aistudio.openSelectKey();
      // Assume success after opening dialog to avoid race condition as per instructions
      setHasKey(true);
      setKeyError(null);
    } catch (e) {
      console.error("Error opening key selector:", e);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const selectedChar = characters.find(c => c.id === selectedCharacterId);
    
    const newVideo: GeneratedVideo = {
      id: crypto.randomUUID(),
      url: '',
      prompt: prompt,
      status: 'generating',
      characterId: selectedCharacterId || undefined,
      createdAt: Date.now(),
    };

    setVideos(prev => [newVideo, ...prev]);
    setIsGenerating(true);
    setPrompt(''); // Clear input

    try {
      const videoUrl = await generateVideo(newVideo.prompt, selectedChar);
      
      setVideos(prev => prev.map(v => 
        v.id === newVideo.id 
          ? { ...v, status: 'completed', url: videoUrl }
          : v
      ));
    } catch (error: any) {
      console.error("Generation failed", error);
      let errorMessage = "Unknown error occurred";
      
      if (error.message?.includes("Requested entity was not found")) {
        errorMessage = "API Key Invalid or Project Not Found. Please select a valid key.";
        setHasKey(false); // Reset key state
        setKeyError(errorMessage);
      } else {
        errorMessage = error.message || "Failed to generate video";
      }

      setVideos(prev => prev.map(v => 
        v.id === newVideo.id 
          ? { ...v, status: 'failed', error: errorMessage }
          : v
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  if (isCheckingKey) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-white">
        <LoaderIcon className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center shadow-2xl">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FilmIcon className="w-8 h-8 text-purple-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Lumiere Studio</h1>
          <p className="text-zinc-400 mb-6">
            To generate high-quality AI videos with Veo, you need to connect a paid Google Cloud Project API key.
          </p>
          
          {keyError && (
             <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2 justify-center">
               <AlertCircleIcon className="w-4 h-4" />
               {keyError}
             </div>
          )}

          <button 
            onClick={handleSelectKey}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            Select API Key
          </button>
          
          <p className="mt-4 text-xs text-zinc-500">
            Learn more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">billing and API keys</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-zinc-950 text-zinc-200 overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Left Sidebar: Character Management */}
      <CharacterSidebar
        characters={characters}
        selectedCharacterId={selectedCharacterId}
        onSelectCharacter={setSelectedCharacterId}
        onAddCharacter={(char) => setCharacters(prev => [...prev, char])}
        onDeleteCharacter={(id) => {
            setCharacters(prev => prev.filter(c => c.id !== id));
            if (selectedCharacterId === id) setSelectedCharacterId(null);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar / Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur">
            <div className="flex items-center gap-3">
                <FilmIcon className="w-6 h-6 text-purple-500" />
                <h1 className="font-bold text-xl tracking-tight text-white">Lumiere <span className="text-purple-500 font-light">Studio</span></h1>
            </div>
            <div className="flex items-center gap-4">
                 <button 
                   onClick={handleSelectKey}
                   className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                 >
                   Change API Key
                 </button>
                 <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs">
                    L
                 </div>
            </div>
        </header>

        {/* Generation Input Area */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
          <div className="max-w-4xl mx-auto w-full">
             <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                        {selectedCharacterId 
                            ? `Scene Prompt for "${characters.find(c => c.id === selectedCharacterId)?.name}"` 
                            : "Scene Prompt (No Character Selected)"}
                    </label>
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={selectedCharacterId 
                                ? "Describe what the character is doing in the scene... (e.g. walking through a neon city)" 
                                : "Describe a scene to generate..."}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-base focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none min-h-[100px] resize-none transition-all"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-zinc-600">
                            Gemini Veo 3.1
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                         <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                             <span className="w-2 h-2 rounded-full bg-green-500"></span>
                             Resolution: 720p
                         </div>
                         <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                             <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                             Aspect: 16:9
                         </div>
                         {selectedCharacterId && (
                             <div className="flex items-center gap-1.5 bg-purple-900/20 px-2 py-1 rounded border border-purple-500/30 text-purple-400">
                                 <UserIcon className="w-3 h-3" />
                                 Character Continuity Active
                             </div>
                         )}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className={`
                            px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all
                            ${isGenerating || !prompt.trim() 
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 active:scale-95'}
                        `}
                    >
                        {isGenerating ? (
                            <>
                                <LoaderIcon className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FilmIcon className="w-4 h-4" />
                                Generate Scene
                            </>
                        )}
                    </button>
                </div>
             </div>
          </div>
        </div>

        {/* Output Gallery */}
        <div className="flex-1 bg-zinc-950 overflow-hidden flex flex-col">
            <VideoGallery videos={videos} characters={characters} />
        </div>
      </div>
    </div>
  );
};

export default App;