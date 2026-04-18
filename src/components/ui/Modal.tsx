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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="panel-fade-in w-full max-w-3xl rounded-2xl bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="font-['Sora'] text-lg font-semibold text-slate-900">{titulo}</h3>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onCerrar}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
