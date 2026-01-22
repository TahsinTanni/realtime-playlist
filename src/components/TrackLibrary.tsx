'use client';

import { Track } from '@/types';
import { useState, useRef, useEffect } from 'react';

interface TrackLibraryProps {
  tracks: Track[];
  playlistTrackIds: Set<string>;
  onAddTrack: (trackId: string) => Promise<void>;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function TrackLibrary({ tracks, playlistTrackIds, onAddTrack, searchTerm, onSearchChange }: TrackLibraryProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  const genres = ['All', ...Array.from(new Set(tracks.map(t => t.genre)))];

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || track.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  // Get suggestions - top 5 matches
  const suggestions = searchTerm.trim() ? filteredTracks.slice(0, 5) : [];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      const track = suggestions[selectedSuggestionIndex];
      onSearchChange(track.title);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleAddTrack = async (trackId: string) => {
    setAddingTrackId(trackId);
    try {
      await onAddTrack(trackId);
    } finally {
      setAddingTrackId(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/20 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Track Library</h2>
        
        <div ref={searchRef} className="relative mb-4">
          <input
            type="text"
            placeholder="Search tracks or artists..."
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSuggestions(true);
              setSelectedSuggestionIndex(-1);
            }}
            onFocus={() => searchTerm && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 text-gray-900 font-medium transition-all shadow-sm"
          />

          {/* Auto-suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white/95 backdrop-blur-md border-2 border-purple-300 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
              {suggestions.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => {
                    onSearchChange(track.title);
                    setShowSuggestions(false);
                    setSelectedSuggestionIndex(-1);
                  }}
                  className={`p-3 cursor-pointer transition-all ${
                    index === selectedSuggestionIndex
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'hover:bg-purple-50'
                  } ${index !== suggestions.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <div className={`font-medium ${index === selectedSuggestionIndex ? 'text-white' : 'text-gray-900'}`}>
                    {track.title}
                  </div>
                  <div className={`text-sm ${index === selectedSuggestionIndex ? 'text-white/90' : 'text-gray-600'}`}>
                    {track.artist} • {track.album}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedGenre === genre
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredTracks.map(track => {
          const inPlaylist = playlistTrackIds.has(track.id);
          const isAdding = addingTrackId === track.id;

          return (
            <div
              key={track.id}
              className="p-3 mx-2 my-1.5 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all transform hover:scale-[1.01] flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{track.title}</div>
                <div className="text-sm text-gray-600 truncate">{track.artist}</div>
                <div className="text-xs text-gray-500">{track.album} • {formatDuration(track.duration_seconds)}</div>
              </div>

              <button
                onClick={() => handleAddTrack(track.id)}
                disabled={inPlaylist || isAdding}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all transform hover:scale-105 ${
                  inPlaylist
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isAdding
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/50 active:scale-95'
                }`}
              >
                {inPlaylist ? 'In Playlist' : isAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
