// ROOTIX AI Builder v3 — clean flow: AI builds → preview → form → submit
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Send, Sparkles, Loader2, Eye, Settings, CheckCircle2, ExternalLink, Rocket, Pencil, Phone, User, Package as PackageIcon } from "lucide-react";
import { getTemplateById } from "@/lib/templates";
import { PACKAGES, PRO_MULTIPLIER } from "@/lib/pricing";

type Msg = { role: "user" | "assistant"; content: string };

interface AIConfig {
  subject: string;
  stage: string;
  grade_levels: string[];
  platform_name: string;
  slug: string;
  mood: string;
  template_id: string;
  logo_text?: string;
  welcome_message?: string;
  videos_label?: string;
  exams_label?: string;
  pdf_label?: string;
  questions_label?: string;
  button_shape?: string;
  animation_level?: string;
  watermark_enabled?: boolean;
  video_speeds?: boolean;
  prevent_download?: boolean;
  student_navbar_visible?: boolean;
  instant_exam_results?: boolean;
  content_locked_by_grade?: boolean;
  new_badge_enabled?: boolean;
  default_gate_mode?: "open" | "code";
  allow_pdf_download?: boolean;
  show_student_count?: boolean;
  leaderboard_enabled?: boolean;
  about_teacher_page?: boolean;
}

type Swatch = { name: string; hex: string };

function parseSuggestions(text: string): { clean: string; suggestions: string[]; swatches: Swatch[] } {
  let clean = text;
  let suggestions: string[] = [];
  let swatches: Swatch[] = [];

  const sMatch = clean.match(/SUGGESTIONS:\s*(\[[\s\S]*?\])/);
  if (sMatch) {
    try {
      const parsed = JSON.parse(sMatch[1]);
      if (Array.isArray(parsed)) suggestions = parsed;
    } catch {}
    clean = clean.replace(sMatch[0], "").trim();
  }

  const cMatch = clean.match(/COLOR_SWATCH:\s*(\[[\s\S]*?\])/);
  if (cMatch) {
    try {
      const parsed = JSON.parse(cMatch[1]);
      if (Array.isArray(parsed)) swatches = parsed.filter((x: any) => x?.hex);
    } catch {}
    clean = clean.replace(cMatch[0], "").trim();
  }

  return { clean, suggestions, swatches };
}

function accumulateToolCall(delta: any, acc: { name?: string; args: string }) {
  const tc = delta?.tool_calls?.[0];
  if (!tc) return;
  if (tc.function?.name) acc.name = tc.function.name;
  if (tc.function?.arguments) acc.args += tc.function.arguments;
}

function tryParseToolConfig(acc: { name?: string; args: string }): AIConfig | null {
  if (acc.name !== "save_platform_config" || !acc.args) return null;
  try {
    return JSON.parse(acc.args) as AIConfig;
  } catch {
    return null;
  }
}

// English-only slug enforcement (transliterate Arabic if AI slipped)
const AR_TO_EN: Record<string, string> = {
  "ا":"a","أ":"a","إ":"e","آ":"a","ب":"b","ت":"t","ث":"th","ج":"g","ح":"h","خ":"kh",
  "د":"d","ذ":"z","ر":"r","ز":"z","س":"s","ش":"sh","ص":"s","ض":"d","ط":"t","ظ":"z",
  "ع":"a","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ي":"y","ى":"a","ة":"a","ئ":"e","ؤ":"o"," ":"-",
};
function forceEnglishSlug(input: string): string {
  let s = (input || "").toLowerCase();
  // transliterate any Arabic chars
  s = s.split("").map((c) => AR_TO_EN[c] ?? c).join("");
  // keep only a-z, 0-9, dashes
  s = s.replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!s || s.length < 2) s = "platform";
  if (s.length > 35) s = s.slice(0, 35).replace(/-$/, "");
  return s + "-" + Math.random().toString(36).slice(2, 5);
}

function genCode(): string {
  return "R-" + Math.floor(1000 + Math.random() * 9000);
}

