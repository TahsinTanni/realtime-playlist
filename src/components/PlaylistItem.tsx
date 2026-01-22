'use client';

import { PlaylistTrack } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface PlaylistItemProps {
  item: PlaylistTrack;
  onVote: (id: string, direction: 'up' | 'down') => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onPlay: (id: string) => Promise<void>;
}

export function PlaylistItem({ item, onVote, onRemove, onPlay }: PlaylistItemProps) {
  const [voting, setVoting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleVote = async (direction: 'up' | 'down') => {
    setVoting(true);
    try {
      await onVote(item.id, direction);
    } finally {
      setVoting(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(item.id);
    } catch {
      setRemoving(false);
    }
  };

  const handlePlay = async (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-drag-handle]')) {
      return;
    }
    
    if (!item.is_playing) {
      await onPlay(item.id);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const voteColor = item.votes > 0 ? 'text-green-600' : item.votes < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handlePlay}
      className={`group relative flex items-center gap-3 p-3 mx-2 my-1.5 rounded-xl transition-all cursor-pointer ${
        item.is_playing
          ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20'
          : 'bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-xl border border-white/20 hover:border-purple-300'
      } ${isDragging ? 'shadow-2xl ring-2 ring-purple-500 scale-105' : ''} ${showPreview ? 'z-50' : ''}`}
    >
      {/* Spotify-like hover preview - centered popup */}
      {showPreview && createPortal(
        <AnimatePresence>
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/5 z-[9998] pointer-events-none"
            />
            
            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-1/2 left-1/2 -translate-y-1/2 z-[9999] w-[450px] max-w-[calc(100vw-2rem)] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.4)] rounded-2xl p-6 border-2 border-purple-400 pointer-events-none ml-8"
              style={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #fdf4ff 100%)',
                transform: 'translateY(-50%)'
              }}
            >
            <div className="flex gap-4">
              {item.track.cover_url && (
                <div className="relative flex-shrink-0">
                  <img
                    src={item.track.cover_url}
                    alt={item.track.title}
                    className="w-24 h-24 rounded-xl object-cover shadow-lg border-2 border-purple-200"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{item.track.title}</h3>
                <p className="text-gray-700 text-sm font-medium mb-2">{item.track.artist}</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">💿 {item.track.album}</p>
                  <p className="text-xs text-gray-600">🎵 {item.track.genre}</p>
                  <p className="text-xs text-gray-600">⏱️ {formatDuration(item.track.duration_seconds)}</p>
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    item.votes > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                    item.votes < 0 ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.votes > 0 && '+'}{item.votes} votes
                  </span>
                  <span className="text-xs text-gray-500">👤 {item.added_by}</span>
                </div>
              </div>
            </div>
          </motion.div>
          </>
        </AnimatePresence>,
        document.body
      )}
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        data-drag-handle
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 rounded-lg transition-all group-hover:scale-110"
      >
        <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Now Playing Indicator */}
      {item.is_playing && (
        <div className="flex gap-0.5 items-end h-5">
          <div className="w-1 bg-blue-600 animate-pulse" style={{ height: '60%', animation: 'pulse 0.9s ease-in-out infinite' }} />
          <div className="w-1 bg-blue-600 animate-pulse" style={{ height: '100%', animation: 'pulse 0.9s ease-in-out infinite 0.15s' }} />
          <div className="w-1 bg-blue-600 animate-pulse" style={{ height: '40%', animation: 'pulse 0.9s ease-in-out infinite 0.3s' }} />
        </div>
      )}

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{item.track.title}</div>
        <div className="text-sm text-gray-600 truncate">{item.track.artist}</div>
        <div className="text-xs text-gray-500">
          {formatDuration(item.track.duration_seconds)} • Added by {item.added_by}
        </div>
      </div>

      {/* Voting */}
      <div 
        className="flex flex-col items-center gap-1"
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        <button
          onClick={() => handleVote('up')}
          disabled={voting}
          className="p-1.5 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 rounded-lg transition-all transform hover:scale-110 disabled:opacity-50 group/upvote"
          aria-label="Upvote"
        >
          <svg className="w-4 h-4 text-gray-600 group-hover/upvote:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
          item.votes > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : 
          item.votes < 0 ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' : 
          'bg-gray-100 text-gray-600'
        }`}>
          {item.votes > 0 && '+'}{item.votes}
        </span>
        <button
          onClick={() => handleVote('down')}
          disabled={voting}
          className="p-1.5 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-lg transition-all transform hover:scale-110 disabled:opacity-50 group/downvote"
          aria-label="Downvote"
        >
          <svg className="w-4 h-4 text-gray-600 group-hover/downvote:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={removing}
        className="p-2 text-red-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white rounded-lg transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100 disabled:opacity-50"
        aria-label="Remove track"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
