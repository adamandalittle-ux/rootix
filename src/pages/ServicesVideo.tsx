import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RootixLogo } from "@/components/RootixLogo";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, GraduationCap, Sparkles, BadgePercent, Wallet, Phone } from "lucide-react";

type Mode = "edu" | "design";

// Discount tiers (cumulative thresholds in minutes → discount %)
const EDU_TIERS = [
  { min: 0, pct: 0 },
  { min: 15, pct: 15 },
  { min: 30, pct: 25 },
  { min: 60, pct: 35 },
  { min: 120, pct: 42 },
  { min: 180, pct: 48 },
  { min: 300, pct: 54 },
  { min: 600, pct: 60 },
];

const DESIGN_TIERS = [
  { min: 0, pct: 0 },
  { min: 5, pct: 15 },
  { min: 10, pct: 25 },
  { min: 20, pct: 35 },
  { min: 30, pct: 45 },
  { min: 45, pct: 55 },
  { min: 60, pct: 60 },
];

function discountFor(minutes: number, tiers: { min: number; pct: number }[]) {
  let pct = 0;
  for (const t of tiers) if (minutes >= t.min) pct = t.pct;
  return pct;
}

export default function ServicesVideo() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("edu");
  const isEdu = mode === "edu";
  const maxMinutes = isEdu ? 600 : 60; // 10h or 1h
  const rate = isEdu ? 15 : 40;
  const tiers = isEdu ? EDU_TIERS : DESIGN_TIERS;

  const [minutes, setMinutes] = useState(isEdu ? 10 : 5);

  const calc = useMemo(() => {
    const m = Math.min(minutes, maxMinutes);
    const base = m * rate;
    const pct = discountFor(m, tiers);
    const total = Math.round(base * (1 - pct / 100));
    const saved = base - total;
    return { base, pct, total, saved };
  }, [minutes, maxMinutes, rate, tiers]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setMinutes(m === "edu" ? 10 : 5);
  };

  const formatTime = (m: number) => {
    if (m < 60) return `${m} دقيقة`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem ? `${h} ساعة و ${rem} دقيقة` : `${h} ساعة`;
  };

  const accent = isEdu ? "142 76% 55%" : "280 80% 65%";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <RootixLogo size={36} />
            <span className="font-bold text-lg tracking-tight">ROOTIX</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigate("/services")} className="gap-2">
            <ArrowRight className="w-4 h-4" /> رجوع
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 text-center">مونتاج فيديو</h1>
        <p className="text-muted-foreground text-center mb-10">اختار النوع، حدّد المدة، شوف السعر فوراً</p>

        {/* Mode selector */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => switchMode("edu")}
            className={`text-right rounded-2xl border-2 p-6 transition-all ${
              isEdu ? "bg-card" : "bg-card/50 border-border hover:border-border"
            }`}
            style={isEdu ? { borderColor: "hsl(142 76% 55%)", boxShadow: "0 0 0 4px hsl(142 76% 55% / 0.1)" } : {}}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">مونتاج تعليمي</h3>
            </div>
            <p className="text-sm text-muted-foreground">15 ج / دقيقة — لحد 10 ساعات — خصم لحد 60%</p>
          </button>

          <button
            onClick={() => switchMode("design")}
            className={`text-right rounded-2xl border-2 p-6 transition-all ${
              !isEdu ? "bg-card" : "bg-card/50 border-border hover:border-border"
            }`}
            style={!isEdu ? { borderColor: "hsl(280 80% 65%)", boxShadow: "0 0 0 4px hsl(280 80% 65% / 0.1)" } : {}}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center border"
                style={{ background: "hsl(280 80% 65% / 0.1)", borderColor: "hsl(280 80% 65% / 0.3)" }}>
                <Sparkles className="w-6 h-6" style={{ color: "hsl(280 80% 65%)" }} />
              </div>
              <h3 className="text-xl font-bold">مونتاج تصميم</h3>
            </div>
            <p className="text-sm text-muted-foreground">40 ج / دقيقة — ريلز / شورت / يوتيوب — لحد ساعة — خصم لحد 60%</p>
          </button>
        </div>

        {/* Calculator */}
        <div className="rounded-3xl border border-border bg-card p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at top, hsl(${accent} / 0.3), transparent 60%)` }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">مدة الفيديو</h3>
              <div className="text-2xl font-bold" style={{ color: `hsl(${accent})` }}>
                {formatTime(minutes)}
              </div>
            </div>

            <Slider
              value={[minutes]}
              min={1}
              max={maxMinutes}
              step={1}
              onValueChange={(v) => setMinutes(v[0])}
              className="mb-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground mb-8">
              <span>1 دقيقة</span>
              <span>{isEdu ? "10 ساعات" : "ساعة"}</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl border border-border bg-background/50 p-4">
                <div className="text-xs text-muted-foreground mb-1">السعر الأساسي</div>
                <div className="text-xl font-bold">{calc.base.toLocaleString()} ج</div>
              </div>
              <div className="rounded-xl border p-4"
                style={{ borderColor: `hsl(${accent} / 0.4)`, background: `hsl(${accent} / 0.08)` }}>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <BadgePercent className="w-3 h-3" /> الخصم
                </div>
                <div className="text-xl font-bold" style={{ color: `hsl(${accent})` }}>{calc.pct}%</div>
              </div>
              <div className="rounded-xl border border-border bg-background/50 p-4">
                <div className="text-xs text-muted-foreground mb-1">وفّرت</div>
                <div className="text-xl font-bold text-green-500">{calc.saved.toLocaleString()} ج</div>
              </div>
            </div>

            <div className="rounded-2xl p-6 flex items-center justify-between border-2"
              style={{ borderColor: `hsl(${accent} / 0.5)`, background: `hsl(${accent} / 0.06)` }}>
              <div>
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> السعر النهائي
                </div>
                <div className="text-4xl font-extrabold" style={{ color: `hsl(${accent})` }}>
                  {calc.total.toLocaleString()} <span className="text-xl">ج</span>
                </div>
              </div>
              <a href="https://wa.me/201000000000" target="_blank" rel="noreferrer">
                <Button size="lg" className="gap-2 h-12 px-6 font-bold"
                  style={{ background: `hsl(${accent})`, color: "white" }}>
                  <Phone className="w-4 h-4" /> اطلب دلوقتي
                </Button>
              </a>
            </div>

            {/* Tier ladder */}
            <div className="mt-8">
              <div className="text-sm font-semibold mb-3 text-muted-foreground">شرائح الخصم</div>
              <div className="flex flex-wrap gap-2">
                {tiers.filter(t => t.pct > 0).map((t) => (
                  <div key={t.min}
                    className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                      minutes >= t.min ? "font-bold" : "opacity-50"
                    }`}
                    style={minutes >= t.min ? {
                      background: `hsl(${accent} / 0.15)`,
                      borderColor: `hsl(${accent} / 0.5)`,
                      color: `hsl(${accent})`,
                    } : { borderColor: "hsl(var(--border))" }}>
                    من {formatTime(t.min)} → خصم {t.pct}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
