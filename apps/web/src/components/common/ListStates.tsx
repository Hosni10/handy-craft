import { Link } from 'react-router-dom';
import { AlertCircle, Inbox, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; to: string };
}

export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-14 px-4 border rounded-xl">
      <Icon className="h-10 w-10 text-muted-foreground/60" />
      <div>
        <p className="font-semibold">{title}</p>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && (
        <Button asChild variant="outline" size="sm">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

export function ErrorState({ message = 'تعذر تحميل البيانات', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-12 text-muted-foreground">
      <AlertCircle className="h-10 w-10" />
      <p>{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}

export function ListSkeleton({ rows = 4, className = 'h-24' }: { rows?: number; className?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`${className} w-full rounded-xl`} />
      ))}
    </div>
  );
}
