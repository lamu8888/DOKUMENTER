/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { DocumentaryPlayer } from './components/DocumentaryPlayer';
import { StoryboardView } from './components/StoryboardView';
import { BiogeographyMap } from './components/BiogeographyMap';
import { SpeciesCatalog } from './components/SpeciesCatalog';
import { ProductionCueSheet } from './components/ProductionCueSheet';
import { SHOTS, Shot, SEGMENTS } from './data/documentaryData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'storyboard' | 'biogeography' | 'species' | 'cuesheet'>('player');
  const [currentSecond, setCurrentSecond] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Playback timer ticker
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 100; // Update every 100ms
    const interval = setInterval(() => {
      setCurrentSecond((prev) => {
        const next = prev + (0.1 * playbackSpeed);
        if (next >= 600) {
          setIsPlaying(false);
          return 600;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleSelectShot = (shot: Shot) => {
    setCurrentSecond(shot.startTime);
    setIsPlaying(true);
    setActiveTab('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTogglePlay = () => {
    if (currentSecond >= 600) {
      setCurrentSecond(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Strict 3-Zone Top Navigation Bar */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        currentTimeFormatted={formatTimecode(currentSecond)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* PLAYER TAB */}
        {activeTab === 'player' && (
          <div className="space-y-8">
            {/* The Centerpiece Cinematic Screening Player */}
            <DocumentaryPlayer
              currentSecond={currentSecond}
              setCurrentSecond={setCurrentSecond}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              onSelectShot={handleSelectShot}
              onOpenBiogeography={() => setActiveTab('biogeography')}
            />

            {/* Quick Segment Jump Ribbon below player */}
            <div className="bg-stone-900/60 rounded-xl p-4 sm:p-5 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-400 uppercase tracking-wider">
                  Navigasi Cepat 6 Babak Film
                </span>
                <button
                  onClick={() => setActiveTab('storyboard')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                >
                  Buka Storyboard Lengkap (41 Shot) →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {SEGMENTS.map((seg) => {
                  const isCurrent = currentSecond >= seg.startTime && currentSecond < seg.endTime;
                  return (
                    <button
                      key={seg.id}
                      onClick={() => {
                        setCurrentSecond(seg.startTime);
                        setIsPlaying(true);
                      }}
                      className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-400/10 border-amber-400 text-stone-100 ring-1 ring-amber-400'
                          : 'bg-stone-950 hover:bg-stone-800/80 border-stone-800 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: seg.themeColor }}
                        />
                        <span className="text-[11px] font-mono text-stone-400">
                          0{seg.id} · {seg.duration}s
                        </span>
                      </div>
                      <div className="text-xs font-semibold truncate text-stone-200">
                        {seg.title}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate mt-0.5">
                        {seg.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STORYBOARD TAB */}
        {activeTab === 'storyboard' && (
          <StoryboardView
            currentSecond={currentSecond}
            onSelectShot={handleSelectShot}
          />
        )}

        {/* BIOGEOGRAPHY MAP TAB */}
        {activeTab === 'biogeography' && (
          <BiogeographyMap onSelectShot={handleSelectShot} />
        )}

        {/* SPECIES CATALOG TAB */}
        {activeTab === 'species' && (
          <SpeciesCatalog onSelectShot={handleSelectShot} />
        )}

        {/* CUE SHEET & DATA TAB */}
        {activeTab === 'cuesheet' && (
          <ProductionCueSheet />
        )}
      </main>

      {/* Quiet Institutional & Curatorial Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 py-8 px-4 sm:px-6 text-xs text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-stone-200">GARIS WALLACE</span>
            <span>·</span>
            <span>Dokumenter Ekologi & Keanekaragaman Hayati Sulawesi</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>Durasi: 10 Menit (600s)</span>
            <span>·</span>
            <span>41 Shot</span>
            <span>·</span>
            <span>Data: Auriga, WALHI, JATAM, IUCN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
