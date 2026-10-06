import { Upload, X, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useDisputes';
import { mediaUrl } from '@/lib/media';
import { ApiError } from '@/lib/api';
import { useState } from 'react';

interface ImagePickerProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
}

/** Uploads images via /api/files and keeps the returned URLs */
export function ImagePicker({ value, onChange, max = 5, label = 'إرفاق صور' }: ImagePickerProps) {
  const upload = useFileUpload();
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const room = max - value.length;
    try {
      const { urls } = await upload.mutateAsync(Array.from(files).slice(0, room));
      onChange([...value, ...urls]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر رفع الصور');
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div key={url} className="relative">
            <img src={mediaUrl(url)} alt="" className="h-16 w-16 rounded-lg object-cover border" />
            <button
              type="button"
              aria-label="حذف الصورة"
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute -top-1.5 -left-1.5 rounded-full bg-background border p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <label className="h-16 w-16 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed cursor-pointer hover:bg-muted/40 text-muted-foreground">
            {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span className="text-[10px]">{label}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={upload.isPending}
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
