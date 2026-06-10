import { useEffect, useState } from "react";
import { RootixLogo } from "@/components/RootixLogo";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  primary?: string;
  accent?: string;
  onDone?: () => void;
  durationMs?: number;
}

const STAGES = [
  "تهيئة Rooty للفحص…",
  "فحص المحتوى والدروس…",
  "تحليل الفيديوهات والملفات…",
  "مراجعة الأسئلة والامتحانات…",
  "تحقق من بيانات الطلاب…",
  "حساب مؤشر الصحة العام…",
  "تجهيز التقرير النهائي…",
];

export default function RootyScanAnimation({ open, primary = "#22c55e", accent, onDone, durationMs = 12000 }: Props) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const acc = accent || primary;

  useEffect(() => {
    if (!open) return;
    setProgress(0); setStage(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / durationMs) * 100);
      setProgress(p);
      setStage(Math.min(STAGES.length - 1, Math.floor((p / 100) * STAGES.length)));
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(() => onDone?.(), 600);
      }
    }, 80);
    return () => clearInterval(tick);
  }, [open, durationMs, onDone]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: "radial-gradient(circle at center, rgba(0,0,0,0.92), rgba(0,0,0,0.98))" }}>
      {/* Orbiting particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${2 + (i % 4)}px`, height: `${2 + (i % 4)}px`,
              left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%`,
              background: i % 2 ? primary : acc,
              opacity: 0.4, boxShadow: `0 0 12px ${primary}`,
              animationDelay: `${i * 60}ms`, animationDuration: `${2 + (i % 3)}s`,
            }} />
        ))}
      </div>

      {/* Center cinematic stack */}
      <div className="relative z-10 w-[92vw] max-w-md text-center">
        {/* Spinning rings */}
        <div className="relative w-44 h-44 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-dashed animate-spin" style={{ borderColor: `${primary}55`, animationDuration: "8s" }} />
          <div className="absolute inset-3 rounded-full border-2 animate-spin" style={{ borderColor: `${acc}88`, borderTopColor: "transparent", animationDuration: "3s", animationDirection: "reverse" }} />
          <div className="absolute inset-6 rounded-full border-2 animate-spin" style={{ borderColor: `${primary}`, borderRightColor: "transparent", animationDuration: "1.6s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: primary, opacity: 0.55 }} />
              <RootixLogo size={72} className="relative" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-white mb-1 tracking-wide">Rooty يفحص منصتك الآن</h2>
        <p className="text-xs text-white/60 mb-6">من فضلك انتظر — الفحص الذكي قيد التشغيل</p>

        {/* Stage list */}
        <div className="space-y-1.5 mb-6 text-right">
          {STAGES.map((s, i) => {
            const done = i < stage;
            const current = i === stage;
            return (
              <div key={i} className="flex items-center gap-2 text-sm transition-all"
                style={{ opacity: done ? 0.55 : current ? 1 : 0.25, transform: current ? "translateX(-4px)" : "none" }}>
                {done ? (
                  <CheckCircle2 className="w-4 h-4" style={{ color: primary }} />
                ) : current ? (
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: acc }} />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/20" />
                )}
                <span className="text-white">{s}</span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full overflow-hidden bg-white/10">
          <div className="h-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${primary}, ${acc})`, boxShadow: `0 0 24px ${primary}` }} />
        </div>
        <div className="mt-2 text-xs text-white/70 font-mono">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}
