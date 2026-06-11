import { Link, useNavigate } from "react-router-dom";
import { RootixLogo } from "@/components/RootixLogo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, Gamepad2, UtensilsCrossed, Settings2 } from "lucide-react";

const SYSTEMS = [
  { key: "cashier", label: "سيستم كاشير", desc: "للمحلات والسوبر ماركت", Icon: Calculator, color: "142 76% 55%" },
  { key: "playstation", label: "سيستم بلاي ستيشن", desc: "لمحلات الجيمنج والترفيه", Icon: Gamepad2, color: "210 90% 60%" },
  { key: "restaurant", label: "سيستم مطعم", desc: "للمطاعم والكافيهات", Icon: UtensilsCrossed, color: "28 92% 60%" },
  { key: "custom", label: "سيستم خاص", desc: "نبنيله سيستم بمواصفاتك", Icon: Settings2, color: "280 80% 65%" },
];

export default function ServicesSystems() {
  const navigate = useNavigate();
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

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <h1 className="text-4xl font-bold mb-2 text-center">اختار نوع السيستم</h1>
        <p className="text-muted-foreground text-center mb-12">كل نوع جواه مجموعة سيستمات جاهزة</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SYSTEMS.map((s) => (
            <button
              key={s.key}
              onClick={() => navigate("/services/systems/" + s.key)}
              className="group text-right rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 transition-all"
              style={{ borderColor: undefined }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = `hsl(${s.color} / 0.5)`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 border"
                style={{ background: `hsl(${s.color} / 0.1)`, borderColor: `hsl(${s.color} / 0.3)` }}>
                <s.Icon className="w-7 h-7" style={{ color: `hsl(${s.color})` }} />
              </div>
              <h3 className="text-lg font-bold mb-1">{s.label}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
