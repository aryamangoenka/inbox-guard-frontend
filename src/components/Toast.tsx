import { useEffect, useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2500);
    return () => clearTimeout(t);
  }, [msg]);

  function Toast() {
    if (!msg) return null;
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black text-white px-3 py-2 text-sm shadow z-50">
        {msg}
      </div>
    );
  }

  return { setMsg, Toast };
}
