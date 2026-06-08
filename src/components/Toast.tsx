import { create } from "zustand";
import { useEffect, useState } from "react";

interface ToastState {
  message: string;
  type: "info" | "success" | "error";
  visible: boolean;
  show: (message: string, type?: "info" | "success" | "error") => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: "",
  type: "info",
  visible: false,
  show: (message, type = "info") => set({ message, type, visible: true }),
  hide: () => set({ visible: false }),
}));

export function Toast() {
  const { message, type, visible, hide } = useToastStore();
  const [rendered, setRendered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      setLeaving(false);
    } else if (rendered) {
      setLeaving(true);
      const timer = setTimeout(() => {
        setRendered(false);
        setLeaving(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(hide, 4000);
    return () => clearTimeout(t);
  }, [visible, hide]);

  if (!rendered) return null;

  const cls = ["toast"];
  if (type === "success") cls.push("toast-success");
  if (type === "error") cls.push("toast-error");
  if (leaving) cls.push("toast-leaving");

  return (
    <div className={cls.join(" ")}>
      {message}
    </div>
  );
}
