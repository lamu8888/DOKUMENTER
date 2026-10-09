import React, { useState } from 'react';
import {
  Download,
  Printer,
  FileText,
  FileSpreadsheet,
  Check,
  Shield,
  Layers,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { SHOTS, SEGMENTS, ENVIRONMENTAL_DATA } from '../data/documentaryData';

export const ProductionCueSheet: React.FC = () => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Statistics calculation
  const totalShots = SHOTS.length;
  const aiShots = SHOTS.filter((s) => s.technique === 'AI').length;
  const realFootageShots = SHOTS.filter((s) => s.technique === 'Footage Asli').length;
  const textShots = SHOTS.filter((s) => s.technique === 'Teks').length;
  const audioShots = SHOTS.filter((s) => s.technique === 'Audio').length;
  const combiShots = SHOTS.filter((s) => s.technique === 'Kombinasi').length;

  const exportAsMarkdown = () => {
    let md = `# GARIS WALLACE: Mereka yang Bertahan\n`;
    md += `**Durasi Total**: 10 Menit (600 Detik)\n`;
    md += `**Jumlah Shot**: 41 Shot\n`;
    md += `**Format Visual**: AI Ilustrasi, Footage Asli (Kamera/Drone/Camera Trap), Teks, Audio Metafora\n\n`;

    SEGMENTS.forEach((seg) => {
      md += `## Segmen ${seg.id}: ${seg.title} (${seg.subtitle})\n`;
      md += `Durasi: ${seg.duration}s | Rentang: ${seg.startTime}s - ${seg.endTime}s\n\n`;

      const segShots = SHOTS.filter((s) => s.segmentId === seg.id);
      segShots.forEach((s) => {
        md += `### Shot ${s.id} (${s.duration}s | ${s.timecodeStart} - ${s.timecodeEnd})\n`;
        md += `- **Teknik Visual**: ${s.technique}\n`;
        md += `- **Tipe Kamera**: ${s.cameraStyle}\n`;
        md += `- **Deskripsi**: ${s.description}\n`;
        md += `- **Narasi (ID)**: "${s.narrationId}"\n`;
        md += `- **Narasi (EN)**: "${s.narrationEn}"\n`;
        md += `- **Desain Suara**: ${s.soundscapeCue}\n`;
        md += `- **Catatan Sutradara**: ${s.directorNotes}\n\n`;
      });
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cue_sheet_garis_wallace_41_shot.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedFormat('md');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const exportAsCSV = () => {
    const headers = [
      'Shot ID',
      'Segment',
      'Timecode Start',
      'Timecode End',
      'Duration (s)',
      'Technique',
      'Camera Style',
      'Title',
      'Description',
      'Narration ID',
      'Narration EN',
      'Soundscape Cue',
    ];

    const rows = SHOTS.map((s) => [
      s.id,
      `"${s.segmentName}"`,
      `"${s.timecodeStart}"`,
      `"${s.timecodeEnd}"`,
      s.duration,
      `"${s.technique}"`,
      `"${s.cameraStyle}"`,
      `"${s.title}"`,
      `"${s.description.replace(/"/g, '""')}"`,
      `"${s.narrationId.replace(/"/g, '""')}"`,
      `"${s.narrationEn.replace(/"/g, '""')}"`,
      `"${s.soundscapeCue.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'production_cuesheet_garis_wallace.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedFormat('csv');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const exportAsJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ documentary: 'Garis Wallace', segments: SEGMENTS, shots: SHOTS }, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'garis_wallace_storyboard_data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedFormat('json');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and download buttons */}
      <div className="bg-stone-900/60 rounded-xl p-5 border border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
            Lembar Cue Produksi & Data Ekologis
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            Daftar lengkap instruksi penyutradaraan, timecode editing DaVinci Resolve/Premiere, dan sumber data riset.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportAsMarkdown}
            className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 text-stone-200 border border-stone-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedFormat === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
            <span>Unduh Markdown (.md)</span>
          </button>

          <button
            onClick={exportAsCSV}
            className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 text-stone-200 border border-stone-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedFormat === 'csv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
            <span>Unduh CSV (Excel/EDL)</span>
          </button>

          <button
            onClick={exportAsJSON}
            className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 text-stone-200 border border-stone-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedFormat === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
            <span>Unduh JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Cue Sheet</span>
          </button>
        </div>
      </div>

      {/* Production Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-stone-900 p-3.5 rounded-xl border border-stone-800">
          <span className="text-[11px] font-mono text-stone-400 uppercase block">Durasi Total</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">10:00</span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">600 Detik</span>
        </div>

        <div className="bg-stone-900 p-3.5 rounded-xl border border-stone-800">
          <span className="text-[11px] font-mono text-stone-400 uppercase block">Total Shot</span>
          <span className="text-xl font-bold font-mono text-stone-100 mt-1 block">41 Shot</span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Rerata 14.6s/shot</span>
        </div>

        <div className="bg-stone-900 p-3.5 rounded-xl border border-stone-800">
          <span className="text-[11px] font-mono text-stone-400 uppercase block">Ilustrasi AI</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">{aiShots} Shot</span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">{Math.round((aiShots / totalShots) * 100)}% film</span>
        </div>

        <div className="bg-stone-900 p-3.5 rounded-xl border border-stone-800">
          <span className="text-[11px] font-mono text-stone-400 uppercase block">Footage Asli</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{realFootageShots} Shot</span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Kamera & Drone</span>
        </div>

        <div className="bg-stone-900 p-3.5 rounded-xl border border-stone-800">
          <span className="text-[11px] font-mono text-stone-400 uppercase block">Teks & Tipografi</span>
          <span className="text-xl font-bold font-mono text-sky-400 mt-1 block">{textShots} Shot</span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Judul & Refleksi</span>
        </div>

        <div className="bg-stone-900 p-3.5 rounded-xl border border-stone-800">
          <span className="text-[11px] font-mono text-stone-400 uppercase block">Audio & Kombinasi</span>
          <span className="text-xl font-bold font-mono text-violet-400 mt-1 block">{audioShots + combiShots} Shot</span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Metafora Suara</span>
        </div>
      </div>

      {/* Pacing Breakdown by 6 Segments */}
      <div className="bg-stone-900 rounded-xl border border-stone-800 p-5 space-y-4">
        <h3 className="text-base font-serif font-semibold text-stone-100">
          Distribusi Alur Waktu & Pacing 6 Segmen
        </h3>

        <div className="space-y-3">
          {SEGMENTS.map((seg) => {
            const pct = (seg.duration / 600) * 100;
            const shotCount = seg.shotRange[1] - seg.shotRange[0] + 1;
            return (
              <div key={seg.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: seg.themeColor }}
                    />
                    <span className="font-semibold text-stone-200">
                      Segmen {seg.id}: {seg.title}
                    </span>
                    <span className="text-stone-400">({seg.subtitle})</span>
                  </div>
                  <div className="font-mono text-stone-300">
                    <span>{seg.duration}s ({Math.round(pct)}%)</span>
                    <span className="text-stone-500 mx-1">·</span>
                    <span className="text-amber-400">{shotCount} Shot</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800/80">
                  <div
                    style={{ width: `${pct}%`, backgroundColor: seg.themeColor }}
                    className="h-full rounded-full opacity-80"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Environmental References & Transparency Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-stone-900 rounded-xl border border-stone-800 p-5 space-y-3">
          <div className="flex items-center gap-2 text-stone-200 font-serif font-semibold">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Sumber Data Investigasi & Advokasi Lingkungan</span>
          </div>
          <ul className="space-y-2 text-xs text-stone-300">
            {ENVIRONMENTAL_DATA.sources.map((src, idx) => (
              <li key={idx} className="bg-stone-950 p-2.5 rounded border border-stone-800">
                <span className="font-semibold text-stone-100 block mb-0.5">{src.name}</span>
                <span className="text-stone-400">{src.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-stone-900 rounded-xl border border-stone-800 p-5 space-y-3">
          <div className="flex items-center gap-2 text-stone-200 font-serif font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Pernyataan Etis & Transparansi Penggunaan AI</span>
          </div>
          <div className="bg-stone-950 p-3.5 rounded border border-stone-800 text-xs text-stone-300 leading-relaxed space-y-2">
            <p>{ENVIRONMENTAL_DATA.aiDisclosure}</p>
            <p className="text-stone-400 pt-1 border-t border-stone-800/80">
              Prinsip integritas jurnalistik dijaga dengan memisahkan secara jelas antara adegan rekonstruksi perilaku fauna (AI) dan bukti empiris dampak pertambangan (Footage Asli & Data Satelit).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
