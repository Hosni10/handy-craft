import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    id: 1,
    title: 'تسوق المنتجات اليدوية المصرية',
    subtitle: 'مئات المنتجات الأصيلة من حرفيين مصريين موثوقين',
    cta: 'تسوق الآن',
    href: '/search',
    image: 'https://picsum.photos/seed/500/1200/500',
  },
  {
    id: 2,
    title: 'حرف أصيلة من قلب مصر',
    subtitle: 'سيراميك، نحاس، تطريز، كروشيه — كل قطعة تحكي قصة',
    cta: 'استكشف الحرف',
    href: '/search?categoryId=ceramics',
    image: 'https://picsum.photos/seed/501/1200/500',
  },
  {
    id: 3,
    title: 'ادعم الحرفيين المحليين',
    subtitle: 'كل عملية شراء تدعم أسرة مصرية وتحافظ على التراث اليدوي',
    cta: 'تعرف على حرفيينا',
    href: '/stores',
    image: 'https://picsum.photos/seed/502/1200/500',
  },
];

export function HeroBanner() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => setActive((a) => (a + 1) % SLIDES.length), []);
  const prev = useCallback(() => setActive((a) => (a - 1 + SLIDES.length) % SLIDES.length), []);

  // Auto-advance every 5 s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative h-[380px] sm:h-[460px] overflow-hidden bg-terracotta-900">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-l from-terracotta-900/70 to-transparent" />

          {/* Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 max-w-xl">
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-snug mb-3">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-base text-sand-100 mb-6 leading-relaxed">
              {slide.subtitle}
            </p>
            <Button asChild size="lg" className="w-fit bg-terracotta-500 hover:bg-terracotta-600">
              <Link to={slide.href}>{slide.cta}</Link>
            </Button>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
        aria-label="السابق"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
        aria-label="التالي"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === active ? 'w-6 bg-white' : 'w-2 bg-white/50'
            )}
            aria-label={`الشريحة ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
