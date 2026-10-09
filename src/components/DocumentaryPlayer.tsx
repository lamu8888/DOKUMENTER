import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Subtitles,
  AudioLines,
  Info,
  Clock,
  Layers,
  Sparkles,
  Camera,
  ExternalLink,
} from 'lucide-react';
import { Shot, Segment, SHOTS, SEGMENTS } from '../data/documentaryData';
import { getShotImage } from '../assets/imageMap';
import { soundscape } from '../utils/audioSynth';

interface DocumentaryPlayerProps {
  currentSecond: number;
  setCurrentSecond: (sec: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  onSelectShot: (shot: Shot) => void;
  onOpenBiogeography: () => void;
}

export const DocumentaryPlayer: React.FC<DocumentaryPlayerProps> = ({
  currentSecond,
  setCurrentSecond,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  onSelectShot,
  onOpenBiogeography,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(0.6);
  const [isNarrationVoiceOn, setIsNarrationVoiceOn] = useState<boolean>(false);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCinematicScope, setIsCinematicScope] = useState<boolean>(true); // 2.39:1 anamorphic letterbox
  const [showMetadataHud, setShowMetadataHud] = useState<boolean>(true);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const lastNarratedShotRef = useRef<number>(-1);

  // Determine active shot based on currentSecond
  const activeShotIndex = SHOTS.findIndex(
    (s) => currentSecond >= s.startTime && currentSecond < s.endTime
  );
  const currentShot: Shot = activeShotIndex !== -1 ? SHOTS[activeShotIndex] : SHOTS[SHOTS.length - 1];

  // Determine active segment
  const activeSegment: Segment =
    SEGMENTS.find((seg) => currentSecond >= seg.startTime && currentSecond < seg.endTime) ||
    SEGMENTS[SEGMENTS.length - 1];

  // Sync procedural soundscape with active shot
  useEffect(() => {
    if (isPlaying && !isAudioMuted) {
      soundscape.start(currentShot.soundscapeType);
      soundscape.setVolume(audioVolume);
    } else {
      soundscape.stop();
    }
  }, [isPlaying, isAudioMuted, currentShot.soundscapeType, audioVolume]);

  // Sync voiceover narrator with Web Speech API
  useEffect(() => {
    if (!isPlaying || !isNarrationVoiceOn) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (currentShot.id !== lastNarratedShotRef.current) {
      lastNarratedShotRef.current = currentShot.id;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const textToSpeak = language === 'id' ? currentShot.narrationId : currentShot.narrationEn;
        if (textToSpeak) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = language === 'id' ? 'id-ID' : 'en-US';
          utterance.rate = 0.95;
          utterance.pitch = 0.95;
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  }, [currentShot.id, isPlaying, isNarrationVoiceOn, language]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      soundscape.stop();
    };
  }, []);

  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSec = Math.floor(ratio * 600);
    setCurrentSecond(targetSec);
  };

  const handlePrevShot = () => {
    if (activeShotIndex > 0) {
      setCurrentSecond(SHOTS[activeShotIndex - 1].startTime);
    } else {
      setCurrentSecond(0);
    }
  };

  const handleNextShot = () => {
    if (activeShotIndex < SHOTS.length - 1) {
      setCurrentSecond(SHOTS[activeShotIndex + 1].startTime);
    }
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Calculate shot progress percentage
  const shotElapsed = currentSecond - currentShot.startTime;
  const shotProgress = Math.min(100, Math.max(0, (shotElapsed / currentShot.duration) * 100));

  const shotImageUrl = getShotImage(currentShot.imageKey, currentShot.visualTheme);

  return (
    <div
      ref={playerContainerRef}
      className={`relative w-full bg-stone-950 text-stone-100 flex flex-col ${
        isFullscreen ? 'h-screen p-0 justify-between' : 'rounded-2xl border border-stone-800 shadow-2xl overflow-hidden'
      }`}
    >
      {/* CINEMATIC VIEWPORT CANVAS (16:9 or 2.39:1 scope) */}
      <div
        className={`relative w-full bg-black overflow-hidden select-none flex items-center justify-center transition-all ${
          isFullscreen ? 'flex-1' : isCinematicScope ? 'aspect-[2.39/1] min-h-[380px] lg:min-h-[500px]' : 'aspect-video min-h-[360px] lg:min-h-[480px]'
        }`}
      >
        {/* Render shot visual */}
        {renderVisualContent(currentShot, shotImageUrl, shotProgress)}

        {/* Cinematic Letterbox Masking if Cinema Scope is active */}
        {isCinematicScope && !isFullscreen && (
          <>
            <div className="absolute top-0 left-0 right-0 h-6 bg-black pointer-events-none z-10 border-b border-stone-900/40" />
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-black pointer-events-none z-10 border-t border-stone-900/40" />
          </>
        )}

        {/* Top HUD: Segment and Timecode info */}
        {showMetadataHud && (
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-xs font-mono pointer-events-none">
            <div className="flex items-center gap-2 bg-stone-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-800 pointer-events-auto">
              <span className="text-amber-400 font-semibold">SEG {currentShot.segmentId}</span>
              <span className="text-stone-500">·</span>
              <span className="text-stone-200">{currentShot.segmentName}</span>
              <span className="text-stone-500">·</span>
              <span className="text-amber-300">SHOT {currentShot.id} / 41</span>
            </div>

            <div className="flex items-center gap-2 bg-stone-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-800 pointer-events-auto">
              <span className="text-stone-400">TEKNIK:</span>
              <span className="text-emerald-400 font-medium">{currentShot.technique}</span>
              <span className="text-stone-500">·</span>
              <span className="text-stone-300">{currentShot.cameraStyle}</span>
            </div>
          </div>
        )}

        {/* SUBTITLE / NARRATION OVERLAY */}
        <div className="absolute bottom-8 left-6 right-6 z-20 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="max-w-3xl bg-black/75 backdrop-blur-md px-6 py-3 rounded-xl border border-stone-800/80 shadow-2xl">
            <p className="text-base sm:text-lg font-serif italic text-amber-100 tracking-wide leading-relaxed">
              &ldquo;{language === 'id' ? currentShot.narrationId : currentShot.narrationEn}&rdquo;
            </p>
            <div className="mt-1 flex items-center justify-center gap-3 text-xs text-stone-400 font-sans">
              <span>{currentShot.title}</span>
              <span>·</span>
              <span>{formatTimecode(currentShot.startTime)} - {formatTimecode(currentShot.endTime)} ({currentShot.duration}s)</span>
            </div>
          </div>
        </div>

        {/* Soundscape watermark cue */}
        <div className="absolute bottom-4 left-6 z-10 hidden sm:flex items-center gap-1.5 text-[11px] text-stone-400/90 font-mono pointer-events-none">
          <AudioLines className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="truncate max-w-[280px]">{currentShot.soundscapeCue}</span>
        </div>
      </div>

      {/* TIMELINE SCRUBBER & SEGMENT BARS */}
      <div className="px-4 sm:px-6 pt-3 pb-2 bg-stone-950 border-t border-stone-800/80">
        {/* Segment indicator strip */}
        <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-stone-300 font-medium">{activeSegment.title}:</span>
            <span className="text-stone-400">{activeSegment.subtitle}</span>
          </div>
          <div className="flex items-center gap-1 font-mono tabular-nums text-xs">
            <span className="text-amber-400">{formatTimecode(currentSecond)}</span>
            <span className="text-stone-500">/</span>
            <span>10:00</span>
          </div>
        </div>

        {/* Interactive Timeline Bar */}
        <div
          onClick={handleSeek}
          className="relative w-full h-4 bg-stone-900 rounded-md overflow-hidden cursor-pointer group flex items-center border border-stone-800"
          title="Klik untuk melompat di timeline 10 menit"
        >
          {/* 6 Segment Colored Track Zones */}
          {SEGMENTS.map((seg) => {
            const startPct = (seg.startTime / 600) * 100;
            const widthPct = (seg.duration / 600) * 100;
            const isCurrentSeg = seg.id === activeSegment.id;
            return (
              <div
                key={seg.id}
                style={{
                  left: `${startPct}%`,
                  width: `${widthPct}%`,
                  backgroundColor: seg.themeColor,
                  opacity: isCurrentSeg ? 0.45 : 0.2,
                }}
                className="absolute top-0 bottom-0 border-r border-stone-950/60 transition-opacity"
              />
            );
          })}

          {/* Shot tick marks */}
          {SHOTS.map((s) => {
            const tickPct = (s.startTime / 600) * 100;
            return (
              <div
                key={s.id}
                style={{ left: `${tickPct}%` }}
                className="absolute top-0 bottom-0 w-[1px] bg-stone-700/60 group-hover:bg-stone-500/80 pointer-events-none"
              />
            );
          })}

          {/* Filled progress bar */}
          <div
            style={{ width: `${(currentSecond / 600) * 100}%` }}
            className="absolute top-0 bottom-0 bg-amber-400/80 pointer-events-none transition-all duration-150"
          />

          {/* Scrubber head marker */}
          <div
            style={{ left: `${(currentSecond / 600) * 100}%` }}
            className="absolute top-0 bottom-0 w-2 -ml-1 bg-white rounded-sm shadow-md pointer-events-none ring-2 ring-amber-400"
          />
        </div>

        {/* Shot progress within current shot */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono mt-1">
          <div className="flex items-center gap-1.5">
            <span>SHOT {currentShot.id}</span>
            <span>·</span>
            <span>{Math.round(shotElapsed)}s / {currentShot.duration}s</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-stone-400">Total Durasi: 600 Detik</span>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR */}
      <div className="px-4 sm:px-6 py-3 bg-stone-950/90 flex flex-wrap items-center justify-between gap-3 border-t border-stone-800">
        {/* Left: Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSecond(0)}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Ulang dari awal (00:00)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrevShot}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Shot Sebelumnya"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span className="text-xs">Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span className="text-xs">Putar</span>
              </>
            )}
          </button>

          <button
            onClick={handleNextShot}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Shot Berikutnya"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed multiplier selector */}
          <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800 ml-2">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 text-xs font-mono font-medium rounded cursor-pointer transition-colors ${
                  playbackSpeed === spd
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title={`Kecepatan putar ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Center: Language & Audio Settings */}
        <div className="flex items-center gap-3">
          {/* Subtitle language toggle */}
          <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800">
            <button
              onClick={() => setLanguage('id')}
              className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                language === 'id' ? 'bg-stone-800 text-amber-300' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ID (Asli)
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                language === 'en' ? 'bg-stone-800 text-amber-300' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              EN (Festival)
            </button>
          </div>

          {/* Audio Synthesizer Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
                !isAudioMuted
                  ? 'bg-stone-800 border-amber-500/40 text-amber-300'
                  : 'bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-400'
              }`}
              title={isAudioMuted ? 'Nyalakan Ambiens Audio Hutan' : 'Matikan Audio'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">Ambiens Hutan</span>
            </button>

            {!isAudioMuted && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioVolume}
                onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                className="w-16 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                title={`Volume Ambiens: ${Math.round(audioVolume * 100)}%`}
              />
            )}
          </div>

          {/* Voiceover Speech Toggle */}
          <button
            onClick={() => setIsNarrationVoiceOn(!isNarrationVoiceOn)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
              isNarrationVoiceOn
                ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Aktifkan Narator Suara Otomatis (Web Speech API)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Voiceover Narasi</span>
          </button>
        </div>

        {/* Right: Screen & HUD tools */}
        <div className="flex items-center gap-2">
          {/* Cinematic Scope Aspect ratio toggle */}
          <button
            onClick={() => setIsCinematicScope(!isCinematicScope)}
            className={`p-2 text-xs rounded-lg border transition-colors cursor-pointer ${
              isCinematicScope
                ? 'bg-stone-800 border-stone-700 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Toggle Rasio Layar Lebar 2.39:1 Anamorphic"
          >
            {isCinematicScope ? '2.39:1 Scope' : '16:9 Standard'}
          </button>

          {/* HUD toggle */}
          <button
            onClick={() => setShowMetadataHud(!showMetadataHud)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              showMetadataHud
                ? 'bg-stone-800 border-stone-700 text-stone-200'
                : 'bg-stone-900 border-stone-800 text-stone-500'
            }`}
            title="Toggle Info Shot HUD"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Mode Bioskop Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// Specialized visual rendering engine for each documentary shot
function renderVisualContent(shot: Shot, imageUrl: string, progress: number) {
  // 1. Title Card (Shot 5)
  if (shot.id === 5) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-stone-950 p-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-stone-950 to-stone-950" />
        <div className="relative z-10 max-w-2xl animate-fade-in">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400 mb-4 font-sans font-medium">
            Dokumenter Riset Ekologi Sulawesi
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-100 mb-3 text-balance">
            GARIS WALLACE
          </h1>
          <p className="text-lg sm:text-2xl font-serif italic text-amber-200/90 mb-6 tracking-wide">
            Mereka yang Bertahan
          </p>
          <div className="w-16 h-[1px] bg-amber-400/60 mx-auto mb-6" />
          <p className="text-xs font-mono text-stone-400 tracking-wider">
            DURASI 10 MENIT · 41 SHOT · WALLACEA BIODIVERSITY
          </p>
        </div>
      </div>
    );
  }

  // 2. Black Screen Fade (Shot 1 & Shot 38)
  if (shot.id === 1 || shot.id === 38) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-black p-8 text-center">
        {shot.id === 38 && (
          <div className="max-w-xl animate-fade-in">
            <h2 className="text-2xl sm:text-4xl font-serif text-stone-100 tracking-wide mb-4 text-balance">
              &ldquo;Apa yang tidak akan bisa kita kembalikan?&rdquo;
            </h2>
            <div className="w-12 h-[1px] bg-stone-600 mx-auto" />
          </div>
        )}
        {shot.id === 1 && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-stone-800 flex items-center justify-center animate-pulse">
              <AudioLines className="w-6 h-6 text-amber-400/60" />
            </div>
            <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">
              Audio Hutan Fajar Wallacea Dimulai...
            </p>
          </div>
        )}
      </div>
    );
  }

  // 3. Antique Wallace Map (Shot 6 & 7)
  if (shot.id === 6 || shot.id === 7) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-[#181512] overflow-hidden">
        {/* Parchment background texture */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#d6cebe_1px,transparent_1px)] [background-size:16px_16px]" />
        <svg viewBox="0 0 800 450" className="w-full h-full max-w-4xl opacity-90 p-6">
          <rect width="800" height="450" fill="#15120e" />
          {/* Borneo landmass */}
          <path
            d="M 120 180 Q 180 120 280 140 Q 320 200 290 280 Q 200 320 140 260 Z"
            fill="#2c251d"
            stroke="#57493a"
            strokeWidth="2"
          />
          <text x="200" y="220" fill="#8c7860" fontSize="14" fontFamily="serif" textAnchor="middle">
            BORNEO (KALIMANTAN)
          </text>
          <text x="200" y="240" fill="#685642" fontSize="10" fontFamily="sans-serif" textAnchor="middle">
            Paparan Sunda / Fauna Asia
          </text>

          {/* Sulawesi K-shape landmass */}
          <path
            d="M 450 160 L 520 150 L 540 180 L 490 210 L 530 260 L 560 300 L 520 320 L 480 250 L 450 260 L 430 330 L 400 320 L 430 240 L 410 180 Z"
            fill="#382e22"
            stroke="#806c54"
            strokeWidth="2"
          />
          <text x="490" y="235" fill="#e0c7a0" fontSize="16" fontFamily="serif" fontWeight="bold">
            SULAWESI
          </text>
          <text x="490" y="255" fill="#a68e6f" fontSize="10" fontFamily="sans-serif">
            Zona Wallacea (Endemik)
          </text>

          {/* Makassar Strait Deep Trench */}
          <text x="360" y="120" fill="#a89070" fontSize="11" fontFamily="serif" fontStyle="italic" textAnchor="middle">
            SELAT MAKASSAR (Palung Dalam)
          </text>

          {/* Luminous Wallace Line */}
          <line
            x1="360"
            y1="60"
            x2="360"
            y2="400"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="6,4"
            className="animate-pulse"
          />
          <circle cx="360" cy="230" r="5" fill="#f59e0b" />
          <text x="360" y="425" fill="#f59e0b" fontSize="13" fontFamily="serif" fontWeight="bold" textAnchor="middle">
            GARIS WALLACE (1859)
          </text>
        </svg>

        {/* Vintage caption badge */}
        <div className="absolute top-4 right-4 bg-stone-900/90 border border-stone-700 px-3 py-1.5 rounded text-xs font-mono text-amber-200">
          THE MALAY ARCHIPELAGO · A.R. WALLACE
        </div>
      </div>
    );
  }

  // 4. K-Island Glowing Topography (Shot 8)
  if (shot.id === 8) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-stone-950 p-6 overflow-hidden">
        <svg viewBox="0 0 600 400" className="w-full h-full max-w-2xl">
          {/* Stylized Glowing K-shape Sulawesi */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            d="M 280 80 Q 380 90 420 120 Q 360 170 320 180 Q 420 220 460 280 Q 380 290 310 240 Q 280 320 240 340 Q 250 250 270 200 Q 210 180 280 80 Z"
            fill="#10b981"
            fillOpacity="0.3"
            stroke="#34d399"
            strokeWidth="3"
            filter="url(#glow)"
          />
          {/* Key endemic spots */}
          <circle cx="390" cy="115" r="5" fill="#fbbf24" />
          <text x="405" y="118" fill="#fef3c7" fontSize="10" fontFamily="sans-serif">
            Bogani Nani Wartabone (Maleo)
          </text>
          <circle cx="310" cy="220" r="5" fill="#ef4444" />
          <text x="325" y="223" fill="#fca5a5" fontSize="10" fontFamily="sans-serif">
            Morowali & Sorowako (Nikel)
          </text>
          <circle cx="260" cy="300" r="5" fill="#38bdf8" />
          <text x="175" y="303" fill="#bae6fd" fontSize="10" fontFamily="sans-serif">
            Tanjung Bira / Selat
          </text>
        </svg>
        <div className="absolute bottom-6 text-center">
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-mono">
            BENTUK 'K' SULAWESI · 4 SEMENANJUNG PURBA
          </p>
        </div>
      </div>
    );
  }

  // 5. Warning Quote: "Hilang dari sini, hilang dari dunia" (Shot 13)
  if (shot.id === 13) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-stone-950 p-8 text-center">
        <div className="max-w-2xl animate-fade-in">
          <div className="w-8 h-[2px] bg-red-500 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-5xl font-serif text-stone-100 tracking-tight leading-tight mb-4 text-balance">
            &ldquo;Hilang dari sini, hilang dari dunia.&rdquo;
          </h2>
          <p className="text-sm font-sans text-stone-400 tracking-wide max-w-md mx-auto">
            Spesies tunggal pulau tidak memiliki suaka cadangan di benua lain. Kepunahan di Sulawesi adalah kepunahan absolut bagi planet bumi.
          </p>
        </div>
      </div>
    );
  }

  // 6. Satellite Deforestation Timelapse (Shot 23)
  if (shot.id === 23) {
    return (
      <div className="relative w-full h-full bg-stone-900 overflow-hidden flex items-center justify-center">
        <img
          src={imageUrl}
          alt="Deforestasi Satelit Sulawesi"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover filter contrast-125 saturate-150"
        />
        {/* Satellite HUD grid overlay */}
        <div className="absolute inset-0 bg-red-950/20 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 border-[16px] border-black/60 pointer-events-none" />
        <div className="absolute top-8 left-8 bg-black/80 px-3 py-2 rounded border border-red-500/50 font-mono text-xs text-red-400">
          <div>MISSION: LANDSAT-9 / SENTINEL-2 NDVI</div>
          <div className="text-stone-300">KOORDINAT: 02°48&apos;S 121°54&apos;E (SULTENG)</div>
          <div className="text-amber-400 mt-1">TIMELAPSE TUTUPAN KANOPI: -38.4%</div>
        </div>
        <div className="absolute bottom-8 right-8 bg-black/80 px-3 py-1.5 rounded font-mono text-xs text-stone-300">
          DATA: AURIGA NUSANTARA & WALHI
        </div>
      </div>
    );
  }

  // 7. Camera Trap Night-Vision Interface (Shot 31)
  if (shot.id === 31) {
    return (
      <div className="relative w-full h-full bg-stone-950 overflow-hidden flex items-center justify-center">
        <img
          src={imageUrl}
          alt="Rekaman Camera Trap Anoa"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-150 brightness-90"
        />
        {/* Infrared Night Vision scanline vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_black_100%)] pointer-events-none" />
        {/* Camera trap HUD */}
        <div className="absolute top-6 left-6 font-mono text-xs text-emerald-400 bg-black/70 px-2.5 py-1.5 rounded border border-emerald-500/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>REC · INFRARED PIR SENSOR</span>
          </div>
          <div className="text-stone-300 mt-1">LOKASI: BOGANI NANI WARTABONE (ELEV 1,120M)</div>
          <div className="text-stone-300">SUHU: 21.4°C · BATERAI: 92%</div>
        </div>
        {/* Detection reticle */}
        <div className="absolute w-36 h-36 border-2 border-emerald-400/80 rounded-lg pointer-events-none flex items-start justify-start p-1 text-[10px] font-mono text-emerald-300">
          DETEKSI: ANOA SP. (98%)
        </div>
      </div>
    );
  }

  // 8. Credit Roll (Shot 41)
  if (shot.id === 41) {
    return (
      <div className="relative w-full h-full bg-stone-950 flex flex-col items-center justify-center text-center p-8 overflow-hidden">
        <div className="max-w-2xl space-y-4 animate-fade-in">
          <p className="text-xs uppercase tracking-widest text-amber-400 font-mono">
            SUMBER DATA & ADVOKASI LINGKUNGAN
          </p>
          <h3 className="text-xl sm:text-2xl font-serif text-stone-100">
            WALHI · JATAM · AURIGA NUSANTARA · IUCN RED LIST
          </h3>
          <div className="w-12 h-[1px] bg-stone-700 mx-auto my-3" />
          <p className="text-xs text-stone-400 leading-relaxed max-w-lg mx-auto">
            Keterbukaan AI: Rekonstruksi visual perilaku fauna langka menggunakan ilustrasi kecerdasan buatan terkurasi untuk meminimalkan gangguan terhadap populasi liar. Footage pertambangan dan sedimentasi bersumber dari laporan investigatif faktual.
          </p>
          <p className="text-xs font-mono text-amber-300/80 pt-2">
            GARIS WALLACE: MEREKA YANG BERTAHAN © 2026
          </p>
        </div>
      </div>
    );
  }

  // 9. Standard High-Fidelity Cinematic Photographic View with subtle Ken Burns effect
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={imageUrl}
        alt={shot.title}
        referrerPolicy="no-referrer"
        style={{
          transform: `scale(${1 + (progress / 100) * 0.08}) translate(${
            (progress / 100) * 0.8
          }%, ${(progress / 100) * 0.4}%)`,
          transition: 'transform 0.4s ease-out',
        }}
        className="w-full h-full object-cover object-center"
      />
      {/* Cinematic contrast gradient scrim for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30 pointer-events-none" />
    </div>
  );
}
