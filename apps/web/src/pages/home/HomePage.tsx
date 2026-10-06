import { HeroBanner } from './HeroBanner';
import { CategoryGrid } from './CategoryGrid';
import { ProductSection } from './ProductSection';
import { VerifiedArtisansSection, type VerifiedArtisansSectionProps } from './VerifiedArtisansSection';
import { Separator } from '@/components/ui/separator';
import { useNewArrivals, useReadyToShip, useVerifiedStores, useCategories } from '@/hooks/useProducts';
import type { Product } from '@handycraft/shared';

export function HomePage() {
  const { data: newArrivals = [], isLoading: loadingNew } = useNewArrivals();
  const { data: readyToShip = [], isLoading: loadingRts } = useReadyToShip();
  const { data: stores = [], isLoading: loadingStores } = useVerifiedStores();
  const { data: categories = [], isLoading: loadingCats } = useCategories();

  return (
    <div>
      {/* Hero carousel */}
      <HeroBanner />

      {/* Category grid */}
      <CategoryGrid categories={categories as { id: string; nameAr: string; image?: string | null }[]} isLoading={loadingCats} />

      <Separator className="container mx-auto" />

      {/* New arrivals — live from API */}
      <ProductSection
        title="وصل حديثًا"
        viewAllHref="/search?sort=newest"
        products={newArrivals as Product[]}
        isLoading={loadingNew}
      />

      {/* Verified artisans strip */}
      <VerifiedArtisansSection stores={stores as VerifiedArtisansSectionProps['stores']} isLoading={loadingStores} />

      {/* Ready to ship — live from API */}
      <ProductSection
        title="جاهز للشحن اليوم"
        viewAllHref="/search?madeToOrder=false"
        products={readyToShip as Product[]}
        isLoading={loadingRts}
      />
    </div>
  );
}
