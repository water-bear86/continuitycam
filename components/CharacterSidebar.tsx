import React, { useState } from 'react';
import { Character } from '../types';
import { UserIcon, PlusIcon, TrashIcon } from './Icons';

interface CharacterSidebarProps {
  characters: Character[];
  selectedCharacterId: string | null;
  onSelectCharacter: (id: string | null) => void;
  onAddCharacter: (character: Character) => void;
  onDeleteCharacter: (id: string) => void;
}

export const CharacterSidebar: React.FC<CharacterSidebarProps> = ({
  characters,
  selectedCharacterId,
  onSelectCharacter,
  onAddCharacter,
  onDeleteCharacter,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharImages, setNewCharImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Explicitly cast to File[] to ensure correct type inference for the forEach loop
      const files = Array.from(e.target.files) as File[];
      files.slice(0, 3).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewCharImages((prev) => [...prev, reader.result as string].slice(0, 3));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCreate = () => {
    if (!newCharName.trim()) return;
    
    const newChar: Character = {
      id: crypto.randomUUID(),
      name: newCharName,
      images: newCharImages,
      thumbnail: newCharImages[0] || '',
    };
    
    onAddCharacter(newChar);
    setNewCharName('');
    setNewCharImages([]);
    setIsCreating(false);
  };

  return (
    <div className="w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-purple-500" />
          Character Library
        </h2>
        <p className="text-xs text-zinc-400 mt-1">Create characters for video continuity.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* New Character Button */}
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-3 border border-dashed border-zinc-700 rounded-lg text-zinc-400 hover:border-purple-500 hover:text-purple-500 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add New Character
          </button>
        )}

        {/* Creation Form */}
        {isCreating && (
          <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-700 animate-in fade-in zoom-in duration-200">
            <input
              type="text"
              placeholder="Character Name"
              value={newCharName}
              onChange={(e) => setNewCharName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-purple-500"
            />
            
            <div className="mb-3">
              <label className="block text-xs text-zinc-500 mb-2">Reference Images (Max 3)</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {newCharImages.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded overflow-hidden bg-zinc-800 border border-zinc-700 relative group">
                    <img src={img} alt="ref" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setNewCharImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <TrashIcon className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                {newCharImages.length < 3 && (
                  <label className="aspect-square rounded border border-dashed border-zinc-700 flex items-center justify-center cursor-pointer hover:bg-zinc-900 transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <PlusIcon className="w-4 h-4 text-zinc-500" />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newCharName || newCharImages.length === 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 rounded text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Character List */}
        {characters.length === 0 && !isCreating && (
          <div className="text-center text-zinc-600 text-sm py-8">
            No characters yet.
          </div>
        )}

        {characters.map((char) => (
          <div
            key={char.id}
            onClick={() => onSelectCharacter(selectedCharacterId === char.id ? null : char.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-all group relative ${
              selectedCharacterId === char.id
                ? 'bg-zinc-900 border-purple-500 ring-1 ring-purple-500/50'
                : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
                {char.thumbnail ? (
                  <img src={char.thumbnail} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-full h-full p-2 text-zinc-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">{char.name}</h3>
                <p className="text-xs text-zinc-500">{char.images.length} reference images</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteCharacter(char.id); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 text-zinc-500 rounded transition-all"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};