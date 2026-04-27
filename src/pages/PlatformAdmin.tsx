import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Users, KeyRound, Video, FileText, ListChecks, BookOpen } from "lucide-react";

export default function PlatformAdmin() {
  const { slug } = useParams();
  const [platform, setPlatform] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<"content" | "students" | "codes">("content");
  const [content, setContent] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, [slug]);

  useEffect(() => {
    if (!loggedIn || !platform) return;
    refreshAll();

    // Realtime: any change in content/students/codes updates instantly
    const channel = supabase
      .channel(`platform-${platform.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "content", filter: `platform_id=eq.${platform.id}` }, refreshAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "students", filter: `platform_id=eq.${platform.id}` }, refreshAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "student_codes", filter: `platform_id=eq.${platform.id}` }, refreshAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loggedIn, platform]);

  const load = async () => {
    const { data } = await supabase.from("platforms").select("*").eq("slug", slug!).maybeSingle();
    setPlatform(data);
    if (localStorage.getItem(`rootix_platform_admin_${slug}`) === "1") setLoggedIn(true);
  };

  const refreshAll = async () => {
    const [c, s, k] = await Promise.all([
      supabase.from("content").select("*").eq("platform_id", platform.id).order("created_at", { ascending: false }),
      supabase.from("students").select("*").eq("platform_id", platform.id).order("created_at", { ascending: false }),
      supabase.from("student_codes").select("*").eq("platform_id", platform.id).order("created_at", { ascending: false }),
    ]);
    setContent(c.data || []);
    setStudents(s.data || []);
    setCodes(k.data || []);
  };

  const login = () => {
    // Simple auth: password = platform code (e.g. R-1234) or teacher phone last 4
    if (!platform) return;
    if (pw === platform.code || pw === platform.teacher_phone) {
      localStorage.setItem(`rootix_platform_admin_${slug}`, "1");
      setLoggedIn(true);
      toast.success("أهلاً أستاذ " + platform.teacher_name);
    } else {
      toast.error("كلمة المرور غير صحيحة");
    }
  };

  if (!platform) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
          <h1 className="text-xl font-bold mb-1">لوحة تحكم المدرس</h1>
          <p className="text-sm text-muted-foreground mb-5">{platform.config?.platform_name || platform.teacher_name}</p>
          <Input
            type="password"
            placeholder="كلمة المرور (كود المنصة أو رقم هاتفك)"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          <Button onClick={login} className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground">
            دخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm">{platform.config?.platform_name}</div>
            <div className="text-xs text-muted-foreground">لوحة تحكم — {platform.teacher_name}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { localStorage.removeItem(`rootix_platform_admin_${slug}`); setLoggedIn(false); }}>
            خروج
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="الطلاب" value={students.length} max={platform.package_students} icon={Users} />
          <StatCard label="المحتوى" value={content.length} icon={FileText} />
          <StatCard label="أكواد متاحة" value={codes.filter(c => !c.is_used).length} icon={KeyRound} />
        </div>

        <div className="flex gap-2 mb-6 border-b border-border">
          {[
            { k: "content", label: "المحتوى" },
            { k: "students", label: "الطلاب" },
            { k: "codes", label: "الأكواد" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                tab === t.k ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "content" && <ContentManager platform={platform} items={content} refresh={refreshAll} />}
        {tab === "students" && <StudentsList students={students} refresh={refreshAll} />}
        {tab === "codes" && <CodesManager platform={platform} codes={codes} refresh={refreshAll} />}
      </div>
    </div>
  );
}

function StatCard({ label, value, max, icon: Icon }: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><Icon className="w-3.5 h-3.5" />{label}</div>
      <div className="text-2xl font-bold">{value}{max && <span className="text-sm text-muted-foreground"> / {max}</span>}</div>
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
      {/* Type picker */}
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

      {/* Add form */}
      <div className="rounded-xl border border-border bg-card p-4 mb-6">
        {kind === "video" || kind === "pdf" ? (
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">الصف</option>
              {grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <Input placeholder={kind === "video" ? "رابط الفيديو (YouTube/Direct)" : "رابط PDF"} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="md:col-span-2" />
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

      {/* List */}
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
  const remove = async (id: string) => {
    await supabase.from("students").delete().eq("id", id);
    toast.success("تم الحذف");
    refresh();
  };
  if (students.length === 0) return <div className="text-center py-10 text-muted-foreground">لا يوجد طلاب بعد</div>;
  return (
    <div className="space-y-2">
      {students.map((s: any) => (
        <div key={s.id} className="rounded-lg border border-border bg-card p-3 flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">{s.full_name}</div>
            <div className="text-xs text-muted-foreground">{s.phone} • {s.grade_level} • كود: {s.access_code}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => remove(s.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function CodesManager({ platform, codes, refresh }: any) {
  const [count, setCount] = useState(10);

  const generate = async () => {
    const newCodes = Array.from({ length: count }, () => ({
      platform_id: platform.id,
      code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      is_used: false,
    }));
    const { error } = await supabase.from("student_codes").insert(newCodes);
    if (error) return toast.error(error.message);
    toast.success(`تم توليد ${count} كود`);
    refresh();
  };

  const copyAll = () => {
    const text = codes.filter((c: any) => !c.is_used).map((c: any) => c.code).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الأكواد");
  };

  return (
    <div>
      <div className="rounded-xl border border-border bg-card p-4 mb-4 flex gap-2">
        <Input type="number" value={count} onChange={(e) => setCount(+e.target.value)} placeholder="عدد الأكواد" />
        <Button onClick={generate} className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 ml-1" />توليد</Button>
        <Button variant="outline" onClick={copyAll}>نسخ غير المستخدم</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {codes.map((c: any) => (
          <div key={c.id} className={`rounded-lg border p-2 text-center font-mono text-sm ${c.is_used ? "border-border bg-muted/30 text-muted-foreground line-through" : "border-primary/30 bg-primary/5"}`}>
            {c.code}
          </div>
        ))}
      </div>
    </div>
  );
}
