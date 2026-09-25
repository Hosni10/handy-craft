import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

interface ComingSoonProps {
  title?: string;
}

export function ComingSoon({ title = 'قيد التطوير' }: ComingSoonProps) {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
      <Wrench className="h-16 w-16 text-muted-foreground/50" />
      <div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">هذه الصفحة قيد الإنشاء وستكون متاحة قريبًا.</p>
      </div>
      <Button variant="outline" asChild>
        <Link to="/">العودة للرئيسية</Link>
      </Button>
    </div>
  );
}
