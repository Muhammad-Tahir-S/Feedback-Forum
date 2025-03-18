import { cn } from '../lib/utils';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'circular' | 'dots' | 'pulse';

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', variant = 'circular', className = '', label = 'Loading...' }: SpinnerProps) {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner size={size} className={className} />;
      case 'pulse':
        return <PulseSpinner size={size} className={className} />;
      case 'circular':
      default:
        return <CircularSpinner size={size} className={className} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center" role="status">
      {renderSpinner()}
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}

function CircularSpinner({ size = 'md', className = '' }: { size: SpinnerSize; className?: string }) {
  const sizeClasses = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={cn(
        'rounded-full animate-spin border-transparent border-t-primary border-l-primary',
        sizeClasses[size],
        className
      )}
    />
  );
}

function DotsSpinner({ size = 'md', className = '' }: { size: SpinnerSize; className?: string }) {
  const sizeClasses = {
    xs: 'w-1 h-1 mx-0.5',
    sm: 'w-1.5 h-1.5 mx-0.5',
    md: 'w-2 h-2 mx-1',
    lg: 'w-3 h-3 mx-1',
    xl: 'w-4 h-4 mx-1.5',
  };

  return (
    <div className={cn('flex items-center', className)}>
      <div className={cn('bg-primary rounded-full animate-pulse-dot1', sizeClasses[size])} />
      <div className={cn('bg-primary rounded-full animate-pulse-dot2', sizeClasses[size])} />
      <div className={cn('bg-primary rounded-full animate-pulse-dot3', sizeClasses[size])} />
    </div>
  );
}

function PulseSpinner({ size = 'md', className = '' }: { size: SpinnerSize; className?: string }) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return <div className={cn('rounded-full bg-primary animate-pulse-fade', sizeClasses[size], className)} />;
}
