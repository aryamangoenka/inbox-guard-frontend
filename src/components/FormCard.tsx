import { cn } from "@/lib/utils";

interface FormCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormCard({
  title,
  subtitle,
  children,
  className,
}: FormCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-6 shadow-sm border border-gray-200",
        className
      )}
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
