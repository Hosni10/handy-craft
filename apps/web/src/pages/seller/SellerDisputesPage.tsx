import { SellerLayout } from '@/components/seller/SellerLayout';
import { DisputesList } from '@/pages/disputes/DisputesList';
import { useMyDisputes } from '@/hooks/useDisputes';

export function SellerDisputesPage() {
  const { data, isLoading, isError, refetch } = useMyDisputes();
  return (
    <SellerLayout title="النزاعات">
      <DisputesList
        disputes={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        linkTo={(id) => `/disputes/${id}`}
      />
    </SellerLayout>
  );
}