function buildSummary(cfg: AIConfig, tpl: any, code: string): string {
  const subjectAr: Record<string, string> = {
    math: "الرياضيات", science: "العلوم", arabic: "اللغة العربية", english: "اللغة الإنجليزية",
    studies: "الدراسات", physics: "الفيزياء", chemistry: "الكيمياء", biology: "الأحياء", french: "الفرنساوي",
  };
  const stageAr: Record<string, string> = { primary: "الابتدائي", prep: "الإعدادي", secondary: "الثانوي" };
  return `**🎉 منصة "${cfg.platform_name}" جاهزة!**

دي تفاصيل المنصة:
- **المادة:** ${subjectAr[cfg.subject] || cfg.subject}
- **المرحلة:** ${stageAr[cfg.stage] || cfg.stage}
- **الصفوف:** ${cfg.grade_levels.join("، ")}
- **التصميم:** ${tpl.name_ar}
- **الرابط:** \`rootix.app/m/${cfg.slug}\`

### 🚀 ازاي بتشتغل؟
1. **رابط طلابك:** \`rootix.app/m/${cfg.slug}\` — ده اللي بتديه لطلابك.
2. **لوحة تحكم حضرتك:** بتدير منها الفيديوهات + PDF + الامتحانات + الطلاب.
3. **حماية:** كل فيديو عليه علامة مائية متحركة باسم الطالب ورقمه — مفيش تسريب.
4. **أكواد الطلاب:** بتعمل أكواد، تديها للطلاب، كل كود يدخل بيه طالب واحد بس.
5. **امتحانات:** بتعمل اختبارات multiple choice وتشوف درجة كل طالب فوراً.
6. **كله Realtime:** أي تعديل بتعمله بيظهر لطلابك في نفس اللحظة.

**كود تتبع طلبك:** \`${code}\``;
}

