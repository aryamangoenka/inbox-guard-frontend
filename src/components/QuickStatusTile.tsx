import { StatusBadge } from "./StatusBadge";

interface QuickStatusTileProps {
  title: string;
  loading?: boolean;
  error?: string;
  data?: React.ReactNode;
  lastUpdated?: Date;
}

export function QuickStatusTile({
  title,
  loading,
  error,
  data,
  lastUpdated,
}: QuickStatusTileProps) {
  return (
    <div className="text-center">
      <div className="mb-2">
        {loading ? (
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        ) : error ? (
          <StatusBadge status="fail">{error}</StatusBadge>
        ) : (
          data
        )}
      </div>
      <div className="text-xs text-gray-500">{title}</div>
      {lastUpdated && (
        <div className="text-xs text-gray-400 mt-1">
          {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
