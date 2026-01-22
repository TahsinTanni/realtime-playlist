'use client';

import { PlaylistTrack } from '@/types';
import { useEffect, useState } from 'react';

interface NowPlayingBarProps {
  playlist: PlaylistTrack[];
  onSkip: () => Promise<void>;
}

export function NowPlayingBar({ playlist, onSkip }: NowPlayingBarProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [manualProgress, setManualProgress] = useState<number | null>(null);

  const currentTrack = playlist.find(item => item.is_playing);

  // Reset progress when track changes
  useEffect(() => {
    if (currentTrack) {
      setProgress(0);
      setManualProgress(null);
    }
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!currentTrack || isPaused) {
      return;
    }

    const duration = currentTrack.track.duration_seconds * 1000;
    const startTime = Date.now();
    const startProgress = manualProgress ?? 0;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(startProgress + (elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        // Auto-advance to next track
        onSkip();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentTrack, isPaused, onSkip, manualProgress]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    
    setManualProgress(newProgress);
    setProgress(newProgress);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTime = () => {
    if (!currentTrack) return '0:00';
    const elapsed = Math.floor((progress / 100) * currentTrack.track.duration_seconds);
    return formatDuration(elapsed);
  };

  if (!currentTrack) {
    return (
      <div className="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 text-white p-4 flex items-center justify-center backdrop-blur-lg">
        <p className="text-sm text-gray-300">No track playing 🎵</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 text-white p-4 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        {/* Track Info */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg truncate">{currentTrack.track.title}</div>
            <div className="text-sm text-gray-400 truncate">{currentTrack.track.artist}</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all transform hover:scale-110 backdrop-blur-sm border border-white/20 shadow-lg"
              aria-label={isPaused ? 'Play' : 'Pause'}
              data-play-toggle="true"
            >
              {isPaused ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              )}
            </button>

            <button
              onClick={onSkip}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all transform hover:scale-110 backdrop-blur-sm border border-white/20 shadow-lg"
              aria-label="Skip to next"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4l12 8-12 8V4zm13 0v16h2V4h-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-300 w-10 text-right">{getCurrentTime()}</span>
          <div 
            onClick={handleProgressClick}
            className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 cursor-pointer hover:h-3 transition-all"
          >
            <div
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full transition-all duration-100 ease-linear shadow-lg pointer-events-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-300 w-10">{formatDuration(currentTrack.track.duration_seconds)}</span>
        </div>
      </div>
    </div>
  );
}
