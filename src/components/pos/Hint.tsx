import { useEffect, useState } from "react";
import { Lightbulb, X } from "lucide-react";

/** Brief usage hint shown once per screen (remembered in this browser). */
export function Hint({ id, children }: { id: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(!localStorage.getItem("hint-" + id)); }, [id]);
  if (!show) return null;
  const close = () => { localStorage.setItem("hint-" + id, "1"); setShow(false); };
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-accent-foreground/15 bg-accent px-4 py-3 text-accent-foreground">
      <Lightbulb className="mt-0.5 size-5 shrink-0" aria-hidden />
      <p className="flex-1 text-[15px] leading-snug">{children}</p>
      <button onClick={close} aria-label="Dismiss hint" className="-m-2 grid size-11 place-items-center rounded-lg hover:bg-accent-foreground/10">
        <X className="size-5" />
      </button>
    </div>
  );
}
