import { cn } from "@/lib/utils";

export type StatusType = "pass" | "warn" | "fail" | "idle";

interface StatusBadgeProps {
  status: StatusType;
  children?: React.ReactNode;
  className?: string;
}

const statusConfig = {
  pass: {
    className: "bg-green-100 text-green-800 border-green-200",
    label: "Pass",
  },
  warn: {
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Warning",
  },
  fail: {
    className: "bg-red-100 text-red-800 border-red-200",
    label: "Fail",
  },
  idle: {
    className: "bg-gray-100 text-gray-600 border-gray-200",
    label: "Idle",
  },
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {children || config.label}
    </span>
  );
}
