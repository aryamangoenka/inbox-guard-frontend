import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outline";
}

function Card({ children, className, variant = "default" }: CardProps) {
  const variants = {
    default: "bg-white border border-gray-200 shadow-sm",
    elevated: "bg-white border border-gray-200 shadow-lg",
    outline: "bg-transparent border border-gray-300",
  };

  return (
    <div className={cn("rounded-xl", variants[variant], className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-200", className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent, CardFooter };
