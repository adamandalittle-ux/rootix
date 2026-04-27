import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BookOpen, Video, FileText, ListChecks, Sparkles, LogOut, Lock } from "lucide-react";

interface Platform {
  id: string;
  slug: string;
  teacher_name: string;
  subject: string;
  stage: string;
  grade_levels: any;
  template_tier: string;
  status: string;
  config: any;
}

interface Student {
  id: string;
  full_name: string;
  phone: string;
  grade_level: string;
  access_code: string;
}

export default function PlatformPage() {
  const { slug } = useParams();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [step, setStep] = useState<"code" | "register" | "dashboard">("code");
  const [code, setCode] = useState("");
  const [form, setForm] = useState({ full_name: "", phone: "", grade_level: "" });
  const [content, setContent] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"video" | "pdf" | "question" | "exam" | "ai_summary">("video");

  useEffect(() => {
    loadPlatform();
    const savedStudent = localStorage.getItem(`rootix_student_${slug}`);
    if (savedStudent) {
      setStudent(JSON.parse(savedStudent));
      setStep("dashboard");
    }
  }, [slug]);

  useEffect(() => {
    if (platform && step === "dashboard") loadContent();
  }, [platform, step]);

  const loadPlatform = async () => {
    const { data, error } = await supabase
      .from("platforms")
      .select("*")
      .eq("slug", slug!)
      .maybeSingle();
    setLoading(false);
    if (error || !data) return;
    setPlatform(data as any);
  };

  const loadContent = async () => {
    if (!platform) return;
    const { data } = await supabase
      .from("content")
      .select("*")
      .eq("platform_id", platform.id)
      .order("created_at", { ascending: false });
    setContent(data || []);
  };

  const verifyCode = async () => {
    if (!platform || !code.trim()) return;
    // Check if code exists and not used
    const { data: codeRow } = await supabase
      .from("student_codes")
      .select("*")
      .eq("platform_id", platform.id)
      .eq("code", code.trim())
      .maybeSingle();

    if (!codeRow) {
      toast.error("الكود غير صحيح");
      return;
    }
    if (codeRow.is_used) {
      // Check if this user already registered with this code
      const { data: existing } = await supabase
        .from("students")
        .select("*")
        .eq("platform_id", platform.id)
        .eq("access_code", code.trim())
        .maybeSingle();
      if (existing) {
        setStudent(existing as any);
        localStorage.setItem(`rootix_student_${slug}`, JSON.stringify(existing));
        setStep("dashboard");
        return;
      }
      toast.error("الكود مستخدم بالفعل");
      return;
    }
    setStep("register");
  };

  const register = async () => {
    if (!platform || !form.full_name || !form.phone || !form.grade_level) {
      toast.error("املأ كل البيانات");
      return;
    }
    const { data, error } = await supabase
      .from("students")
      .insert({
        platform_id: platform.id,
        access_code: code.trim(),
        full_name: form.full_name,
        phone: form.phone,
        grade_level: form.grade_level,
      })
      .select()
      .maybeSingle();
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase
      .from("student_codes")
      .update({ is_used: true })
      .eq("platform_id", platform.id)
      .eq("code", code.trim());
    setStudent(data as any);
    localStorage.setItem(`rootix_student_${slug}`, JSON.stringify(data));
    setStep("dashboard");
    toast.success("تم التسجيل بنجاح");
  };

  const logout = () => {
    localStorage.removeItem(`rootix_student_${slug}`);
    setStudent(null);
    setStep("code");
    setCode("");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  if (!platform) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-5xl mb-3">😕</div>
          <h1 className="text-2xl font-bold mb-2">المنصة غير موجودة</h1>
          <p className="text-muted-foreground">الرابط غلط أو المنصة لم يتم تفعيلها بعد</p>
        </div>
      </div>
    );
  }

  if (platform.status === "paused") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-5xl mb-3">⏸️</div>
          <h1 className="text-2xl font-bold mb-2">المنصة متوقفة مؤقتاً</h1>
          <p className="text-muted-foreground">يرجى التواصل مع المدرس</p>
        </div>
      </div>
    );
  }

  const cfg = platform.config || {};
  const primary = cfg.primary_color || "#22c55e";
  const accent = cfg.accent_color || primary;

  // Themed page
  const themeStyle = {
    "--plat-primary": primary,
    "--plat-accent": accent,
  } as React.CSSProperties;

  if (step === "code" || step === "register") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={themeStyle}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff" }}
            >
              {cfg.logo_text || platform.teacher_name?.[0] || "R"}
            </div>
            <h1 className="text-2xl font-bold">{cfg.platform_name || `منصة ${platform.teacher_name}`}</h1>
            <p className="text-sm text-muted-foreground mt-1">{cfg.welcome_message || "أهلاً بك في المنصة"}</p>
          </div>

          {step === "code" && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />أدخل كود الوصول
              </div>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثال: ABC123"
                className="text-center text-lg font-mono"
              />
              <Button
                onClick={verifyCode}
                className="w-full font-semibold"
                style={{ backgroundColor: primary, color: "#fff" }}
              >
                تحقق من الكود
              </Button>
            </div>
          )}

          {step === "register" && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h2 className="font-semibold">أكمل بياناتك</h2>
              <Input placeholder="الاسم الكامل" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <Input placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <select
                value={form.grade_level}
                onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">اختر الصف</option>
                {(platform.grade_levels as string[]).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <Button onClick={register} className="w-full font-semibold" style={{ backgroundColor: primary, color: "#fff" }}>
                دخول المنصة
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard
  const filteredContent = content.filter(
    (c) => c.kind === activeTab && (!c.grade_level || c.grade_level === student?.grade_level)
  );

  const tabs: { k: any; label: string; icon: any }[] = [
    { k: "video", label: cfg.videos_label || "الفيديوهات", icon: Video },
    { k: "pdf", label: "ملفات PDF", icon: FileText },
    { k: "question", label: "بنك الأسئلة", icon: ListChecks },
    { k: "exam", label: cfg.exams_label || "الامتحانات", icon: BookOpen },
  ];
  if (platform.template_tier === "pro" && cfg.ai_summary_enabled) {
    tabs.push({ k: "ai_summary", label: "ملخص بـ AI", icon: Sparkles });
  }

  return (
    <div className="min-h-screen" style={themeStyle}>
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              {cfg.logo_text || platform.teacher_name?.[0] || "R"}
            </div>
            <div>
              <div className="font-semibold text-sm">{cfg.platform_name || platform.teacher_name}</div>
              <div className="text-xs text-muted-foreground">{student?.full_name}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 ml-1" />خروج
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setActiveTab(t.k)}
              className="rounded-xl border p-4 text-center transition-all"
              style={{
                borderColor: activeTab === t.k ? primary : "hsl(var(--border))",
                background: activeTab === t.k ? `${primary}15` : "hsl(var(--card))",
              }}
            >
              <t.icon className="w-5 h-5 mx-auto mb-2" style={{ color: activeTab === t.k ? primary : undefined }} />
              <div className="text-sm font-medium">{t.label}</div>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "ai_summary" ? (
          <AiSummarySection platform={platform} student={student!} />
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">لا يوجد محتوى بعد في هذا القسم</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredContent.map((c) => (
              <ContentCard key={c.id} item={c} student={student!} primary={primary} platformId={platform.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContentCard({ item, student, primary, platformId }: any) {
  const [playing, setPlaying] = useState(false);

  if (item.kind === "video") {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="relative aspect-video bg-black">
          {playing ? (
            <>
              <video src={item.data?.url} controls controlsList="nodownload" className="w-full h-full" />
              {/* Dynamic watermark */}
              <Watermark name={student.full_name} phone={student.phone} />
            </>
          ) : (
            <button onClick={() => setPlaying(true)} className="w-full h-full flex items-center justify-center text-white">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: primary }}>
                <Video className="w-6 h-6" />
              </div>
            </button>
          )}
        </div>
        <div className="p-3">
          <div className="font-medium text-sm">{item.title}</div>
          {item.lesson && <div className="text-xs text-muted-foreground mt-0.5">{item.lesson}</div>}
        </div>
      </div>
    );
  }

  if (item.kind === "pdf") {
    return (
      <a href={item.data?.url} target="_blank" rel="noreferrer" className="rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors block">
        <FileText className="w-8 h-8 mb-2" style={{ color: primary }} />
        <div className="font-medium text-sm">{item.title}</div>
      </a>
    );
  }

  if (item.kind === "exam" || item.kind === "question") {
    return <ExamCard item={item} student={student} primary={primary} platformId={platformId} />;
  }

  return null;
}

function Watermark({ name, phone }: { name: string; phone: string }) {
  const [pos, setPos] = useState({ x: 20, y: 20 });
  useEffect(() => {
    const i = setInterval(() => {
      setPos({ x: Math.random() * 70 + 5, y: Math.random() * 70 + 5 });
    }, 3000);
    return () => clearInterval(i);
  }, []);
  return (
    <div
      className="absolute pointer-events-none text-white/30 text-sm font-bold leading-tight transition-all duration-1000"
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, textShadow: "0 0 4px #000" }}
    >
      {name}
      <br />
      {phone}
    </div>
  );
}