export default function Builder() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "أهلاً يا باشا! 👋 أنا ROOTIX AI، هبنيلك منصتك التعليمية في 6 أسئلة بس.\n\nخليني أبدأ معاك — بتدرس أنهي مادة؟\n\nSUGGESTIONS: [\"رياضيات\",\"علوم\",\"عربي\",\"إنجليزي\",\"فيزياء\",\"كيمياء\"]",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [createdPlatform, setCreatedPlatform] = useState<{ code: string; slug: string; summary: string; id: string } | null>(null);
  const [stage, setStage] = useState<"chat" | "preview" | "form">("chat");
  const [submitting, setSubmitting] = useState(false);

  // Final form data
  const [teacherName, setTeacherName] = useState("");
  const [teacherPhone, setTeacherPhone] = useState("");
  const [tier, setTier] = useState<"normal" | "pro">("normal");
  const [pkgIdx, setPkgIdx] = useState(0); // index in PACKAGES

  const endRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: Msg = { role: "user", content: trimmed };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const toolAcc = { name: undefined as string | undefined, args: "" };
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rootix-ai`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newHistory }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("تم تجاوز الحد المسموح، جرب بعد شوية");
        else if (resp.status === 402) toast.error("الرصيد نفد");
        else toast.error("حصل خطأ، حاول تاني");
        setMessages(newHistory);
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, idx);
          textBuffer = textBuffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            const content = delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantSoFar };
                return copy;
              });
            }
            accumulateToolCall(delta, toolAcc);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      const cfg = tryParseToolConfig(toolAcc);
      if (cfg) {
        // Force English slug — never trust AI 100%
        cfg.slug = forceEnglishSlug(cfg.slug || cfg.platform_name);
        setAiConfig(cfg);
        setStage("preview");
        // Auto-create platform draft so preview links work
        await createDraft(cfg);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: `✅ خلصنا! منصة "${cfg.platform_name}" جاهزة. اتفرج عليها تحت 👇`,
          };
          return copy;
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("حصل خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const createDraft = async (cfg: AIConfig) => {
    const code = genCode();
    const template = getTemplateById(cfg.template_id);
    // Ensure slug is unique even against deleted platforms (blacklist)
    let slug = cfg.slug;
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase.from("platforms").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      slug = forceEnglishSlug(cfg.platform_name);
    }
    cfg.slug = slug;

    const fullConfig = {
      ...cfg,
      template,
      template_id: cfg.template_id,
      logo_text: cfg.logo_text || cfg.platform_name.charAt(0),
      welcome_message: cfg.welcome_message || `أهلاً بيك في ${cfg.platform_name} 🎉`,
      videos_label: cfg.videos_label || "الفيديوهات",
      exams_label: cfg.exams_label || "الامتحانات",
      pdf_label: cfg.pdf_label || "ملفات PDF",
      questions_label: cfg.questions_label || "بنك الأسئلة",
      button_shape: cfg.button_shape || "soft",
      animation_level: cfg.animation_level || "medium",
      watermark_enabled: cfg.watermark_enabled !== false,
      video_speeds: cfg.video_speeds !== false,
      prevent_download: cfg.prevent_download !== false,
      student_navbar_visible: cfg.student_navbar_visible !== false,
      instant_exam_results: cfg.instant_exam_results !== false,
      content_locked_by_grade: cfg.content_locked_by_grade !== false,
      new_badge_enabled: cfg.new_badge_enabled !== false,
      allow_pdf_download: cfg.allow_pdf_download === true,
      show_student_count: cfg.show_student_count === true,
      leaderboard_enabled: cfg.leaderboard_enabled !== false,
      about_teacher_page: cfg.about_teacher_page === true,
      // CONSISTENT colors across ALL pages — no per-page color drift
      primary_color: template.primary_color,
      accent_color: template.accent_color,
      bg_color: template.bg_color,
      surface_color: template.surface_color,
      text_color: template.text_color,
    };
    const { data, error } = await supabase.from("platforms").insert({
      code,
      slug: cfg.slug,
      teacher_name: "(لم يكتمل)",
      teacher_phone: "(لم يكتمل)",
      subject: cfg.subject,
      stage: cfg.stage,
      grade_levels: cfg.grade_levels,
      template_tier: "normal",
      package_students: 50,
      package_price: 500,
      gate_mode: cfg.default_gate_mode || "open",
      config: fullConfig as any,
      status: "approved",
      payment_status: "draft",
    }).select().maybeSingle();
    if (error) {
      console.error(error);
      toast.error("فشل إنشاء المعاينة: " + error.message);
      return;
    }
    const summary = buildSummary(cfg, template, code);
    setCreatedPlatform({ code, slug: cfg.slug, summary, id: (data as any).id });
  };

  const editWithAI = () => {
    setStage("chat");
    setAiConfig(null);
    setCreatedPlatform(null);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "تمام! قولي إنت عايز تعدل إيه بالظبط؟ (التصميم؟ الاسم؟ المادة؟)\n\nSUGGESTIONS: [\"غير التصميم\",\"غير اسم المنصة\",\"غير المادة\",\"غير الصفوف\"]",
      },
    ]);
  };

  const submitFinal = async () => {
    if (!aiConfig || !createdPlatform) return;
    if (!teacherName.trim() || !teacherPhone.trim()) {
      toast.error("اكتب اسمك ورقم تليفونك");
      return;
    }
    if (teacherPhone.replace(/\D/g, "").length < 10) {
      toast.error("رقم التليفون مش صحيح");
      return;
    }
    setSubmitting(true);
    try {
      const pkg = PACKAGES[pkgIdx];
      const finalPrice = tier === "pro" ? Math.round(pkg.price * PRO_MULTIPLIER) : pkg.price;
      const adminEmail = `${aiConfig.slug}@rootix.app`;
      const adminPassword = "R" + Math.random().toString(36).slice(2, 8).toUpperCase();

      // Step 1: AI health check (auto-fix any issues before sending to admin)
      toast.info("🔍 ROOTIX AI بيفحص منصتك...");
      const checkResp = await supabase.functions.invoke("rootix-check", {
        body: { platform_id: createdPlatform.id },
      });
      if (checkResp.data?.summary) {
        if (checkResp.data.fixes_applied?.length) {
          toast.success(`🛠️ AI أصلح ${checkResp.data.fixes_applied.length} مشكلة تلقائياً`);
        } else {
          toast.success("✅ AI فحص المنصة — كل حاجة تمام!");
        }
      }

      // Step 2: Submit final teacher data + package
      const { error } = await supabase.from("platforms").update({
        teacher_name: teacherName.trim(),
        teacher_phone: teacherPhone.trim(),
        template_tier: tier,
        package_students: pkg.students,
        package_price: finalPrice,
        platform_admin_email: adminEmail,
        platform_admin_password: adminPassword,
        status: "pending",
        payment_status: "unpaid",
        requested_students: pkg.students,
        requested_tier: tier,
        admin_notes: checkResp.data?.summary || null,
      }).eq("id", createdPlatform.id);

      if (error) throw error;
      toast.success("🎉 تم إرسال طلبك للأدمن! هيكلمك خلال ساعات.");
      navigate(`/success?code=${createdPlatform.code}&slug=${aiConfig.slug}`);
    } catch (e: any) {
      console.error(e);
      toast.error("فشل الإرسال: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const { suggestions } = lastAssistant ? parseSuggestions(lastAssistant.content) : { suggestions: [] };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">العودة</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center font-bold text-primary-foreground text-xs">R</div>
            <span className="font-semibold text-sm">ROOTIX AI Builder</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 container max-w-3xl mx-auto px-4 py-6 flex flex-col">
        {/* Messages */}
        <div className="flex-1 space-y-4 pb-6">
          {messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const { clean: cleanText } = parseSuggestions(m.content);
            return (
              <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"} fade-in-up`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-primary font-semibold">
                      <Sparkles className="w-3 h-3" />
                      ROOTIX AI
                    </div>
                  )}
                  {cleanText || (isLast && loading && <Loader2 className="w-4 h-4 animate-spin" />)}
                </div>
              </div>
            );
          })}
          {loading && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-end">
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* PREVIEW STAGE — after AI builds */}
        {stage === "preview" && createdPlatform && aiConfig && (
          <div className="mb-4 rounded-2xl border-2 border-primary/60 bg-gradient-to-br from-primary/10 via-card to-card p-5 md:p-7 fade-in-up shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg md:text-xl">معاينة منصتك</h2>
                <p className="text-xs text-muted-foreground">اتفرج عليها قبل ما تكمل</p>
              </div>
            </div>

            {/* Big preview buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <a href={`/m/${createdPlatform.slug}`} target="_blank" rel="noreferrer" className="group rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all p-4 flex items-center gap-3 active:scale-[0.98]">
                <div className="w-11 h-11 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">شوف منصتك (الطلاب)</div>
                  <div className="text-xs text-muted-foreground truncate">/m/{createdPlatform.slug}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
              <a href={`/platform-admin/${createdPlatform.slug}`} target="_blank" rel="noreferrer" className="group rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all p-4 flex items-center gap-3 active:scale-[0.98]">
                <div className="w-11 h-11 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">لوحة تحكم حضرتك</div>
                  <div className="text-xs text-muted-foreground truncate">ترفع فيديوهات وامتحانات</div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>

            {/* Summary */}
            <div className="rounded-xl bg-background/60 border border-border p-4 md:p-5 mb-5 text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {createdPlatform.summary.split("\n").map((line, i) => {
                if (line.startsWith("### ")) return <h3 key={i} className="font-bold text-base mt-3 mb-1 text-primary">{line.slice(4)}</h3>;
                if (line.startsWith("**") && line.endsWith("**")) return <div key={i} className="font-bold text-base mt-2">{line.replace(/\*\*/g, "")}</div>;
                const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
                return (
                  <div key={i}>
                    {parts.map((part, j) => {
                      if (part.startsWith("**") && part.endsWith("**")) return <strong key={j}>{part.slice(2, -2)}</strong>;
                      if (part.startsWith("`") && part.endsWith("`")) return <code key={j} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono">{part.slice(1, -1)}</code>;
                      return <span key={j}>{part}</span>;
                    })}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button onClick={editWithAI} variant="outline" className="h-12 font-semibold border-border">
                <Pencil className="w-4 h-4 ml-2" />
                عدّل مع AI
              </Button>
              <Button onClick={() => setStage("form")} className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                <Rocket className="w-4 h-4 ml-2" />
                تمام، كمل
              </Button>
            </div>
          </div>
        )}

        {/* FORM STAGE — name + phone + package */}
        {stage === "form" && aiConfig && createdPlatform && (
          <div className="mb-4 rounded-2xl border-2 border-primary/60 bg-card p-5 md:p-7 fade-in-up">
            <h2 className="font-bold text-xl mb-1">آخر خطوة 🚀</h2>
            <p className="text-sm text-muted-foreground mb-5">املا بياناتك واختار باقتك علشان الأدمن يكلمك</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><User className="w-4 h-4 text-primary" /> اسمك بالكامل</label>
                <Input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="مثال: مستر أحمد محمد" className="h-11" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Phone className="w-4 h-4 text-primary" /> رقم واتسابك</label>
                <Input value={teacherPhone} onChange={(e) => setTeacherPhone(e.target.value)} placeholder="01xxxxxxxxx" type="tel" className="h-11" dir="ltr" />
              </div>
            </div>

            {/* Tier toggle */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 flex items-center gap-1.5"><PackageIcon className="w-4 h-4 text-primary" /> نوع الباقة</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTier("normal")} className={`rounded-xl border-2 p-3 text-start transition-all ${tier === "normal" ? "border-primary bg-primary/10" : "border-border bg-card hover:border-border/80"}`}>
                  <div className="font-bold">عادي</div>
                  <div className="text-xs text-muted-foreground">فيديو + PDF + امتحانات + علامة مائية</div>
                </button>
                <button onClick={() => setTier("pro")} className={`rounded-xl border-2 p-3 text-start transition-all ${tier === "pro" ? "border-primary bg-primary/10" : "border-border bg-card hover:border-border/80"}`}>
                  <div className="font-bold">PRO ⭐ <span className="text-xs text-muted-foreground">(+15%)</span></div>
                  <div className="text-xs text-muted-foreground">+ ملخصات AI + أصوات + أنيميشن متقدم</div>
                </button>
              </div>
            </div>

            {/* Package picker */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">عدد الطلاب</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[260px] overflow-y-auto p-1">
                {PACKAGES.map((p, i) => {
                  const price = tier === "pro" ? Math.round(p.price * PRO_MULTIPLIER) : p.price;
                  const active = pkgIdx === i;
                  return (
                    <button key={i} onClick={() => setPkgIdx(i)} className={`rounded-lg border-2 p-2.5 text-center transition-all ${active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-border/80"}`}>
                      <div className="font-bold text-sm">{p.students}+ طالب</div>
                      <div className={`text-xs ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>{price} ج/شهر</div>
                      {p.label && <div className="text-[10px] text-primary mt-0.5">{p.label}</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button onClick={() => setStage("preview")} variant="outline" className="h-12 font-semibold">
                <ArrowLeft className="w-4 h-4 ml-2" />
                ارجع للمعاينة
              </Button>
              <Button onClick={submitFinal} disabled={submitting} className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Rocket className="w-5 h-5 ml-2" />ابعت للأدمن</>}
              </Button>
            </div>
          </div>
        )}

        {/* Suggestions (chat stage only) */}
        {stage === "chat" && suggestions.length > 0 && !loading && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)} className="text-sm px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/10 transition-colors active:scale-95">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input (chat stage only) */}
        {stage === "chat" && (
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 sticky bottom-2 md:bottom-4 bg-background/90 backdrop-blur-xl rounded-xl border border-border p-2 shadow-lg">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="اكتب إجابتك..." disabled={loading} className="border-0 bg-transparent focus-visible:ring-0 text-base" />
            <Button type="submit" disabled={loading || !input.trim()} size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
