import { AccountLayout } from '@/components/layout/AccountLayout';
import { DisputesList } from '@/pages/disputes/DisputesList';
import { useMyDisputes } from '@/hooks/useDisputes';

export function AccountDisputesPage() {
  const { data, isLoading, isError, refetch } = useMyDisputes();
  return (
    <AccountLayout title="النزاعات">
      <DisputesList
        disputes={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        linkTo={(id) => `/disputes/${id}`}
      />
    </AccountLayout>
  );
}
