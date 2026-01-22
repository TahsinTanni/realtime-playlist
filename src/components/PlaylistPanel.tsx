'use client';

import { PlaylistTrack } from '@/types';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PlaylistItem } from './PlaylistItem';
import { calculatePosition } from '@/lib/calculatePosition';
import { motion, AnimatePresence } from 'framer-motion';

interface PlaylistPanelProps {
  playlist: PlaylistTrack[];
  onVote: (id: string, direction: 'up' | 'down') => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onReorder: (id: string, newPosition: number) => Promise<void>;
  onPlay: (id: string) => Promise<void>;
  autoSort?: boolean;
}

export function PlaylistPanel({ playlist, onVote, onRemove, onReorder, onPlay, autoSort }: PlaylistPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = playlist.findIndex(item => item.id === active.id);
    const newIndex = playlist.findIndex(item => item.id === over.id);

    if (oldIndex === newIndex) return;

    // Calculate new position based on neighbors
    const prevTrack = newIndex > 0 ? playlist[newIndex - (newIndex > oldIndex ? 0 : 1)] : null;
    const nextTrack = newIndex < playlist.length - 1 ? playlist[newIndex + (newIndex > oldIndex ? 1 : 0)] : null;

    const newPosition = calculatePosition(
      prevTrack?.position ?? null,
      nextTrack?.position ?? null
    );

    await onReorder(active.id as string, newPosition);
  };

  const totalDuration = playlist.reduce((sum, item) => sum + item.track.duration_seconds, 0);
  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/20 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Collaborative Playlist</h2>
        <p className="text-sm text-gray-600 mt-1">
          {playlist.length} {playlist.length === 1 ? 'track' : 'tracks'} • {formatTotalDuration(totalDuration)}
          {autoSort && <span className="ml-2 text-purple-600 font-medium">• 🔥 Auto-sorting</span>}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-visible py-2">
        {playlist.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700">No tracks in playlist</p>
              <p className="text-sm text-gray-500 mt-1">Add tracks from the library to get started</p>
            </div>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={playlist.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence mode="popLayout">
                {playlist.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ 
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                  >
                    <PlaylistItem
                      item={item}
                      onVote={onVote}
                      onRemove={onRemove}
                      onPlay={onPlay}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
