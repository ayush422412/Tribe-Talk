import { ImagePlus } from "lucide-react";

export function ImagePicker({ label, previewUrl, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[.12em] text-ink">{label}</span>
      <span className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-ink bg-[#fff9e8] p-3 hover:bg-[#fff3c8]">
        {previewUrl ? <img src={previewUrl} alt="Selected preview" className="h-12 w-12 rounded-lg border-2 border-ink object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-ink bg-white"><ImagePlus size={20} /></span>}
        <span><strong className="block text-sm">Choose an image</strong><small className="text-gray-500">PNG, JPG, GIF, or WebP · 5 MB max</small></span>
        <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
      </span>
    </label>
  );
}
