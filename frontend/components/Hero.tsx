"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useLab } from "./providers";

export function Hero() {
  const { t, lang } = useLab();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Staggered entrance — every reveal element rises + fades in sequence.
    const ctx = gsap.context(() => {
      gsap.to(".reveal", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
      });
      // Slow drift on the decorative orbit ring — alive, not restless.
      gsap.to(".orbit", { rotate: 360, duration: 60, repeat: -1, ease: "none" });
    }, root);
    return () => ctx.revert();
  }, [lang]);

  return (
    <section ref={root} className="act" style={{ position: "relative", overflow: "hidden", minHeight: "82vh", display: "flex", alignItems: "center" }}>
      {/* decorative concentric ring — the "instrument / altimeter" motif */}
      <svg className="orbit" width="640" height="640" style={{ position: "absolute", insetInlineEnd: -160, top: -120, opacity: 0.18 }}>
        <circle cx="320" cy="320" r="300" fill="none" stroke="#FFEC00" strokeWidth="2" strokeDasharray="6 14" />
        <circle cx="320" cy="320" r="220" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="2 18" />
        <circle cx="320" cy="320" r="140" fill="none" stroke="#FFEC00" strokeWidth="1.5" />
      </svg>

      <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
        <div className="reveal eyebrow" style={{ color: "var(--yuv-yellow)", marginBottom: 20 }}>
          {t("TRAIN AI · FROM ZERO · ON YOUR OWN HARDWARE", "אימון AI · מאפס · על החומרה שלך")}
        </div>

        <h1 className="reveal display" style={{ fontSize: "clamp(44px, 8vw, 104px)", color: "#fff", maxWidth: 980 }}>
          {lang === "he" ? (
            <>
              ללמד מכונה <span className="hl">לחשוב</span>
              <br />— שורה אחר שורה.
            </>
          ) : (
            <>
              Teach a machine to <span className="hl">think</span>
              <br />— one line at a time.
            </>
          )}
        </h1>

        <p className="reveal" style={{ fontSize: 20, color: "#EDE7FF", maxWidth: 620, marginTop: 24, lineHeight: 1.6 }}>
          {t(
            "No magic, no black boxes. We train a real model on whatever hardware you have — the app auto-detects your GPU or CPU and picks the best settings — and explain every concept at your level, beginner to advanced, in English and Hebrew.",
            "בלי קסמים, בלי קופסאות שחורות. נאמן מודל אמיתי על כל חומרה שיש לך — האפליקציה מזהה אוטומטית GPU או CPU ובוחרת את ההגדרות הטובות ביותר — ונסביר כל מושג ברמה שלך, ממתחיל ועד מתקדם, באנגלית ובעברית."
          )}
        </p>

        <div className="reveal" style={{ marginTop: 36, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a href="#lab" className="btn btn-yellow">{t("Start the Router lab →", "התחל את מעבדת הראוטר →")}</a>
          <a href="#how" className="btn" style={{ background: "transparent", color: "#fff", borderColor: "#fff" }}>
            {t("How training works", "איך אימון עובד")}
          </a>
        </div>
      </div>
    </section>
  );
}
