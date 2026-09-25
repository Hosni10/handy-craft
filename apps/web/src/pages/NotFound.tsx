import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <p className="text-8xl font-bold text-terracotta-200">٤٠٤</p>
      <div>
        <h1 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground">عذرًا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
      </div>
      <Button asChild>
        <Link to="/" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          العودة للرئيسية
        </Link>
      </Button>
    </div>
  );
}
