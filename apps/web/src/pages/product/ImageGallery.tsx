import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  videoUrl?: string | null;
  name: string;
}

export function ImageGallery({ images, videoUrl, name }: ImageGalleryProps) {
  const [active, setActive] = useState(0);
  const all = [...images];

  function prev() { setActive((a) => (a - 1 + all.length) % all.length); }
  function next() { setActive((a) => (a + 1) % all.length); }

  return (
    <div className="space-y-3">
      {/* Main image / video */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
        {videoUrl && active === all.length - 1 ? (
          <video
            src={videoUrl}
            controls
            className="h-full w-full object-cover"
            poster={images[0]}
          />
        ) : (
          <img
            src={all[active] ?? ''}
            alt={`${name} - صورة ${active + 1}`}
            className="h-full w-full object-cover"
            loading="eager"
          />
        )}

        {/* Arrows — only if > 1 media items */}
        {all.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-all"
              aria-label="الصورة السابقة"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-all"
              aria-label="الصورة التالية"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {all.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                i === active ? 'border-terracotta-400' : 'border-transparent hover:border-terracotta-200'
              )}
            >
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
