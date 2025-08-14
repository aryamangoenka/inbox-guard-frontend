"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "./ToastHost";

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: "sm" | "md";
}

export function CopyButton({ value, className, size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const baseClasses =
    "inline-flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1";
  const sizeClasses = size === "sm" ? "text-xs" : "text-sm";

  return (
    <button
      onClick={handleCopy}
      className={cn(baseClasses, sizeClasses, className)}
      title={copied ? "Copied!" : "Copy to clipboard"}
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          Copy
        </>
      )}
    </button>
  );
}
