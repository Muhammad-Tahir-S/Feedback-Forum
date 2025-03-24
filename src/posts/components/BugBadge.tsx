import { cn } from '@/lib/utils';

export default function BugBadge({
  label,
  value,
  onSelect,
  isSelected,
}: {
  label: string;
  value: string;
  onSelect: (val: string) => void;
  isSelected: boolean;
}) {
  return (
    <button
      className={cn(
        'text-xs h-7 font-medium px-1.5 py-1 rounded-md flex items-center   transition-all cursor-pointer duration-300',
        isSelected ? 'bg-primary hover:bg-primary/80 text-foreground' : 'bg-border hover:bg-accent text-gray-300'
      )}
      type="button"
      onClick={() => onSelect(value)}
    >
      {label}
    </button>
  );
}
