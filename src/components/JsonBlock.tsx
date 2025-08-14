import { CopyButton } from "./CopyButton";
import { cn } from "@/lib/utils";

interface JsonBlockProps {
  data: unknown;
  title?: string;
  className?: string;
}

export function JsonBlock({ data, title, className }: JsonBlockProps) {
  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className={cn("bg-gray-50 rounded-md p-4", className)}>
      {title && (
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
          <CopyButton value={jsonString} />
        </div>
      )}
      <pre className="text-sm text-gray-900 overflow-auto max-h-96">
        {jsonString}
      </pre>
      {!title && (
        <div className="flex justify-end mt-2">
          <CopyButton value={jsonString} />
        </div>
      )}
    </div>
  );
}
