// ROOTIX Teacher Dashboard v2 — direct access, gate toggle, password setter, PDF codes, package upgrade request
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Users, KeyRound, Video, FileText, ListChecks, BookOpen, Lock, Unlock, Settings as Cog, Download, TrendingUp, Eye, EyeOff, Sparkles, X, Send, AlertTriangle, Radio } from "lucide-react";
import jsPDF from "jspdf";
import { renderArabicPdf } from "@/lib/arabic-pdf";

export default function PlatformAdmin() {
  const { slug } = useParams();
  const [platform, setPlatform] = useState<any>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [tab, setTab] = useState<"content" | "students" | "codes" | "live" | "settings">("content");
  const [content, setContent] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, [slug]);

  useEffect(() => {
    if (needsPassword || !platform) return;
    refreshAll();

    const channel = supabase
      .channel(`platform-${platform.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "content", filter: `platform_id=eq.${platform.id}` }, refreshAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "students", filter: `platform_id=eq.${platform.id}` }, refreshAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "student_codes", filter: `platform_id=eq.${platform.id}` }, refreshAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "platforms", filter: `id=eq.${platform.id}` }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [needsPassword, platform]);

  const load = async () => {
    const { data } = await supabase.from("platforms").select("*").eq("slug", slug!).is("deleted_at", null).maybeSingle();
    if (!data) {
      setPlatform(null);
      return;
    }
    setPlatform(data);
    // Direct access if no dashboard_password set
    const requiresPw = !!data.dashboard_password;
    const sessionOk = sessionStorage.getItem(`rootix_pdash_${slug}`) === "1";
    setNeedsPassword(requiresPw && !sessionOk);
  };

  const refreshAll = async () => {
    if (!platform) return;
    const [c, s, k] = await Promise.all([
      supabase.from("content").select("*").eq("platform_id", platform.id).order("created_at", { ascending: false }),
      supabase.from("students").select("*").eq("platform_id", platform.id).order("created_at", { ascending: false }),
      supabase.from("student_codes").select("*").eq("platform_id", platform.id).order("created_at", { ascending: false }),
    ]);
    setContent(c.data || []);
    setStudents(s.data || []);
    setCodes(k.data || []);
  };

  const tryUnlock = () => {
    if (!platform) return;
    if (pwInput === platform.dashboard_password) {
      sessionStorage.setItem(`rootix_pdash_${slug}`, "1");
      setNeedsPassword(false);
      toast.success("أهلاً أستاذ " + platform.teacher_name);
    } else {
      toast.error("كلمة المرور غلط");
    }
  };

  if (!platform) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-5xl mb-3">😕</div>
          <h1 className="text-2xl font-bold mb-2">المنصة غير موجودة</h1>
          <p className="text-muted-foreground">الرابط غلط أو المنصة محذوفة</p>
        </div>
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
          <Lock className="w-8 h-8 text-primary mb-3" />
          <h1 className="text-xl font-bold mb-1">لوحة تحكم {platform.config?.platform_name || platform.teacher_name}</h1>
          <p className="text-sm text-muted-foreground mb-5">حضرتك فعّلت كلمة سر للحماية. ادخلها علشان تكمل.</p>
          <Input type="password" placeholder="كلمة المرور" value={pwInput} onChange={(e) => setPwInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && tryUnlock()} />
          <Button onClick={tryUnlock} className="w-full mt-3 bg-primary text-primary-foreground">دخول</Button>
          <p className="text-xs text-muted-foreground mt-4 text-center">نسيت كلمة السر؟ كلم الأدمن، عنده نسخة.</p>
        </div>
      </div>
    );
  }

  const overCapacityBy = Math.max(0, students.length - platform.package_students);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-card/70 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/40 flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/20">
              {platform.config?.logo_text || platform.teacher_name?.[0] || "R"}
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">{platform.config?.platform_name}</div>
              <div className="text-xs text-muted-foreground">أ/ {platform.teacher_name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${platform.gate_mode === "open" ? "bg-green-500/15 text-green-500" : "bg-yellow-500/15 text-yellow-500"}`}>
              {platform.gate_mode === "open" ? "🔓 مفتوحة" : "🔒 بكود"}
            </span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        {/* 🟡 Admin warning to teacher */}
        {platform.admin_warning && (
          <div className="mb-4 rounded-2xl border-2 border-yellow-500/60 bg-gradient-to-l from-yellow-500/20 via-yellow-500/10 to-yellow-500/5 p-4 flex items-center gap-3 shadow-lg shadow-yellow-500/10 animate-in fade-in slide-in-from-top-2">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500 flex items-center justify-center shrink-0 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-yellow-700 dark:text-yellow-400 mb-1 tracking-wider">⚡ تنبيه عاجل من إدارة ROOTIX</div>
              <div className="text-sm font-semibold leading-relaxed">{platform.admin_warning}</div>
              {platform.admin_warning_at && <div className="text-[10px] text-muted-foreground mt-1">{new Date(platform.admin_warning_at).toLocaleString("ar-EG")}</div>}
            </div>
          </div>
        )}

        {overCapacityBy > 0 && (
          <div className="mb-4 rounded-2xl border-2 border-orange-500/40 bg-gradient-to-l from-orange-500/15 to-orange-500/5 p-4 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-orange-500 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-sm">دخل {students.length} طالب — تجاوزت باقتك بـ {overCapacityBy}</div>
              <div className="text-xs text-muted-foreground">المنصة شغالة عادي، بس الأدمن هيكلمك يرفع الباقة.</div>
            </div>
            <Button size="sm" onClick={() => requestUpgrade(platform)}>طلب رفع الباقة</Button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="الطلاب" value={students.length} max={platform.package_students} icon={Users} warn={overCapacityBy > 0} />
          <StatCard label="المحتوى" value={content.length} icon={FileText} />
          <StatCard label="أكواد متاحة" value={codes.filter(c => !c.is_used).length} icon={KeyRound} />
          <StatCard label="نتائج امتحانات" value="—" icon={BookOpen} />
        </div>

        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
          {[
            { k: "content", label: "المحتوى", icon: FileText },
            { k: "students", label: "الطلاب", icon: Users },
            { k: "codes", label: "الأكواد", icon: KeyRound },
            { k: "live", label: "بث مباشر", icon: Radio },
            { k: "settings", label: "الإعدادات", icon: Cog },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                tab === t.k ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              } ${t.k === "live" && platform.live_active ? "text-red-500" : ""}`}
            >
              <t.icon className={`w-3.5 h-3.5 ${t.k === "live" && platform.live_active ? "animate-pulse" : ""}`} />{t.label}
              {t.k === "live" && platform.live_active && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            </button>
          ))}
        </div>

        {tab === "content" && <ContentManager platform={platform} items={content} refresh={refreshAll} />}
        {tab === "students" && <StudentsList students={students} refresh={refreshAll} />}
        {tab === "codes" && <CodesManager platform={platform} codes={codes} refresh={refreshAll} />}
        {tab === "live" && <LiveTab platform={platform} reload={load} />}
        {tab === "settings" && <SettingsTab platform={platform} reload={load} />}
      </div>

      {/* Rooty AI Floating Assistant */}
      <RootyChat platform={platform} />
    </div>
  );
}

async function requestUpgrade(platform: any) {
  await supabase.from("platforms").update({ upgrade_request: `طلب رفع الباقة في ${new Date().toLocaleDateString("ar-EG")}` }).eq("id", platform.id);
  toast.success("✅ تم إرسال الطلب للأدمن، هيكلمك قريب");
}

function StatCard({ label, value, max, icon: Icon, warn }: any) {
  return (
    <div className={`rounded-xl border ${warn ? "border-orange-500/50 bg-orange-500/5" : "border-border bg-card"} p-4`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><Icon className="w-3.5 h-3.5" />{label}</div>
      <div className="text-2xl font-bold">{value}{max && <span className="text-sm text-muted-foreground"> / {max}</span>}</div>
    </div>
  );
}

function SettingsTab({ platform, reload }: any) {
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);

  const toggleGate = async () => {
    const next = platform.gate_mode === "open" ? "code" : "open";
    await supabase.from("platforms").update({ gate_mode: next }).eq("id", platform.id);
    toast.success(next === "open" ? "المنصة مفتوحة دلوقتي للجميع" : "المنصة بقت مقفلة بالكود");
    reload();
  };

  const setPassword = async () => {
    if (pwNew.length < 4) return toast.error("كلمة السر لازم 4 حروف على الأقل");
    if (pwNew !== pwConfirm) return toast.error("كلمتين السر مش متطابقين");
    await supabase.from("platforms").update({ dashboard_password: pwNew }).eq("id", platform.id);
    toast.success("✅ تم تفعيل كلمة السر. الأدمن عنده نسخة لو نسيتها.");
    setPwNew(""); setPwConfirm("");
    reload();
  };

  const removePassword = async () => {
    if (!confirm("متأكد؟ اللوحة هتبقى مفتوحة لأي حد عنده الرابط")) return;
    await supabase.from("platforms").update({ dashboard_password: null }).eq("id", platform.id);
    sessionStorage.removeItem(`rootix_pdash_${platform.slug}`);
    toast.success("تم إلغاء كلمة السر");
    reload();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Gate toggle */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold flex items-center gap-2">
              {platform.gate_mode === "open" ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-yellow-500" />}
              طريقة دخول الطلاب
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {platform.gate_mode === "open"
                ? "أي طالب عنده الرابط يقدر يسجل ويدخل (الأسرع)"
                : "الطلاب لازم يدخلوا بكود من حضرتك (الأكثر أماناً)"}
            </p>
          </div>
          <Button onClick={toggleGate} variant={platform.gate_mode === "open" ? "outline" : "default"}>
            {platform.gate_mode === "open" ? "اقفل بكود" : "افتح للجميع"}
          </Button>
        </div>
      </div>

      {/* Dashboard password */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="font-bold flex items-center gap-2 mb-1"><Lock className="w-4 h-4 text-primary" /> كلمة سر لوحة التحكم</div>
        <p className="text-sm text-muted-foreground mb-3">
          {platform.dashboard_password
            ? "✅ مفعّلة — أي حد عايز يدخل اللوحة هيطلب منه كلمة السر."
            : "⚠️ غير مفعّلة — أي حد عنده الرابط يقدر يدخل اللوحة. ينصح بشدة تفعّلها."}
        </p>

        {platform.dashboard_password && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 mb-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">كلمة السر الحالية:</span>
            <code className="font-mono text-sm flex-1">{showPw ? platform.dashboard_password : "•".repeat(platform.dashboard_password.length)}</code>
            <Button size="sm" variant="ghost" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          <Input type="password" placeholder="كلمة سر جديدة" value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
          <Input type="password" placeholder="تأكيد كلمة السر" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button onClick={setPassword} className="flex-1 bg-primary text-primary-foreground">حفظ كلمة السر</Button>
          {platform.dashboard_password && <Button onClick={removePassword} variant="outline">إلغاء</Button>}
        </div>
      </div>
    </div>
  );
}

function ContentManager({ platform, items, refresh }: any) {
  const [kind, setKind] = useState<"video" | "pdf" | "question" | "exam">("video");
  const [form, setForm] = useState({ title: "", url: "", grade_level: "", lesson: "" });
  const [examForm, setExamForm] = useState<{ title: string; grade_level: string; questions: any[] }>({
    title: "",
    grade_level: "",
    questions: [{ question: "", options: ["", "", "", ""], correct: 0 }],
  });

  const addSimple = async () => {
    if (!form.title || !form.grade_level) return toast.error("املأ الحقول");
    const { error } = await supabase.from("content").insert({
      platform_id: platform.id,
      kind,
      title: form.title,
      grade_level: form.grade_level,
      lesson: form.lesson,
      data: { url: form.url } as any,
    });
    if (error) return toast.error(error.message);
    toast.success("تمت الإضافة");
    setForm({ title: "", url: "", grade_level: "", lesson: "" });
    refresh();
  };

  const addExam = async () => {
    if (!examForm.title || !examForm.grade_level) return toast.error("املأ الحقول");
    const valid = examForm.questions.filter(q => q.question && q.options.every((o: string) => o));
    if (valid.length === 0) return toast.error("ضع سؤال واحد على الأقل");
    const { error } = await supabase.from("content").insert({
      platform_id: platform.id,
      kind,
      title: examForm.title,
      grade_level: examForm.grade_level,
      data: { questions: valid } as any,
    });
    if (error) return toast.error(error.message);
    toast.success("تمت الإضافة");
    setExamForm({ title: "", grade_level: "", questions: [{ question: "", options: ["", "", "", ""], correct: 0 }] });
    refresh();
  };

  const del = async (id: string) => {
    await supabase.from("content").delete().eq("id", id);
    refresh();
  };

  const grades = (platform.grade_levels as string[]) || [];

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { k: "video", label: "فيديو", icon: Video },
          { k: "pdf", label: "PDF", icon: FileText },
          { k: "exam", label: "امتحان", icon: BookOpen },
          { k: "question", label: "سؤال", icon: ListChecks },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setKind(t.k as any)}
            className={`px-3 py-1.5 rounded-lg border text-sm flex items-center gap-1.5 ${
              kind === t.k ? "border-primary bg-primary/10 text-primary" : "border-border"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 mb-6">
        {kind === "video" || kind === "pdf" ? (
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">الصف</option>
              {grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <Input placeholder={kind === "video" ? "رابط الفيديو" : "رابط PDF"} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="md:col-span-2" />
            <Input placeholder="اسم الدرس (اختياري)" value={form.lesson} onChange={(e) => setForm({ ...form, lesson: e.target.value })} className="md:col-span-2" />
            <Button onClick={addSimple} className="md:col-span-2 bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 ml-1" />إضافة
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input placeholder="عنوان الامتحان/السؤال" value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} />
            <select value={examForm.grade_level} onChange={(e) => setExamForm({ ...examForm, grade_level: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm w-full">
              <option value="">الصف</option>
              {grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            {examForm.questions.map((q, qi) => (
              <div key={qi} className="rounded-lg border border-border p-3 space-y-2">
                <Input placeholder={`السؤال ${qi + 1}`} value={q.question} onChange={(e) => {
                  const qs = [...examForm.questions]; qs[qi].question = e.target.value; setExamForm({ ...examForm, questions: qs });
                }} />
                {q.options.map((o: string, oi: number) => (
                  <div key={oi} className="flex gap-2 items-center">
                    <input type="radio" checked={q.correct === oi} onChange={() => {
                      const qs = [...examForm.questions]; qs[qi].correct = oi; setExamForm({ ...examForm, questions: qs });
                    }} />
                    <Input placeholder={`اختيار ${oi + 1}`} value={o} onChange={(e) => {
                      const qs = [...examForm.questions]; qs[qi].options[oi] = e.target.value; setExamForm({ ...examForm, questions: qs });
                    }} />
                  </div>
                ))}
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setExamForm({ ...examForm, questions: [...examForm.questions, { question: "", options: ["", "", "", ""], correct: 0 }] })}>
                <Plus className="w-4 h-4 ml-1" />سؤال جديد
              </Button>
              <Button onClick={addExam} className="bg-primary text-primary-foreground flex-1">حفظ</Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {items.filter((i: any) => i.kind === kind).map((i: any) => (
          <div key={i.id} className="rounded-lg border border-border bg-card p-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{i.title}</div>
              <div className="text-xs text-muted-foreground">{i.grade_level} {i.lesson ? `• ${i.lesson}` : ""}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => del(i.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentsList({ students, refresh }: any) {
  const [reportFor, setReportFor] = useState<any>(null);
  const remove = async (id: string) => {
    await supabase.from("students").delete().eq("id", id);
    toast.success("تم الحذف");
    refresh();
  };
  if (students.length === 0) return <div className="text-center py-10 text-muted-foreground">لا يوجد طلاب بعد</div>;
  return (
    <>
      <div className="space-y-2">
        {students.map((s: any) => (
          <div key={s.id} className="rounded-lg border border-border bg-card p-3 flex items-center justify-between hover:border-primary/50 transition-colors">
            <button onClick={() => setReportFor(s)} className="flex-1 text-start">
              <div className="font-medium text-sm hover:text-primary">{s.full_name}</div>
              <div className="text-xs text-muted-foreground">{s.phone} • {s.grade_level} • كود: {s.access_code}</div>
            </button>
            <Button variant="ghost" size="icon" onClick={() => remove(s.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
      {reportFor && <StudentReportModal student={reportFor} onClose={() => setReportFor(null)} />}
    </>
  );
}

function StudentReportModal({ student, onClose }: { student: any; onClose: () => void }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("exam_results")
        .select("*, content:exam_id(title,kind)")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false });
      setResults(data || []);
      setLoading(false);
    })();
  }, [student.id]);

  // Stats
  const totalExams = results.length;
  const totalCorrect = results.reduce((s, r) => s + (r.score || 0), 0);
  const totalQuestions = results.reduce((s, r) => s + (r.total || 0), 0);
  const totalWrong = totalQuestions - totalCorrect;
  const avgPct = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  let levelLabel = "محتاج دعم", levelColor = "text-destructive", levelBg = "bg-destructive/10";
  if (avgPct >= 85) { levelLabel = "ممتاز ⭐"; levelColor = "text-green-500"; levelBg = "bg-green-500/10"; }
  else if (avgPct >= 70) { levelLabel = "جيد جداً"; levelColor = "text-blue-500"; levelBg = "bg-blue-500/10"; }
  else if (avgPct >= 50) { levelLabel = "متوسط"; levelColor = "text-yellow-500"; levelBg = "bg-yellow-500/10"; }
  else if (avgPct >= 30) { levelLabel = "ضعيف"; levelColor = "text-orange-500"; levelBg = "bg-orange-500/10"; }

  const downloadPdf = async () => {
    // Build a richer Arabic recommendation
    let advice = "";
    if (avgPct >= 85) advice = "الطالب متفوق جداً وملتزم. ينصح بإعطائه تحديات أصعب وأسئلة إثرائية للحفاظ على شغفه.";
    else if (avgPct >= 70) advice = "الطالب مستواه جيد جداً ومحتاج بس مزيد من التدريب على الأسئلة الصعبة وتمرين أكتر على المسائل المركبة.";
    else if (avgPct >= 50) advice = "الطالب مستواه متوسط ويحتاج لمراجعة منتظمة وحل أسئلة إضافية وتركيز أكبر على نقاط الضعف اللي ظهرت في الامتحانات.";
    else if (avgPct >= 30) advice = "الطالب ضعيف ويحتاج إلى متابعة دقيقة من ولي الأمر، إعادة شرح الدروس الأساسية، وحصص دعم إضافية.";
    else advice = "الطالب يحتاج إلى تدخل عاجل من المدرس وولي الأمر، إعادة بناء أساسياته في المادة، ومتابعة يومية لتحسن مستواه.";

    const examsRows = results.length === 0
      ? `<tr><td colspan="4" style="text-align:center;padding:14px;color:#777">لم يحل أي امتحانات حتى الآن</td></tr>`
      : results.map((r: any, i: number) => {
          const pct = r.total ? Math.round((r.score / r.total) * 100) : 0;
          return `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee">${i + 1}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${r.content?.title || "امتحان"}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${r.score} / ${r.total} (${pct}%)</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${new Date(r.created_at).toLocaleDateString("ar-EG")}</td>
          </tr>`;
        }).join("");

    const html = `
      <div style="border-bottom:3px solid #6366f1;padding-bottom:14px;margin-bottom:18px">
        <div style="font-size:28px;font-weight:900;color:#6366f1">📊 تقرير الطالب الشامل</div>
        <div style="font-size:13px;color:#666;margin-top:4px">صادر من منصة ROOTIX — ${new Date().toLocaleString("ar-EG")}</div>
      </div>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px;margin-bottom:18px">
        <div style="font-size:20px;font-weight:800;margin-bottom:10px;color:#0f172a">بيانات الطالب</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:15px">
          <div><b>الاسم:</b> ${student.full_name}</div>
          <div><b>رقم التليفون:</b> ${student.phone}</div>
          <div><b>الصف الدراسي:</b> ${student.grade_level}</div>
          <div><b>كود الدخول:</b> ${student.access_code}</div>
          <div><b>تاريخ الانضمام:</b> ${new Date(student.created_at).toLocaleDateString("ar-EG")}</div>
          <div><b>عدد النقاط:</b> ${student.points || 0} نقطة</div>
          ${student.lesson_time ? `<div><b>معاد الحصة:</b> ${student.lesson_time}</div>` : ""}
          ${Array.isArray(student.schedule_days) && student.schedule_days.length ? `<div><b>أيام الحصة:</b> ${student.schedule_days.join("، ")}</div>` : ""}
        </div>
      </div>

      <div style="background:#eef2ff;border:2px solid #6366f1;border-radius:14px;padding:18px;margin-bottom:18px;text-align:center">
        <div style="font-size:14px;color:#555;margin-bottom:6px">المستوى الدراسي العام</div>
        <div style="font-size:34px;font-weight:900;color:#4f46e5">${levelLabel}</div>
        <div style="font-size:18px;color:#444;margin-top:4px">متوسط الدرجات: <b>${avgPct}%</b></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px">
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;text-align:center">
          <div style="font-size:12px;color:#777">امتحانات</div>
          <div style="font-size:24px;font-weight:900">${totalExams}</div>
        </div>
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:12px;text-align:center">
          <div style="font-size:12px;color:#16a34a">إجابات صحيحة</div>
          <div style="font-size:24px;font-weight:900;color:#16a34a">${totalCorrect}</div>
        </div>
        <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:12px;text-align:center">
          <div style="font-size:12px;color:#dc2626">إجابات خاطئة</div>
          <div style="font-size:24px;font-weight:900;color:#dc2626">${totalWrong}</div>
        </div>
        <div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:10px;padding:12px;text-align:center">
          <div style="font-size:12px;color:#2563eb">إجمالي الأسئلة</div>
          <div style="font-size:24px;font-weight:900;color:#2563eb">${totalQuestions}</div>
        </div>
      </div>

      <div style="margin-bottom:14px">
        <div style="font-size:18px;font-weight:800;margin-bottom:8px">📝 سجل الامتحانات</div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
          <thead>
            <tr style="background:#f1f5f9">
              <th style="padding:10px;text-align:right">#</th>
              <th style="padding:10px;text-align:right">الامتحان</th>
              <th style="padding:10px;text-align:right">الدرجة</th>
              <th style="padding:10px;text-align:right">التاريخ</th>
            </tr>
          </thead>
          <tbody>${examsRows}</tbody>
        </table>
      </div>

      <div style="background:#fffbeb;border:2px solid #fbbf24;border-radius:14px;padding:18px">
        <div style="font-size:16px;font-weight:800;margin-bottom:8px;color:#b45309">📌 جملة لولي الأمر / المدرس</div>
        <div style="font-size:15px;line-height:1.9;color:#333">${advice}</div>
      </div>

      <div style="margin-top:24px;text-align:center;font-size:11px;color:#999">
        تم توليد هذا التقرير تلقائياً عبر منصة ROOTIX — جميع الحقوق محفوظة © ${new Date().getFullYear()}
      </div>
    `;

    await renderArabicPdf(html, `تقرير-${student.full_name}.pdf`);
    toast.success("تم تحميل التقرير");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">📊 تقرير {student.full_name}</h2>
            <p className="text-xs text-muted-foreground">{student.phone} • {student.grade_level}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={downloadPdf} variant="outline"><Download className="w-4 h-4 ml-1" />PDF</Button>
            <Button size="sm" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : (
            <>
              {/* Level badge */}
              <div className={`rounded-2xl border-2 ${levelBg} p-5 text-center`}>
                <div className="text-xs text-muted-foreground mb-1">المستوى الدراسي</div>
                <div className={`text-3xl font-black ${levelColor}`}>{levelLabel}</div>
                <div className="text-sm text-muted-foreground mt-1">متوسط: {avgPct}%</div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-lg border border-border bg-background p-3 text-center">
                  <div className="text-xs text-muted-foreground">امتحانات</div>
                  <div className="text-2xl font-bold">{totalExams}</div>
                </div>
                <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-center">
                  <div className="text-xs text-muted-foreground">إجابات صح</div>
                  <div className="text-2xl font-bold text-green-500">{totalCorrect}</div>
                </div>
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-center">
                  <div className="text-xs text-muted-foreground">إجابات غلط</div>
                  <div className="text-2xl font-bold text-destructive">{totalWrong}</div>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center">
                  <div className="text-xs text-muted-foreground">إجمالي الأسئلة</div>
                  <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
                </div>
              </div>

              {/* Exam history */}
              <div>
                <div className="font-bold text-sm mb-2">📝 سجل الامتحانات</div>
                {results.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">الطالب ما حلش امتحانات لسه</div>
                ) : (
                  <div className="space-y-2">
                    {results.map((r) => {
                      const pct = r.total ? Math.round((r.score / r.total) * 100) : 0;
                      return (
                        <div key={r.id} className="rounded-lg border border-border bg-background p-3 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-sm">{r.content?.title || "امتحان"}</div>
                            <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("ar-EG")}</div>
                          </div>
                          <div className={`text-lg font-bold ${pct >= 70 ? "text-green-500" : pct >= 50 ? "text-yellow-500" : "text-destructive"}`}>
                            {r.score}/{r.total} <span className="text-xs">({pct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CodesManager({ platform, codes, refresh }: any) {
  const [count, setCount] = useState(50);
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (count < 1 || count > 5000) return toast.error("العدد لازم بين 1 و 5000");
    setGenerating(true);
    try {
      // Format: ab + 3-5 digits (e.g., ab847, ab12345). Easy to remember & type.
      const used = new Set<string>();
      const newCodes = Array.from({ length: count }, () => {
        let code = "";
        do {
          code = "ab" + Math.floor(100 + Math.random() * 99900);
        } while (used.has(code));
        used.add(code);
        return { platform_id: platform.id, code, is_used: false };
      });
      const { error } = await supabase.from("student_codes").insert(newCodes);
      if (error) throw error;
      toast.success(`تم توليد ${count} كود`);
      refresh();
    } catch (e: any) {
      toast.error("فشل: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadPdf = () => {
    const unused = codes.filter((c: any) => !c.is_used);
    if (unused.length === 0) return toast.error("مفيش أكواد متاحة. ولّد أكواد جديدة الأول.");

    const doc = new jsPDF();
    const platformName = platform.config?.platform_name || "ROOTIX Platform";

    // Header
    doc.setFontSize(18);
    doc.text(platformName, 105, 20, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Student Access Codes - ${unused.length} codes`, 105, 28, { align: "center" });
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US")}`, 105, 34, { align: "center" });
    doc.setDrawColor(180);
    doc.line(20, 40, 190, 40);

    // Codes in 3 columns
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.setFont("courier", "bold");
    const cols = 3;
    const startY = 50;
    const colW = (190 - 20) / cols;
    const rowH = 9;
    const rowsPerPage = 30;

    unused.forEach((c: any, idx: number) => {
      const localIdx = idx % (cols * rowsPerPage);
      const col = localIdx % cols;
      const row = Math.floor(localIdx / cols);
      const x = 20 + col * colW + colW / 2;
      const y = startY + row * rowH;
      doc.text(`${idx + 1}. ${c.code}`, x, y, { align: "center" });
      if ((idx + 1) % (cols * rowsPerPage) === 0 && idx + 1 < unused.length) {
        doc.addPage();
      }
    });

    doc.save(`${platform.slug}-codes-${unused.length}.pdf`);
    toast.success("تم تحميل ملف الأكواد PDF");
  };

  const copyAll = () => {
    const text = codes.filter((c: any) => !c.is_used).map((c: any) => c.code).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الأكواد");
  };

  const usedCount = codes.filter((c: any) => c.is_used).length;
  const unusedCount = codes.length - usedCount;

  return (
    <div>
      {platform.gate_mode === "open" && (
        <div className="mb-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm">
          <strong>⚠️ المنصة دلوقتي مفتوحة بدون كود.</strong> الأكواد دي مش هتشتغل إلا لما تقفل المنصة من الإعدادات.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard label="إجمالي" value={codes.length} icon={KeyRound} />
        <StatCard label="مستخدم" value={usedCount} icon={Users} />
        <StatCard label="متاح" value={unusedCount} icon={KeyRound} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <div className="font-bold mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />ولّد أكواد جديدة</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input type="number" min={1} max={5000} value={count} onChange={(e) => setCount(+e.target.value)} placeholder="عدد الأكواد" />
          <Button onClick={generate} disabled={generating} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 ml-1" />
            {generating ? "جاري التوليد..." : `ولّد ${count} كود`}
          </Button>
          <Button onClick={downloadPdf} variant="outline" disabled={unusedCount === 0}>
            <Download className="w-4 h-4 ml-1" />تحميل PDF
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2">يمكنك توليد لحد 5000 كود مرة واحدة.</div>
      </div>

      <div className="flex gap-2 mb-3">
        <Button onClick={copyAll} variant="outline" size="sm" disabled={unusedCount === 0}>نسخ الأكواد المتاحة</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {codes.slice(0, 200).map((c: any) => (
          <div key={c.id} className={`rounded-lg border p-2 text-center font-mono text-sm ${c.is_used ? "border-border bg-muted/30 text-muted-foreground line-through" : "border-primary/30 bg-primary/5"}`}>
            {c.code}
          </div>
        ))}
        {codes.length > 200 && (
          <div className="col-span-full text-center text-xs text-muted-foreground py-2">
            + {codes.length - 200} كود آخر... (حمل PDF لتشوفهم كلهم)
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// LiveTab — بث مباشر (يوتيوب) للمدرس
// ============================================================
function LiveTab({ platform, reload }: any) {
  const [url, setUrl] = useState(platform.live_url || "");
  const [title, setTitle] = useState(platform.live_title || "");
  const [cover, setCover] = useState(platform.live_cover_url || "");
  const [busy, setBusy] = useState(false);

  const isYoutube = (u: string) => /youtube\.com|youtu\.be/i.test(u);

  const startLive = async () => {
    if (!url.trim()) return toast.error("لازم تحط رابط البث");
    if (!isYoutube(url)) return toast.error("الرابط لازم يكون من يوتيوب");
    setBusy(true);
    const { error } = await supabase.from("platforms").update({
      live_active: true,
      live_url: url.trim(),
      live_title: title.trim() || "بث مباشر",
      live_cover_url: cover.trim() || null,
      live_started_at: new Date().toISOString(),
    }).eq("id", platform.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("🔴 البث شغال دلوقتي — الطلاب هيشوفوه فوراً");
    reload();
  };

  const stopLive = async () => {
    setBusy(true);
    const { error } = await supabase.from("platforms").update({
      live_active: false,
    }).eq("id", platform.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("تم إيقاف البث");
    reload();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Status card */}
      <div className={`rounded-2xl border-2 p-5 ${platform.live_active ? "border-red-500/50 bg-red-500/5" : "border-border bg-card"}`}>
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-3 h-3 rounded-full ${platform.live_active ? "bg-red-500 animate-pulse" : "bg-muted-foreground/40"}`} />
          <div className="font-bold text-lg">
            {platform.live_active ? "🔴 البث شغال دلوقتي" : "البث متوقف"}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {platform.live_active
            ? `الطلاب شايفين بانر "عاجل" في الداش بورد بتاعهم. وقت البداية: ${new Date(platform.live_started_at).toLocaleTimeString("ar-EG")}`
            : "لما تشغل البث هيظهر بانر تلقائياً للطلاب. ينصح تستخدم بث يوتيوب Unlisted."}
        </p>
      </div>

      {/* How to */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-sm space-y-2">
        <div className="font-bold flex items-center gap-2"><Radio className="w-4 h-4 text-blue-500" /> ازاي تعمل بث مباشر؟</div>
        <ol className="list-decimal pr-5 space-y-1 text-muted-foreground">
          <li>افتح يوتيوب → دوس على زرار "Create" → "Go Live".</li>
          <li>اختار <strong>Unlisted</strong> (مش هيظهر للناس، بس اللي معاهم الرابط بس).</li>
          <li>انسخ الرابط بتاع البث وحطه هنا تحت.</li>
          <li>دوس "ابدأ البث" → الطلاب هيشوفوه في نص الداش بورد فوراً.</li>
        </ol>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">رابط البث (يوتيوب) *</label>
          <Input placeholder="https://youtube.com/live/..." value={url} onChange={(e) => setUrl(e.target.value)} disabled={platform.live_active} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">عنوان البث (اختياري)</label>
          <Input placeholder="مثال: مراجعة الفصل الأول" value={title} onChange={(e) => setTitle(e.target.value)} disabled={platform.live_active} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">رابط صورة الغلاف (اختياري)</label>
          <Input placeholder="https://..." value={cover} onChange={(e) => setCover(e.target.value)} disabled={platform.live_active} />
        </div>

        {platform.live_active ? (
          <Button onClick={stopLive} disabled={busy} variant="destructive" className="w-full">
            <X className="w-4 h-4 ml-1" /> إيقاف البث
          </Button>
        ) : (
          <Button onClick={startLive} disabled={busy} className="w-full bg-red-500 hover:bg-red-600 text-white">
            <Radio className="w-4 h-4 ml-1" /> ابدأ البث المباشر
          </Button>
        )}
      </div>
    </div>
  );
}

function RootyChat({ platform }: { platform: any }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: `أهلاً أ/ ${platform.teacher_name} 👋\nأنا Rooty، مساعدك الشخصي. أقدر أحط لك أسئلة، امتحانات، فيديوهات، PDF، وكمان أصلح أي أخطاء في المنصة (مفتوح بدون حد).\n\n⚠️ ملاحظة: أحياناً ممكن أعمل أخطاء بسيطة، فمراجعة المحتوى قبل النشر للطلاب أحسن.\n\nقولي تحب أساعدك في إيه؟` },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // Load today's used count on open
  useEffect(() => {
    if (!open) return;
    (async () => {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("rooty_actions")
        .select("*", { count: "exact", head: true })
        .eq("platform_id", platform.id)
        .gte("created_at", start.toISOString());
      setRemaining(Math.max(0, 5 - (count || 0)));
    })();
  }, [open, platform.id]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg = { role: "user" as const, content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("rooty-assistant", {
        body: { platform_id: platform.id, messages: next },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const actionsLine = data.actions?.length
        ? `\n\n${data.actions.filter((a: any) => a.ok).map((a: any) => `✅ تمت إضافة: ${a.title}`).join("\n")}`
        : "";
      setMessages([...next, { role: "assistant", content: (data.reply || "تمام ✅") + actionsLine }]);
      setRemaining(data.remaining_today ?? remaining);
      if (data.actions?.some((a: any) => a.ok)) {
        toast.success("Rooty نفذ العمل ✅");
      }
    } catch (e: any) {
      setMessages([...next, { role: "assistant", content: "حصل خطأ: " + (e.message || "غير معروف") }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-50 group"
          aria-label="افتح Rooty"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/40 blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background animate-pulse" />
          </div>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs bg-card border border-border px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            🤖 كلم Rooty
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 left-6 z-50 w-[min(92vw,420px)] h-[min(80vh,640px)] rounded-3xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-l from-primary to-primary/70 text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold leading-tight">Rooty</div>
                <div className="text-xs opacity-90">مساعدك الشخصي</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
                مفتوح ∞
              </span>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-3 py-2 flex items-start gap-2 text-[11px] text-yellow-700 dark:text-yellow-400 leading-snug">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>قد تظهر أخطاء مع Rooty، فا ينصح بعدم استخدامه في كتابة الأسئلة في المنصة بتاعت حضرتك بشكل أساسي. راجع كل عمل بعد ما يخلص.</span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-muted text-foreground rounded-br-sm"
                    : "bg-gradient-to-bl from-primary/15 to-primary/5 border border-primary/20 text-foreground rounded-bl-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-end">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2 bg-background/50">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="اكتب رسالتك لـ Rooty..."
              disabled={busy}
              className="flex-1"
            />
            <Button onClick={send} disabled={busy || !input.trim()} size="icon" className="bg-primary text-primary-foreground shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
