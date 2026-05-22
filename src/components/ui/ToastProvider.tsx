import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  addToast: (t: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = { id, ...t };
    setToasts((s) => [...s, toast]);
    const timeout = toast.duration ?? 5000;
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), timeout);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => setToasts((s) => s.filter((t) => t.id !== id)), []);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full rounded-md p-3 shadow-lg border ${
              t.type === "success" ? "bg-green-50 border-green-200" : t.type === "error" ? "bg-red-50 border-red-200" : "bg-white border-slate-200"
            }`}
          >
            {t.title && <div className="font-semibold text-sm mb-1">{t.title}</div>}
            <div className="text-sm text-slate-700">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
