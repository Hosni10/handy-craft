import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  onReject: (reason: string) => Promise<void> | void;
  disabled?: boolean;
  label?: string;
}

/** "Reject" button that expands into a reason field before confirming */
export function RejectWithReason({ onReject, disabled, label = 'رفض' }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!open) {
    return (
      <Button size="sm" variant="outline" disabled={disabled} onClick={() => setOpen(true)}>
        {label}
      </Button>
    );
  }

  return (
    <form
      className="flex gap-2 w-full"
      onSubmit={async (e) => {
        e.preventDefault();
        await onReject(reason);
        setOpen(false);
        setReason('');
      }}
    >
      <Input
        autoFocus
        placeholder="سبب الرفض"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        minLength={3}
        required
        className="h-9"
      />
      <Button type="submit" size="sm" variant="destructive" disabled={disabled}>تأكيد</Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
    </form>
  );
}
