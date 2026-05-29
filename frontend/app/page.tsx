"use client";

import { Controls } from "@/components/Controls";
import { ScrollFX } from "@/components/ScrollFX";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { HowItWorks } from "@/components/HowItWorks";
import { Anatomy } from "@/components/Anatomy";
import { RouterLab } from "@/components/RouterLab";
import { SentimentLab } from "@/components/SentimentLab";
import { GemmaLab } from "@/components/GemmaLab";
import { DeepLearning } from "@/components/DeepLearning";
import { Academy } from "@/components/Academy";
import { ComingSoon } from "@/components/ComingSoon";
import { useLab } from "@/components/providers";

const SOCIALS: [string, string][] = [
  ["Website", "https://yuv.ai"],
  ["X", "https://x.com/yuvalav"],
  ["Instagram", "https://instagram.com/yuval_770"],
  ["YouTube", "https://youtube.com/@yuv-ai"],
  ["GitHub", "https://github.com/hoodini"],
  ["LinkedIn", "https://www.linkedin.com/in/yuval-avidani-87081474/"],
  ["Linktree", "https://linktr.ee/yuvai"],
];

export default function Page() {
  const { t } = useLab();
  return (
    <main>
      <ScrollFX />
      <Controls />
      <Hero />
      <Stats />
      <HowItWorks />
      <Anatomy />
      <RouterLab />
      <SentimentLab />
      <GemmaLab />
      <DeepLearning />
      <Academy />
      <ComingSoon />

      <footer className="content" style={{ borderTop: "3px solid var(--yuv-purple)", padding: "48px 0" }}>
        <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="display" style={{ fontSize: 22 }}>MODEL<span style={{ color: "var(--yuv-purple)" }}>LAB</span></div>
            <p className="mono" style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>
              {t("Built with Yuval Avidani · YUV.AI", "נבנה עם יובל אבידני · YUV.AI")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {SOCIALS.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer" className="mono"
                 style={{ fontSize: 13, color: "var(--yuv-purple)", textDecoration: "none", borderBottom: "2px solid var(--yuv-yellow)" }}>
                {name}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
