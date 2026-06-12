import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}

export function Modal({ abierto, titulo, onCerrar, children }: ModalProps) {
  if (!abierto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs">
      <div className="panel-fade-in w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 shadow-panel">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h3 className="font-['Sora'] text-lg font-semibold text-slate-900 dark:text-slate-100">{titulo}</h3>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
            onClick={onCerrar}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5 text-slate-700 dark:text-slate-300">{children}</div>
      </div>
    </div>
  );
}
