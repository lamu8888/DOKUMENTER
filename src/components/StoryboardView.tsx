import React, { useState } from 'react';
import {
  Search,
  Filter,
  Play,
  Clock,
  Layers,
  Sparkles,
  Camera,
  FileText,
  Volume2,
  ChevronRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Shot, Segment, SHOTS, SEGMENTS, VisualTechnique } from '../data/documentaryData';
import { getShotImage } from '../assets/imageMap';

interface StoryboardViewProps {
  currentSecond: number;
  onSelectShot: (shot: Shot) => void;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  currentSecond,
  onSelectShot,
}) => {
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | 'all'>('all');
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeExpandedShot, setActiveExpandedShot] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter shots
  const filteredShots = SHOTS.filter((shot) => {
    if (selectedSegmentId !== 'all' && shot.segmentId !== selectedSegmentId) {
      return false;
    }
    if (selectedTechnique !== 'all' && shot.technique !== selectedTechnique) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        shot.title.toLowerCase().includes(q) ||
        shot.description.toLowerCase().includes(q) ||
        shot.narrationId.toLowerCase().includes(q) ||
        shot.cameraStyle.toLowerCase().includes(q) ||
        shot.segmentName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getTechniqueBadgeClass = (tech: VisualTechnique) => {
    switch (tech) {
      case 'AI':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Footage Asli':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Teks':
        return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
      case 'Audio':
        return 'text-violet-400 border-violet-500/30 bg-violet-500/10';
      default:
        return 'text-stone-300 border-stone-700 bg-stone-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & FILTER BAR */}
      <div className="bg-stone-900/60 rounded-xl p-4 sm:p-5 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Storyboard Lengkap: 41 Shot Dokumenter
            </h2>
            <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
              <span>Durasi Total 10:00 (600s)</span>
              <span>·</span>
              <span>6 Segmen Berkelanjutan</span>
              <span>·</span>
              <span className="text-amber-400 font-medium">Menampilkan {filteredShots.length} dari 41 shot</span>
            </div>
          </div>

          {/* Search bar & View toggle */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Maleo, Nikel, Anoa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400 w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center bg-stone-950 rounded-lg p-0.5 border border-stone-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                  viewMode === 'grid' ? 'bg-stone-800 text-stone-100' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Grid Visual
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                  viewMode === 'table' ? 'bg-stone-800 text-stone-100' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Tabel Cue
              </button>
            </div>
          </div>
        </div>

        {/* Filter Segment Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-800/80">
          <span className="text-xs text-stone-400 mr-2 shrink-0">Segmen:</span>
          <button
            onClick={() => setSelectedSegmentId('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              selectedSegmentId === 'all'
                ? 'bg-amber-400 text-stone-950 font-semibold'
                : 'text-stone-400 hover:text-stone-200 bg-stone-950 border border-stone-800'
            }`}
          >
            Semua (1-6)
          </button>
          {SEGMENTS.map((seg) => (
            <button
              key={seg.id}
              onClick={() => setSelectedSegmentId(seg.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedSegmentId === seg.id
                  ? 'bg-amber-400 text-stone-950 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 bg-stone-950 border border-stone-800'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: seg.themeColor }}
              />
              <span>Seg {seg.id}: {seg.title}</span>
            </button>
          ))}
        </div>

        {/* Filter Technique Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-stone-400 mr-2 shrink-0">Teknik:</span>
          {['all', 'AI', 'Footage Asli', 'Teks', 'Audio', 'Kombinasi'].map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTechnique(tech)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedTechnique === tech
                  ? 'bg-stone-100 text-stone-950 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 bg-stone-950 border border-stone-800'
              }`}
            >
              {tech === 'all' ? 'Semua Teknik' : tech}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShots.map((shot) => {
            const isCurrentlyPlaying = currentSecond >= shot.startTime && currentSecond < shot.endTime;
            const imageUrl = getShotImage(shot.imageKey, shot.visualTheme);

            return (
              <div
                key={shot.id}
                className={`group bg-stone-900 rounded-xl border overflow-hidden flex flex-col transition-all hover:border-amber-400/50 hover:shadow-xl ${
                  isCurrentlyPlaying ? 'ring-2 ring-amber-400 border-amber-400' : 'border-stone-800'
                }`}
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-video bg-black overflow-hidden cursor-pointer" onClick={() => onSelectShot(shot)}>
                  <img
                    src={imageUrl}
                    alt={shot.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                  {/* Top shot number badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-black/80 backdrop-blur-md rounded border border-stone-700 text-amber-300">
                      SHOT #{shot.id}
                    </span>
                    <span className={`px-2 py-0.5 text-[11px] font-sans rounded border ${getTechniqueBadgeClass(shot.technique)}`}>
                      {shot.technique}
                    </span>
                  </div>

                  {/* Duration & Timecode */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 text-xs font-mono bg-black/80 backdrop-blur-md rounded border border-stone-700 text-stone-300">
                    {shot.duration}s · {shot.timecodeStart}
                  </div>

                  {/* Play overlay button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <button className="w-10 h-10 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>

                  {/* Active playing indicator */}
                  {isCurrentlyPlaying && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-amber-400 text-stone-950 text-[10px] font-mono font-bold rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-ping" />
                      SEDANG TAYANG
                    </div>
                  )}
                </div>

                {/* Shot Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-1">
                      {shot.segmentName} · {shot.cameraStyle}
                    </div>
                    <h3 className="text-base font-serif font-semibold text-stone-100 group-hover:text-amber-300 transition-colors">
                      {shot.title}
                    </h3>
                    <p className="text-xs text-stone-300 mt-1.5 leading-relaxed line-clamp-2">
                      {shot.description}
                    </p>
                  </div>

                  {/* Narration quote snippet */}
                  <div className="pt-2 border-t border-stone-800">
                    <p className="text-xs italic font-serif text-amber-100/90 line-clamp-2">
                      &ldquo;{shot.narrationId}&rdquo;
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => onSelectShot(shot)}
                      className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>Putar Shot</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() =>
                        setActiveExpandedShot(activeExpandedShot === shot.id ? null : shot.id)
                      }
                      className="text-stone-400 hover:text-stone-200 cursor-pointer"
                    >
                      {activeExpandedShot === shot.id ? 'Tutup Detail' : 'Detail Shot'}
                    </button>
                  </div>

                  {/* Expanded Detail Drawer */}
                  {activeExpandedShot === shot.id && (
                    <div className="pt-3 border-t border-stone-800 text-xs text-stone-300 space-y-2.5 animate-fade-in bg-stone-950/60 p-3 rounded-lg">
                      <div>
                        <span className="font-semibold text-stone-400 block mb-0.5">Catatan Sutradara:</span>
                        <p className="text-stone-300 leading-relaxed">{shot.directorNotes}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-stone-400 block mb-0.5">Desain Suara:</span>
                        <p className="text-amber-200/90">{shot.soundscapeCue}</p>
                      </div>
                      {shot.ecologicalFact && (
                        <div>
                          <span className="font-semibold text-stone-400 block mb-0.5">Konteks Ekologis:</span>
                          <p className="text-emerald-300/90">{shot.ecologicalFact}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RENDER TABLE VIEW (Production Cue Sheet) */}
      {viewMode === 'table' && (
        <div className="bg-stone-900 rounded-xl border border-stone-800 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-950 text-stone-400 border-b border-stone-800 font-mono">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">TIMECODE</th>
                <th className="py-3 px-3">DUR</th>
                <th className="py-3 px-3">SEGMEN</th>
                <th className="py-3 px-3">TEKNIK</th>
                <th className="py-3 px-4">DESKRIPSI SHOT</th>
                <th className="py-3 px-4">NARASI</th>
                <th className="py-3 px-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredShots.map((shot) => {
                const isCurrentlyPlaying = currentSecond >= shot.startTime && currentSecond < shot.endTime;
                return (
                  <tr
                    key={shot.id}
                    className={`hover:bg-stone-800/40 transition-colors ${
                      isCurrentlyPlaying ? 'bg-amber-400/10' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      {shot.id}
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-400 whitespace-nowrap">
                      {shot.timecodeStart} - {shot.timecodeEnd}
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-300">
                      {shot.duration}s
                    </td>
                    <td className="py-3 px-3 text-stone-300 font-medium whitespace-nowrap">
                      {shot.segmentName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded border text-[10px] ${getTechniqueBadgeClass(shot.technique)}`}>
                        {shot.technique}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-200 max-w-xs">
                      <div className="font-medium text-stone-100">{shot.title}</div>
                      <div className="text-stone-400 truncate mt-0.5">{shot.description}</div>
                    </td>
                    <td className="py-3 px-4 text-amber-100/90 italic font-serif max-w-sm truncate">
                      &ldquo;{shot.narrationId}&rdquo;
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectShot(shot)}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded text-xs transition-colors cursor-pointer"
                      >
                        Putar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
