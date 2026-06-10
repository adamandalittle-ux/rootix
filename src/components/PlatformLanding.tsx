import { Button } from "@/components/ui/button";
import { Sparkles, Users, BookOpen, Shield, ArrowLeft } from "lucide-react";

interface Props {
  teacherName: string;
  subject: string;
  primary: string;
  accent?: string;
  studentsCount?: number;
  platformName?: string;
  onEnter: () => void;
}

export default function PlatformLanding({ teacherName, subject, primary, accent, studentsCount = 0, platformName, onEnter }: Props) {
  const acc = accent || primary;
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10"
      style={{ background: `radial-gradient(circle at 18% 12%, ${primary}28 0%, transparent 45%), radial-gradient(circle at 85% 85%, ${acc}22 0%, transparent 50%), hsl(var(--background))` }}>

      {/* Floating decorative circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { s: 220, x: "-4%", y: "-6%", d: 0 },
          { s: 140, x: "82%", y: "8%", d: 1 },
          { s: 320, x: "70%", y: "65%", d: 2 },
          { s: 90,  x: "10%", y: "70%", d: 1.5 },
          { s: 60,  x: "45%", y: "12%", d: 0.7 },
        ].map((c, i) => (
          <div key={i}
            className="absolute rounded-full opacity-30 blur-2xl animate-pulse"
            style={{
              width: c.s, height: c.s, left: c.x, top: c.y,
              background: i % 2 ? primary : acc,
              animationDuration: `${4 + c.d}s`, animationDelay: `${c.d}s`,
            }} />
        ))}
        {[...Array(18)].map((_, i) => (
          <div key={`d${i}`}
            className="absolute rounded-full"
            style={{
              width: 6 + (i % 4) * 3, height: 6 + (i % 4) * 3,
              left: `${(i * 53) % 100}%`, top: `${(i * 29) % 100}%`,
              background: i % 2 ? primary : acc, opacity: 0.5,
              boxShadow: `0 0 18px ${primary}`,
            }} />
        ))}
      </div>

      {/* Top brand bar */}
      <div className="absolute top-0 inset-x-0 px-6 py-4 flex items-center justify-between">
        <div className="font-black text-2xl tracking-widest" style={{ color: primary, textShadow: `0 0 30px ${primary}55` }}>
          ROOTIX
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] opacity-60">منصة تعليمية</div>
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Glow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 backdrop-blur-sm"
          style={{ borderColor: `${primary}55`, background: `${primary}12`, color: primary }}>
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">منصة احترافية مدعومة بـ Rooty AI</span>
        </div>

        {/* Teacher avatar */}
        <div className="relative w-28 h-28 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-60" style={{ background: primary }} />
          <div className="relative w-full h-full rounded-full flex items-center justify-center text-5xl font-black text-white border-4"
            style={{ background: `linear-gradient(135deg, ${primary}, ${acc})`, borderColor: `${primary}55`, boxShadow: `0 20px 60px -20px ${primary}` }}>
            {teacherName?.[0] || "م"}
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-black mb-2 leading-tight">
          {platformName || `منصة ${teacherName}`}
        </h1>
        <p className="text-base md:text-lg mb-1" style={{ color: primary }}>
          أ. {teacherName} • {subject}
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          أهلاً بك في رحلة تعلّم مختلفة — فيديوهات، ملخصات، امتحانات ذكية، ومتابعة شخصية. كل اللي محتاجه علشان تتفوق في مكان واحد.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
          {[
            { icon: Users, value: studentsCount.toLocaleString("ar-EG"), label: "طالب" },
            { icon: BookOpen, value: subject, label: "المادة" },
            { icon: Shield, value: "100%", label: "آمنة" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-3 border backdrop-blur-sm"
              style={{ borderColor: `${primary}33`, background: `${primary}08` }}>
              <s.icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: primary }} />
              <div className="text-sm font-black truncate" style={{ color: primary }}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <Button
          onClick={onEnter}
          className="h-14 px-10 text-base font-black rounded-2xl text-white group"
          style={{ background: `linear-gradient(135deg, ${primary}, ${acc})`, boxShadow: `0 16px 40px -12px ${primary}` }}
        >
          ادخل المنصة
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
        </Button>

        <p className="text-[11px] text-muted-foreground mt-6">
          مدعومة بـ <span className="font-bold" style={{ color: primary }}>ROOTIX</span> • نظام حماية متقدم ضد التسريب
        </p>
      </div>
    </div>
  );
}
