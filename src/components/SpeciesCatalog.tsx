import React from 'react';
import { ShieldAlert, Sparkles, AlertOctagon, HeartHandshake, Play, ExternalLink } from 'lucide-react';
import { SPECIES_CATALOG, SHOTS, Shot } from '../data/documentaryData';
import { getShotImage } from '../assets/imageMap';

interface SpeciesCatalogProps {
  onSelectShot: (shot: Shot) => void;
}

export const SpeciesCatalog: React.FC<SpeciesCatalogProps> = ({ onSelectShot }) => {
  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-stone-900/60 rounded-xl p-5 border border-stone-800">
        <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
          Fauna & Flora Endemik Wallacea
        </h2>
        <p className="text-xs text-stone-300 mt-1 max-w-3xl leading-relaxed">
          Karakteristik biologis, status keterancaman Daftar Merah IUCN, dan keterikatan ekologis mereka dengan habitat purba Sulawesi yang diangkat dalam film dokumenter.
        </p>
      </div>

      {/* Grid of Species */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SPECIES_CATALOG.map((sp, idx) => {
          const imgUrl = getShotImage(sp.imageKey);
          return (
            <div
              key={idx}
              className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden flex flex-col justify-between hover:border-amber-400/40 transition-all shadow-lg"
            >
              {/* Image banner */}
              <div className="relative aspect-video bg-black overflow-hidden">
                <img
                  src={imgUrl}
                  alt={sp.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-red-950/80 border border-red-700/60 text-red-300 font-semibold">
                      {sp.iucnStatus}
                    </span>
                    <span className="text-xs text-stone-300 font-mono">
                      Endemik {sp.endemicTo}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-100">
                    {sp.name}
                  </h3>
                  <p className="text-xs italic text-amber-300/90 font-serif">
                    {sp.scientificName}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3 text-xs text-stone-300">
                  <div>
                    <span className="font-semibold text-stone-400 block mb-1">Keunikan Adaptasi Biologis:</span>
                    <p className="leading-relaxed text-stone-200">{sp.keyTrait}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-red-400 block mb-1">Ancaman Kelestarian:</span>
                    <p className="leading-relaxed text-stone-300">{sp.threats}</p>
                  </div>
                </div>

                {/* Related shots quick launch */}
                <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-mono">Kemunculan di Film:</span>
                  <div className="flex items-center gap-1.5">
                    {idx === 0 && (
                      <button
                        onClick={() => {
                          const s = SHOTS.find((shot) => shot.id === 14);
                          if (s) onSelectShot(s);
                        }}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Segmen 3 (Maleo)</span>
                      </button>
                    )}
                    {idx === 1 && (
                      <button
                        onClick={() => {
                          const s = SHOTS.find((shot) => shot.id === 9);
                          if (s) onSelectShot(s);
                        }}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Shot 9 (Anoa)</span>
                      </button>
                    )}
                    {idx === 2 && (
                      <button
                        onClick={() => {
                          const s = SHOTS.find((shot) => shot.id === 10);
                          if (s) onSelectShot(s);
                        }}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Shot 10 (Babirusa)</span>
                      </button>
                    )}
                    {idx === 3 && (
                      <button
                        onClick={() => {
                          const s = SHOTS.find((shot) => shot.id === 11);
                          if (s) onSelectShot(s);
                        }}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Shot 11 (Tarsius)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
