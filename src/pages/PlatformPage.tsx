import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BookOpen, Video, FileText, ListChecks, Sparkles, LogOut, Lock, Trophy, Calendar, Clock } from "lucide-react";
import { getTemplateById, hexToHslString, type Template } from "@/lib/templates";

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
  gate_mode?: string;
  deleted_at?: string | null;
  live_active?: boolean;
  live_url?: string | null;
  live_title?: string | null;
  live_cover_url?: string | null;
  live_started_at?: string | null;
}

interface Student {
  id: string;
  full_name: string;
  phone: string;
  grade_level: string;
  access_code: string;
  points?: number;
  schedule_days?: string[];
  lesson_time?: string;
}

export default function PlatformPage() {
  const { slug } = useParams();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [step, setStep] = useState<"code" | "register" | "dashboard">("code");
  const [code, setCode] = useState("");
  const [form, setForm] = useState<{ full_name: string; phone: string; grade_level: string; schedule_days: string[]; lesson_time: string }>({ full_name: "", phone: "", grade_level: "", schedule_days: [], lesson_time: "" });
  const [content, setContent] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"video" | "pdf" | "question" | "exam" | "leaderboard" | "ai_summary">("video");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    loadPlatform();
    const savedStudent = localStorage.getItem(`rootix_student_${slug}`);
    if (savedStudent) {
      setStudent(JSON.parse(savedStudent));
      setStep("dashboard");
    }
  }, [slug]);

  useEffect(() => {
    if (platform && step === "dashboard") {
      loadContent();
      // Realtime: new content + live stream toggles appear immediately
      const channel = supabase
        .channel(`student-content-${platform.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "content", filter: `platform_id=eq.${platform.id}` },
          () => loadContent()
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "platforms", filter: `id=eq.${platform.id}` },
          (payload) => setPlatform((p) => p ? { ...p, ...(payload.new as any) } : p)
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [platform, step]);

  // Apply the selected template's colors to the page (CSS variables)
  useEffect(() => {
    if (!platform) return;
    const tpl: Template = getTemplateById(platform.config?.template_id || platform.config?.template?.id);
    const root = document.documentElement;
    root.style.setProperty("--platform-primary", hexToHslString(tpl.primary_color));
    root.style.setProperty("--platform-accent", hexToHslString(tpl.accent_color));
    root.style.setProperty("--platform-bg", hexToHslString(tpl.bg_color));
    root.style.setProperty("--platform-surface", hexToHslString(tpl.surface_color));
    root.style.setProperty("--platform-text", hexToHslString(tpl.text_color));
    root.style.setProperty("--platform-muted", hexToHslString(tpl.muted_color));
    return () => {
      root.style.removeProperty("--platform-primary");
      root.style.removeProperty("--platform-accent");
      root.style.removeProperty("--platform-bg");
      root.style.removeProperty("--platform-surface");
      root.style.removeProperty("--platform-text");
      root.style.removeProperty("--platform-muted");
    };
  }, [platform]);

  const loadPlatform = async () => {
    const { data, error } = await supabase
      .from("platforms")
      .select("*")
      .eq("slug", slug!)
      .is("deleted_at", null) // hide deleted platforms from public
      .maybeSingle();
    setLoading(false);
    if (error || !data) return;
    setPlatform(data as any);
    // If gate is open and student not yet registered → skip code step, go to register
    const savedStudent = localStorage.getItem(`rootix_student_${slug}`);
    if (!savedStudent && (data as any).gate_mode === "open") {
      setStep("register");
    }
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
    if (form.schedule_days.length === 0) {
      toast.error("اختار معاد الحصة (الأيام)");
      return;
    }
    if (!form.lesson_time) {
      toast.error("اكتب ساعة الحصة");
      return;
    }
    const isOpenGate = platform.gate_mode === "open";
    const accessCode = isOpenGate ? "ab" + Math.floor(100 + Math.random() * 99900) : code.trim();

    const { data, error } = await supabase
      .from("students")
      .insert({
        platform_id: platform.id,
        access_code: accessCode,
        full_name: form.full_name,
        phone: form.phone,
        grade_level: form.grade_level,
        schedule_days: form.schedule_days as any,
        lesson_time: form.lesson_time,
      })
      .select()
      .maybeSingle();
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!isOpenGate) {
      await supabase
        .from("student_codes")
        .update({ is_used: true })
        .eq("platform_id", platform.id)
        .eq("code", code.trim());
    }
    setStudent(data as any);
    localStorage.setItem(`rootix_student_${slug}`, JSON.stringify(data));
    setStep("dashboard");
    toast.success("تم التسجيل بنجاح، أهلاً بيك! 🎉");
  };

  // Load leaderboard when tab opens
  useEffect(() => {
    if (activeTab !== "leaderboard" || !platform) return;
    (async () => {
      const { data } = await supabase
        .from("students")
        .select("id,full_name,grade_level,points")
        .eq("platform_id", platform.id)
        .order("points", { ascending: false })
        .limit(50);
      setLeaderboard(data || []);
    })();
  }, [activeTab, platform]);

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

              {/* Schedule picker — fancy */}
              <div className="rounded-xl border border-border bg-background/50 p-3 space-y-2">
                <div className="text-xs font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" style={{ color: primary }} /> معاد الحصة (اختار الأيام)</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { d: "السبت", short: "س" },
                    { d: "الأحد", short: "ح" },
                    { d: "الاثنين", short: "ن" },
                    { d: "الثلاثاء", short: "ث" },
                    { d: "الأربعاء", short: "ر" },
                    { d: "الخميس", short: "خ" },
                    { d: "الجمعة", short: "ج" },
                  ].map((day) => {
                    const active = form.schedule_days.includes(day.d);
                    return (
                      <button
                        key={day.d}
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          schedule_days: active
                            ? form.schedule_days.filter(x => x !== day.d)
                            : [...form.schedule_days, day.d],
                        })}
                        className="rounded-lg border-2 p-2 text-xs font-bold transition-all hover:scale-105"
                        style={{
                          borderColor: active ? primary : "hsl(var(--border))",
                          background: active ? `${primary}25` : "transparent",
                          color: active ? primary : undefined,
                          boxShadow: active ? `0 4px 12px -4px ${primary}66` : undefined,
                        }}
                      >
                        {day.d}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[10px] text-muted-foreground">مثال: السبت + الثلاثاء، أو الأحد + الأربعاء</div>
              </div>

              {/* Lesson time */}
              <div className="rounded-xl border border-border bg-background/50 p-3 space-y-2">
                <div className="text-xs font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" style={{ color: primary }} /> ساعة الحصة</div>
                <Input
                  type="time"
                  value={form.lesson_time}
                  onChange={(e) => setForm({ ...form, lesson_time: e.target.value })}
                  className="text-center font-bold"
                />
              </div>

              <Button onClick={register} className="w-full font-semibold text-base h-11" style={{ backgroundColor: primary, color: "#fff", boxShadow: `0 8px 24px -8px ${primary}99` }}>
                ✨ دخول المنصة
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
    { k: "leaderboard", label: "🏆 المتصدرين", icon: Trophy },
  ];
  if (platform.template_tier === "pro" && cfg.ai_summary_enabled) {
    tabs.push({ k: "ai_summary", label: "ملخص بـ AI", icon: Sparkles });
  }

  return (
    <div className="min-h-screen relative" style={themeStyle}>
      {/* Decorative gradient background */}
      <div
        className="absolute inset-0 -z-10 opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 0%, ${primary}33 0%, transparent 45%), radial-gradient(circle at 80% 100%, ${accent}22 0%, transparent 50%)`,
        }}
      />

      <nav className="border-b border-border/50 backdrop-blur-xl bg-card/70 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${accent})`,
                boxShadow: `0 8px 24px -8px ${primary}88`,
              }}
            >
              {cfg.logo_text || platform.teacher_name?.[0] || "R"}
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">{cfg.platform_name || platform.teacher_name}</div>
              <div className="text-xs text-muted-foreground">أهلاً، {student?.full_name?.split(" ")[0]} 👋</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 ml-1" />خروج
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        {/* 🔴 LIVE banner */}
        {platform.live_active && platform.live_url && (
          <LiveBanner
            url={platform.live_url}
            title={platform.live_title || "بث مباشر"}
            cover={platform.live_cover_url || null}
            primary={primary}
          />
        )}

        {/* Welcome banner */}
        <div
          className="mb-6 rounded-3xl p-6 md:p-8 relative overflow-hidden border"
          style={{
            background: `linear-gradient(135deg, ${primary}18, ${accent}10)`,
            borderColor: `${primary}40`,
          }}
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: primary }} />
          <div className="relative">
            <div className="text-xs uppercase tracking-wider opacity-70 mb-1">منصة {platform.subject}</div>
            <h1 className="text-2xl md:text-3xl font-black mb-2">{cfg.welcome_message || `أهلاً بيك في منصة ${platform.teacher_name}`}</h1>
            <p className="text-sm text-muted-foreground">صفك: {student?.grade_level} • {content.length} محتوى متاح</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setActiveTab(t.k)}
              className="rounded-2xl border p-4 text-center transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{
                borderColor: activeTab === t.k ? primary : "hsl(var(--border))",
                background: activeTab === t.k
                  ? `linear-gradient(135deg, ${primary}25, ${accent}15)`
                  : "hsl(var(--card))",
                boxShadow: activeTab === t.k ? `0 8px 24px -12px ${primary}66` : undefined,
              }}
            >
              <t.icon className="w-6 h-6 mx-auto mb-2" style={{ color: activeTab === t.k ? primary : undefined }} />
              <div className="text-sm font-semibold">{t.label}</div>
            </button>
          ))}
        </div>

        {/* My points banner */}
        {student && (
          <div className="mb-4 rounded-2xl border p-3 flex items-center gap-3" style={{ borderColor: `${primary}40`, background: `${primary}10` }}>
            <Trophy className="w-5 h-5" style={{ color: primary }} />
            <div className="text-sm">نقاطك: <strong style={{ color: primary }}>{student.points || 0}</strong></div>
            <div className="text-xs text-muted-foreground mr-auto">كل سؤال صح = نقطة 🌟</div>
          </div>
        )}

        {/* Content */}
        {activeTab === "ai_summary" ? (
          <AiSummarySection platform={platform} student={student!} />
        ) : activeTab === "leaderboard" ? (
          <Leaderboard items={leaderboard} primary={primary} accent={accent} myId={student?.id} />
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
    const rawUrl = item.data?.url || "";
    const ytEmbed = getYoutubeEmbed(rawUrl);
    const isYoutube = !!ytEmbed;
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden group hover:border-primary/50 transition-all">
        <div className="relative aspect-video bg-black overflow-hidden">
          {playing ? (
            <VideoPlayer
              url={rawUrl}
              isYoutube={isYoutube}
              embedSrc={ytEmbed}
              student={student}
              platformId={platformId}
              contentId={item.id}
              primary={primary}
            />
          ) : (
            <button onClick={() => setPlaying(true)} className="w-full h-full flex items-center justify-center text-white relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 relative z-10" style={{ background: primary, boxShadow: `0 12px 32px -8px ${primary}` }}>
                <Video className="w-8 h-8" />
              </div>
              <div className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded bg-black/60 backdrop-blur text-white font-bold">
                ▶ تشغيل
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

function VideoPlayer({ url, isYoutube, embedSrc, student, platformId, contentId, primary }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [percent, setPercent] = useState(0);

  // Track HTML5 video progress
  useEffect(() => {
    if (isYoutube) return;
    const v = videoRef.current;
    if (!v) return;
    let lastSave = 0;
    const onTime = async () => {
      if (!v.duration) return;
      const pct = Math.min(100, Math.round((v.currentTime / v.duration) * 100));
      setPercent(pct);
      if (Date.now() - lastSave > 5000) {
        lastSave = Date.now();
        await supabase.from("video_watch").upsert({
          platform_id: platformId,
          student_id: student.id,
          content_id: contentId,
          percent: pct,
          seconds: Math.round(v.currentTime),
          updated_at: new Date().toISOString(),
        }, { onConflict: "student_id,content_id" });
      }
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [isYoutube, platformId, student.id, contentId]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      {isYoutube ? (
        // Hide YouTube branding aggressively
        <iframe
          src={`${embedSrc}&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=1&playsinline=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="w-full h-full"
        />
      ) : (
        <video ref={videoRef} src={url} controls controlsList="nodownload noremoteplayback" disablePictureInPicture className="w-full h-full" />
      )}
      {/* Branding cover — hides "YouTube" logo top-right */}
      {isYoutube && (
        <div className="absolute top-0 right-0 h-12 w-32 pointer-events-none" style={{ background: `linear-gradient(to left, rgba(0,0,0,0.95), transparent)` }}>
          <div className="absolute top-2 right-2 text-[10px] font-bold text-white/80 px-2 py-0.5 rounded" style={{ background: primary }}>
            🎬 المنصة
          </div>
        </div>
      )}
      <Watermark name={student.full_name} phone={student.phone} />
      {!isYoutube && percent > 0 && (
        <div className="absolute bottom-12 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded">{percent}%</div>
      )}
    </div>
  );
}

function Watermark({ name, phone }: { name: string; phone: string }) {
  // Multiple repeating watermarks — visible even in fullscreen
  const tiles = [
    { x: 10, y: 15 }, { x: 70, y: 25 },
    { x: 25, y: 55 }, { x: 80, y: 70 },
    { x: 45, y: 85 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" style={{ zIndex: 2147483647 }}>
      {tiles.map((t, i) => (
        <div
          key={i}
          className="absolute text-white/25 text-[11px] font-bold leading-tight"
          style={{ left: `${t.x}%`, top: `${t.y}%`, textShadow: "0 0 6px rgba(0,0,0,0.9)", transform: "rotate(-15deg)" }}
        >
          {name}<br />{phone}
        </div>
      ))}
    </div>
  );
}

function Leaderboard({ items, primary, accent, myId }: any) {
  if (!items || items.length === 0) {
    return <div className="text-center py-16 text-muted-foreground">لا يوجد متصدرين بعد — كن أنت الأول! 🏆</div>;
  }
  return (
    <div className="space-y-2">
      <div className="rounded-2xl p-5 mb-4 text-center" style={{ background: `linear-gradient(135deg, ${primary}25, ${accent}15)`, border: `1px solid ${primary}40` }}>
        <Trophy className="w-10 h-10 mx-auto mb-2" style={{ color: primary }} />
        <h2 className="text-xl font-black">🏆 لوحة المتصدرين</h2>
        <p className="text-xs text-muted-foreground mt-1">كل سؤال صح = نقطة. حل كتير علشان تطلع رقم 1!</p>
      </div>
      {items.map((s: any, i: number) => {
        const isMe = s.id === myId;
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
        return (
          <div key={s.id} className="rounded-xl border p-3 flex items-center gap-3 transition-all"
            style={{
              borderColor: isMe ? primary : "hsl(var(--border))",
              background: isMe ? `${primary}15` : i < 3 ? `${primary}08` : "hsl(var(--card))",
              boxShadow: isMe ? `0 8px 24px -12px ${primary}` : undefined,
            }}>
            <div className="w-10 text-center text-lg font-black">{medal}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{s.full_name} {isMe && <span className="text-xs" style={{ color: primary }}>(أنت)</span>}</div>
              <div className="text-xs text-muted-foreground">{s.grade_level}</div>
            </div>
            <div className="text-lg font-black" style={{ color: primary }}>{s.points || 0} <span className="text-xs">نقطة</span></div>
          </div>
        );
      })}
    </div>
  );
}

function ExamCard({ item, student, primary, platformId }: any) {
  const [showExam, setShowExam] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<{ score: number; total: number } | null>(null);
  const [previousAttempt, setPreviousAttempt] = useState<{ score: number; total: number } | null>(null);

  const questions = item.data?.questions || [];

  // Check if student already attempted
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("exam_results")
        .select("score,total")
        .eq("student_id", student.id)
        .eq("exam_id", item.id)
        .maybeSingle();
      if (data) setPreviousAttempt(data as any);
    })();
  }, [item.id, student.id]);

  const submit = async () => {
    if (previousAttempt) return;
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
    if (score > 0) {
      await supabase.from("students").update({ points: (student.points || 0) + score }).eq("id", student.id);
      const updated = { ...student, points: (student.points || 0) + score };
      const slugMatch = window.location.pathname.split("/").pop();
      localStorage.setItem(`rootix_student_${slugMatch}`, JSON.stringify(updated));
    }
    setSubmitted({ score, total: questions.length });
    setPreviousAttempt({ score, total: questions.length });
    toast.success(`درجتك: ${score}/${questions.length} • +${score} نقطة 🌟`);
  };

  if (!showExam) {
    const locked = !!previousAttempt;
    return (
      <button
        onClick={() => !locked && setShowExam(true)}
        disabled={locked}
        className="rounded-xl border bg-card p-4 text-start hover:border-primary transition-colors disabled:cursor-not-allowed relative overflow-hidden"
        style={{ borderColor: locked ? "#16a34a55" : undefined, background: locked ? "#16a34a08" : undefined }}
      >
        <ListChecks className="w-8 h-8 mb-2" style={{ color: locked ? "#16a34a" : primary }} />
        <div className="font-medium text-sm">{item.title}</div>
        {locked ? (
          <div className="text-xs mt-1.5 font-bold" style={{ color: "#16a34a" }}>
            ✅ تم الحل — درجتك: {previousAttempt.score}/{previousAttempt.total}
            <div className="text-[10px] text-muted-foreground font-normal mt-0.5">مينفعش تحل تاني</div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground mt-1">{questions.length} سؤال • +{questions.length} نقطة محتملة</div>
        )}
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
          <div className="text-muted-foreground">تم إرسال النتيجة • +{submitted.score} نقطة</div>
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

// ============================================================
// LiveBanner — يظهر للطلاب لما المدرس يشغل البث
// ============================================================
function getYoutubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const params = "?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1";
    const liveMatch = u.pathname.match(/^\/live\/([a-zA-Z0-9_-]+)/);
    if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}${params}`;
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}${params}`;
    }
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}${params}`;
    return null;
  } catch {
    return null;
  }
}

function LiveBanner({ url, title, cover, primary }: { url: string; title: string; cover: string | null; primary: string }) {
  const [open, setOpen] = useState(false);
  const embed = getYoutubeEmbed(url);

  return (
    <>
      <div
        className="mb-6 rounded-3xl overflow-hidden border-2 border-red-500/60 shadow-2xl shadow-red-500/20 relative animate-in fade-in slide-in-from-top-4 duration-500"
        style={{ background: `linear-gradient(135deg, #dc2626, #991b1b)` }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative p-5 flex items-center gap-4 flex-wrap md:flex-nowrap">
          {cover && (
            <img src={cover} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 bg-white text-red-600 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> عاجل · LIVE
              </span>
              <span className="text-white/80 text-xs">المدرس بث مباشر دلوقتي</span>
            </div>
            <h2 className="text-white font-black text-lg md:text-xl truncate">{title}</h2>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="bg-white text-red-600 hover:bg-white/90 font-bold shrink-0"
            size="lg"
          >
            ▶ ادخل البث
          </Button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold">{title}</span>
              </div>
              <button onClick={() => setOpen(false)} className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-sm">إغلاق ✕</button>
            </div>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              {embed ? (
                <iframe
                  src={embed}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <a href={url} target="_blank" rel="noreferrer" className="underline" style={{ color: primary }}>افتح البث في يوتيوب</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