function ExamCard({ item, student, primary, platformId }: any) {
  const [showExam, setShowExam] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<{ score: number; total: number } | null>(null);

  const questions = item.data?.questions || [];

  const submit = async () => {
    let score = 0;
    questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correct) score++;
    });
    await supabase.from("exam_results").insert({
      platform_id: platformId,
      student_id: student.id,
      exam_id: item.id,
      score,
      total: questions.length,
      answers: answers as any,
    });
    setSubmitted({ score, total: questions.length });
    toast.success(`درجتك: ${score}/${questions.length}`);
  };

  if (!showExam) {
    return (
      <button onClick={() => setShowExam(true)} className="rounded-xl border border-border bg-card p-4 text-start hover:border-primary transition-colors">
        <ListChecks className="w-8 h-8 mb-2" style={{ color: primary }} />
        <div className="font-medium text-sm">{item.title}</div>
        <div className="text-xs text-muted-foreground mt-1">{questions.length} سؤال</div>
      </button>
    );
  }

  return (
    <div className="md:col-span-3 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{item.title}</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowExam(false)}>إغلاق</Button>
      </div>
      {submitted ? (
        <div className="text-center py-8">
          <div className="text-4xl font-bold mb-2" style={{ color: primary }}>
            {submitted.score}/{submitted.total}
          </div>
          <div className="text-muted-foreground">تم إرسال النتيجة</div>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q: any, i: number) => (
            <div key={i} className="rounded-lg border border-border p-3">
              <div className="font-medium mb-2">{i + 1}. {q.question}</div>
              <div className="space-y-1.5">
                {q.options?.map((opt: string, oi: number) => (
                  <button
                    key={oi}
                    onClick={() => setAnswers({ ...answers, [i]: oi })}
                    className="w-full text-start p-2 rounded border text-sm transition-colors"
                    style={{
                      borderColor: answers[i] === oi ? primary : "hsl(var(--border))",
                      background: answers[i] === oi ? `${primary}15` : "transparent",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button onClick={submit} className="w-full" style={{ background: primary, color: "#fff" }}>
            تسليم الامتحان
          </Button>
        </div>
      )}
    </div>
  );
}

function AiSummarySection({ platform, student }: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <Sparkles className="w-10 h-10 mx-auto mb-3 text-primary" />
      <h3 className="font-semibold mb-2">ملخص بـ AI</h3>
      <p className="text-muted-foreground text-sm">
        هذه الميزة قيد التطوير — سيتم تفعيلها قريباً للمادة {platform.subject}
      </p>
    </div>
  );
}
