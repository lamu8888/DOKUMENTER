import React, { useState } from 'react';
import { Compass, MapPin, AlertTriangle, ShieldCheck, Info, ExternalLink, Play } from 'lucide-react';
import { SHOTS, Shot } from '../data/documentaryData';

interface Hotspot {
  id: string;
  name: string;
  category: 'sanctuary' | 'threat' | 'nesting';
  coordinates: string;
  xPct: number; // SVG coordinate percent
  yPct: number;
  description: string;
  species: string[];
  threatLevel: 'Aman / Terjaga' | 'Kritis / Terancam Punah' | 'Ancaman Tambang Sangat Tinggi';
  relatedShotIds: number[];
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'bogani',
    name: 'TN Bogani Nani Wartabone',
    category: 'sanctuary',
    coordinates: '00°35\'N 123°40\'E',
    xPct: 62,
    yPct: 22,
    description: 'Benteng konservasi utama Maleo di semenanjung utara dengan sumber air panas vulkanik alami di pedalaman hutan lindung.',
    species: ['Maleo Senkawor', 'Anoa Dataran Rendah', 'Babirusa', 'Rangkong Sulawesi'],
    threatLevel: 'Aman / Terjaga',
    relatedShotIds: [2, 14, 16, 31, 33],
  },
  {
    id: 'tangkoko',
    name: 'Cagar Alam Tangkoko Batuangus',
    category: 'sanctuary',
    coordinates: '01°34\'N 125°11\'E',
    xPct: 75,
    yPct: 15,
    description: 'Habitat pesisir berpasir hitam vulkanik dan hutan primer tempat Tarsius spectrumgouldi dan Yaki (Macaca nigra) berkembang biak.',
    species: ['Tarsius Sulawesi', 'Burung Maleo Pesisir', 'Kuskus Beruang'],
    threatLevel: 'Aman / Terjaga',
    relatedShotIds: [11, 15, 30],
  },
  {
    id: 'bakiriang',
    name: 'Suaka Margasatwa Bakiriang (Banggai)',
    category: 'nesting',
    coordinates: '01°12\'S 122°45\'E',
    xPct: 68,
    yPct: 45,
    description: 'Lokasi peneluran pesisir pasir hangat utama burung Maleo. Komunitas adat dan jagawana aktif menjaga penetasan semi-alami di sini.',
    species: ['Maleo Senkawor (Koloni Peneluran)'],
    threatLevel: 'Kritis / Terancam Punah',
    relatedShotIds: [15, 17, 20, 32, 33],
  },
  {
    id: 'lorelindu',
    name: 'Taman Nasional Lore Lindu',
    category: 'sanctuary',
    coordinates: '01°25\'S 120°08\'E',
    xPct: 42,
    yPct: 42,
    description: 'Cagar Biosfer UNESCO dengan hutan pegunungan basah lebat, suaka bagi Anoa pegunungan dan spesies katak endemik.',
    species: ['Anoa Pegunungan', 'Babirusa', 'Tarsius Kerdil'],
    threatLevel: 'Aman / Terjaga',
    relatedShotIds: [9, 10, 31],
  },
  {
    id: 'morowali',
    name: 'Kawasan Tambang & Smelter Morowali',
    category: 'threat',
    coordinates: '02°45\'S 122°08\'E',
    xPct: 60,
    yPct: 58,
    description: 'Episentrum ekstraksi nikel laterit skala industri masif. Pengupasan lapisan tanah atas ultrabasa menyebabkan sedimentasi sungai dan laut Teluk Tolo.',
    species: ['Flora Ultrabasa Hiperakumulator', 'Terumbu Karang Pesisir'],
    threatLevel: 'Ancaman Tambang Sangat Tinggi',
    relatedShotIds: [23, 24, 25, 26, 27, 29],
  },
  {
    id: 'pomalaa',
    name: 'Pomalaa & Kolaka (Sulawesi Tenggara)',
    category: 'threat',
    coordinates: '04°12\'S 121°36\'E',
    xPct: 48,
    yPct: 75,
    description: 'Kawasan konsesi nikel tertua dan pelabuhan jetty pemuatan tongkang ore nikel. Terjadi abrasi dan pencemaran lumpur merah di pesisir.',
    species: ['Hutan Mangrove', 'Ikan Karang Tradisional'],
    threatLevel: 'Ancaman Tambang Sangat Tinggi',
    relatedShotIds: [24, 26, 27, 37],
  },
];

