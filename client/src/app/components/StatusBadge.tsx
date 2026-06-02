import { Badge } from './ui/badge';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: AppointmentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-[var(--status-pending-bg)] text-[var(--status-pending-foreground)] border-[var(--status-pending)]';
      case 'confirmed':
        return 'bg-[var(--status-confirmed-bg)] text-[var(--status-confirmed-foreground)] border-[var(--status-confirmed)]';
      case 'completed':
        return 'bg-[var(--status-completed-bg)] text-[var(--status-completed-foreground)] border-[var(--status-completed)]';
      case 'cancelled':
        return 'bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-foreground)] border-[var(--status-cancelled)]';
      default:
        return '';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusStyles(status)} capitalize`}>
      {status}
    </Badge>
  );
}
