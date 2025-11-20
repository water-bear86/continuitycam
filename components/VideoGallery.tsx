import React from 'react';
import { GeneratedVideo, Character } from '../types';
import { LoaderIcon, AlertCircleIcon, DownloadIcon, FilmIcon } from './Icons';

interface VideoGalleryProps {
  videos: GeneratedVideo[];
  characters: Character[];
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ videos, characters }) => {
  const getCharacterName = (id?: string) => {
    if (!id) return null;
    return characters.find(c => c.id === id)?.name;
  };

  if (videos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 h-96">
        <FilmIcon className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">No videos generated yet</p>
        <p className="text-sm">Create a character and start generating scenes.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
        <FilmIcon className="w-5 h-5 text-purple-500" />
        Generated Scenes
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-xl flex flex-col">
            <div className="relative aspect-video bg-black group">
              {video.status === 'generating' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                  <LoaderIcon className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                  <span className="text-xs font-medium animate-pulse">Generating Veo Video...</span>
                  <span className="text-[10px] text-zinc-600 mt-1">This may take a minute</span>
                </div>
              ) : video.status === 'failed' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 bg-red-950/20">
                  <AlertCircleIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs text-center px-4">Generation Failed</span>
                  {video.error && <span className="text-[10px] mt-1 px-4 text-center opacity-70">{video.error}</span>}
                </div>
              ) : (
                <>
                  <video 
                    src={video.url} 
                    controls 
                    className="w-full h-full object-contain" 
                    loop
                  />
                  <a 
                    href={video.url}
                    download={`lumiere-scene-${video.id}.mp4`}
                    className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-600"
                    title="Download Video"
                  >
                    <DownloadIcon className="w-4 h-4" />
                  </a>
                </>
              )}
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {video.characterId && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] border border-purple-500/20 font-medium">
                      {getCharacterName(video.characterId)}
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-500">
                    {new Date(video.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-zinc-300 line-clamp-2 mb-2 flex-1" title={video.prompt}>
                {video.prompt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};