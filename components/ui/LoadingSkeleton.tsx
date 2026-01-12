'use client';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function LoadingSkeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: LoadingSkeletonProps) {
  const baseClasses = 'skeleton skeleton-shimmer';

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} h-4 rounded`}
            style={{
              width: i === lines - 1 ? '60%' : '100%',
              ...(width && i === 0 ? { width } : {}),
            }}
          />
        ))}
      </div>
    );
  }

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const shapeClasses =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded'
      : 'rounded-lg';

  return (
    <div
      className={`${baseClasses} ${shapeClasses} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  );
}

// Pre-configured skeleton components
export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 card-interactive">
      <LoadingSkeleton variant="rectangular" height={200} className="mb-4" />
      <LoadingSkeleton variant="text" lines={2} className="mb-2" />
      <LoadingSkeleton variant="text" width="60%" />
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return <LoadingSkeleton variant="text" lines={lines} />;
}

export function AvatarSkeleton() {
  return <LoadingSkeleton variant="circular" width={40} height={40} />;
}