interface BiogeographyMapProps {
  onSelectShot: (shot: Shot) => void;
}

export const BiogeographyMap: React.FC<BiogeographyMapProps> = ({ onSelectShot }) => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(HOTSPOTS[0]);
  const [activeLayer, setActiveLayer] = useState<'all' | 'sanctuaries' | 'threats'>('all');

  const filteredHotspots = HOTSPOTS.filter((h) => {
    if (activeLayer === 'sanctuaries') return h.category === 'sanctuary' || h.category === 'nesting';
    if (activeLayer === 'threats') return h.category === 'threat';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Intro card */}
      <div className="bg-stone-900/60 rounded-xl p-5 border border-stone-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
              <Compass className="w-4 h-4" />
              <span>TEORI BIOGEOGRAFI ALFRED RUSSEL WALLACE (1859)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Peta Garis Wallace & Ekosistem Sulawesi
            </h2>
            <p className="text-xs text-stone-300 mt-1 max-w-3xl leading-relaxed">
              Selat Makassar dengan kedalaman lebih dari 2.000 meter memisahkan fauna Asia di Kalimantan dari fauna purba Sulawesi. Isolasi jutaan tahun melahirkan spesies yang tidak ada di belahan bumi mana pun.
            </p>
          </div>

          {/* Filter layers */}
          <div className="flex items-center gap-2 bg-stone-950 p-1 rounded-lg border border-stone-800 shrink-0">
            <button
              onClick={() => setActiveLayer('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeLayer === 'all' ? 'bg-stone-800 text-stone-100' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Semua Titik
            </button>
            <button
              onClick={() => setActiveLayer('sanctuaries')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeLayer === 'sanctuaries' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Kawasan Konservasi
            </button>
            <button
              onClick={() => setActiveLayer('threats')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeLayer === 'threats' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Zona Tambang Nikel
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Interactive Map + Hotspot Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Map Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-stone-900 rounded-xl border border-stone-800 p-4 sm:p-6 overflow-hidden relative">
          <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-3 border-b border-stone-800 pb-2">
            <span>PETA WALLACEA & SULAWESI</span>
            <span className="text-amber-400">GARIS WALLACE: SELAT MAKASSAR</span>
          </div>

          <div className="relative aspect-[4/3] bg-[#12100d] rounded-lg border border-stone-800/80 overflow-hidden select-none">
            {/* Deep ocean background */}
            <div className="absolute inset-0 bg-[radial-gradient(#26201a_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

            {/* Deep Trench Makassar strait water bathymetry */}
            <div className="absolute top-0 bottom-0 left-[22%] w-[10%] bg-blue-950/20 border-r border-blue-900/40 pointer-events-none" />

            {/* SVG Base */}
            <svg viewBox="0 0 500 400" className="w-full h-full">
              {/* Kalimantan / Borneo edge */}
              <path
                d="M -20,100 Q 80,80 90,160 Q 100,240 40,320 L -20,350 Z"
                fill="#1f1a14"
                stroke="#3d3328"
                strokeWidth="1.5"
              />
              <text x="35" y="200" fill="#685642" fontSize="10" fontFamily="sans-serif" textAnchor="middle">
                KALIMANTAN
              </text>
              <text x="35" y="215" fill="#4a3e30" fontSize="7" fontFamily="sans-serif" textAnchor="middle">
                (Fauna Asia)
              </text>

              {/* Luminous Wallace Line dividing Kalimantan and Sulawesi */}
              <line
                x1="125"
                y1="20"
                x2="125"
                y2="380"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="6,4"
              />
              <text x="125" y="16" fill="#f59e0b" fontSize="8" fontFamily="mono" textAnchor="middle">
                GARIS WALLACE (1859)
              </text>

              {/* K-shaped Sulawesi Silhouette */}
              <path
                d="M 230,120 
                   Q 310,110 380,80 
                   Q 330,120 300,140 
                   Q 370,180 400,220 
                   Q 330,220 280,180 
                   Q 260,250 230,340 
                   Q 210,240 230,180 
                   Q 180,160 230,120 Z"
                fill="#272a24"
                stroke="#475240"
                strokeWidth="2"
              />
              <text x="280" y="165" fill="#a7bba0" fontSize="14" fontFamily="serif" fontWeight="bold">
                SULAWESI
              </text>
              <text x="280" y="180" fill="#75886e" fontSize="8" fontFamily="sans-serif">
                Pusat Endemik Wallacea
              </text>
            </svg>

            {/* Interactive Pins */}
            {filteredHotspots.map((spot) => {
              const isSelected = selectedHotspot.id === spot.id;
              const isThreat = spot.category === 'threat';
              return (
                <button
                  key={spot.id}
                  onClick={() => setSelectedHotspot(spot)}
                  style={{ left: `${spot.xPct}%`, top: `${spot.yPct}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full cursor-pointer transition-all ${
                    isSelected
                      ? 'scale-125 ring-4 ring-amber-400 bg-amber-400 text-stone-950 shadow-lg z-20'
                      : isThreat
                      ? 'bg-red-500 text-white hover:scale-110 z-10'
                      : 'bg-emerald-500 text-white hover:scale-110 z-10'
                  }`}
                  title={spot.name}
                >
                  <MapPin className="w-3.5 h-3.5 fill-current" />
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Kawasan Suaka Maleo</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span>Zona Industri Nikel Laterit</span>
              </span>
            </div>
            <span className="font-mono text-stone-500">Klik pin peta untuk info detail</span>
          </div>
        </div>

        {/* Hotspot Inspector Panel (5 cols) */}
        <div className="lg:col-span-5 bg-stone-900 rounded-xl border border-stone-800 p-5 space-y-4">
          <div className="border-b border-stone-800 pb-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-mono text-stone-400">
                {selectedHotspot.coordinates}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                  selectedHotspot.category === 'threat'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {selectedHotspot.threatLevel}
              </span>
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-100">
              {selectedHotspot.name}
            </h3>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            {selectedHotspot.description}
          </p>

          {/* Key Species list */}
          <div>
            <h4 className="text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
              Spesies & Ekosistem Terkait:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedHotspot.species.map((sp, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 bg-stone-950 rounded border border-stone-800 text-stone-200"
                >
                  {sp}
                </span>
              ))}
            </div>
          </div>

          {/* Related documentary shots */}
          <div className="pt-2 border-t border-stone-800">
            <h4 className="text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
              Shot Terkait di Film Dokumenter:
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {selectedHotspot.relatedShotIds.map((shotId) => {
                const shot = SHOTS.find((s) => s.id === shotId);
                if (!shot) return null;
                return (
                  <button
                    key={shot.id}
                    onClick={() => onSelectShot(shot)}
                    className="w-full text-left p-2 rounded bg-stone-950 hover:bg-stone-800/80 border border-stone-800/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="truncate mr-2">
                      <span className="font-mono text-amber-400 text-xs mr-2 font-bold">
                        Shot #{shot.id}
                      </span>
                      <span className="text-xs text-stone-200 group-hover:text-amber-300">
                        {shot.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono shrink-0">
                      {shot.duration}s
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
