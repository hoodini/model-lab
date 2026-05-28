"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Lang, Level } from "@/lib/content";

type Ctx = {
  lang: Lang;
  level: Level;
  setLang: (l: Lang) => void;
  setLevel: (l: Level) => void;
  t: (en: string, he: string) => string;
};

const LabContext = createContext<Ctx | null>(null);

export function useLab() {
  const c = useContext(LabContext);
  if (!c) throw new Error("useLab must be used inside <LabProvider>");
  return c;
}

export function LabProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [level, setLevel] = useState<Level>("beginner");

  // Restore saved preferences on first load.
  useEffect(() => {
    const sl = localStorage.getItem("lab.lang") as Lang | null;
    const sv = localStorage.getItem("lab.level") as Level | null;
    if (sl) setLang(sl);
    if (sv) setLevel(sv);
  }, []);

  // Keep <html dir/lang> and the tab title in sync with the language —
  // the design system's bilingual rule: the toggle must flip the whole page,
  // including document direction and title.
  useEffect(() => {
    localStorage.setItem("lab.lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.title = lang === "he" ? "מעבדת המודלים — אמן AI מאפס" : "Model Lab — train AI from scratch";
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("lab.level", level);
  }, [level]);

  const t = (en: string, he: string) => (lang === "he" ? he : en);

  return (
    <LabContext.Provider value={{ lang, level, setLang, setLevel, t }}>
      {children}
    </LabContext.Provider>
  );
}
