import React from 'react';
import { Film, Clapperboard, Compass, TreePine, FileSpreadsheet, Play, Pause } from 'lucide-react';

interface TopBarProps {
  activeTab: 'player' | 'storyboard' | 'biogeography' | 'species' | 'cuesheet';
  setActiveTab: (tab: 'player' | 'storyboard' | 'biogeography' | 'species' | 'cuesheet') => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTimeFormatted: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  isPlaying,
  onTogglePlay,
  currentTimeFormatted,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element brand wordmark */}
        <button
          onClick={() => setActiveTab('player')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="text-base sm:text-lg font-serif font-bold tracking-tight text-stone-100 group-hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            GARIS WALLACE
          </span>
        </button>

        {/* Zone 2: 4–5 single-line clean nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-400">
          <button
            onClick={() => setActiveTab('player')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'player' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : 'hover:text-stone-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Tayang Dokumenter</span>
          </button>

          <button
            onClick={() => setActiveTab('storyboard')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'storyboard' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : 'hover:text-stone-200'
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            <span>Storyboard 41 Shot</span>
          </button>

          <button
            onClick={() => setActiveTab('biogeography')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'biogeography' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : 'hover:text-stone-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Garis Biogeografi</span>
          </button>

          <button
            onClick={() => setActiveTab('species')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'species' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : 'hover:text-stone-200'
            }`}
          >
            <TreePine className="w-4 h-4" />
            <span>Fauna Endemik</span>
          </button>

          <button
            onClick={() => setActiveTab('cuesheet')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'cuesheet' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : 'hover:text-stone-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Cue Sheet & Data</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono tabular-nums text-stone-400 px-2.5 py-1 bg-stone-900 rounded border border-stone-800">
            <span>TC</span>
            <span className="text-amber-400 font-semibold">{currentTimeFormatted}</span>
            <span>/ 10:00</span>
          </div>

          <button
            onClick={onTogglePlay}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Jeda Film</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Putar Dokumenter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
