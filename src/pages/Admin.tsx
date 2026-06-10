import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Users, CheckCircle, XCircle, Pause, Play, ArrowLeft, Phone, Calendar, AlertTriangle, TrendingUp, TrendingDown, Eye, Trash2, Search, Copy, ExternalLink, Sparkles, Bell, Loader2, DollarSign, Clock, X, FileText, Download } from "lucide-react";
import { RootixLogo } from "@/components/RootixLogo";
import RootyScanAnimation from "@/components/RootyScanAnimation";


interface Platform {
  id: string;
  code: string;
  slug: string;
  teacher_name: string;
  teacher_phone: string;
  subject: string;
  stage: string;
  template_tier: string;
  package_students: number;
  package_price: number;
  status: string;
  payment_status: string;
  config: any;
  admin_notes: string | null;
  created_at: string;
  requested_students?: number | null;
  requested_tier?: string | null;
  upgrade_request?: string | null;
  deleted_at?: string | null;
  deleted_reason?: string | null;
  dashboard_password?: string | null;
  gate_mode?: string;
}

interface StudentCounts {
  [platformId: string]: number;
}

const ADMIN_EMAIL = "admin987@gmail.com";
const ADMIN_PASSWORD = "987";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [studentCounts, setStudentCounts] = useState<StudentCounts>({});
  const [globalStats, setGlobalStats] = useState({ totalStudents: 0, totalContent: 0, totalExams: 0, avgScore: 0, todayStudents: 0, weekStudents: 0, totalRevenue: 0, lifetimeRevenue: 0 });
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "paused" | "alerts" | "deleted">("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [checkResults, setCheckResults] = useState<Record<string, any>>({});
  const [paymentsModalFor, setPaymentsModalFor] = useState<Platform | null>(null);
  const [paymentsByPlatform, setPaymentsByPlatform] = useState<Record<string, any[]>>({});
  const [studentReportFor, setStudentReportFor] = useState<{ student: any; platform: Platform } | null>(null);
  const [studentsModalFor, setStudentsModalFor] = useState<Platform | null>(null);
  const [studentsModalData, setStudentsModalData] = useState<any[]>([]);
  const [companyReportOpen, setCompanyReportOpen] = useState(false);
  const [warningModalFor, setWarningModalFor] = useState<Platform | null>(null);

  useEffect(() => {
    if (localStorage.getItem("rootix_admin") === "1") setLoggedIn(true);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    load();

    // Track seen platform IDs to detect new arrivals
    const seenIds = new Set<string>();

    const channel = supabase
      .channel("admin-platforms-v3")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "platforms" }, (payload: any) => {
        const newP = payload.new;
        if (newP && !seenIds.has(newP.id)) {
          seenIds.add(newP.id);
          // Skip drafts (status='approved' and payment_status='draft')
          if (newP.payment_status !== "draft") {
            playNotificationSound();
            toast.success(`🔔 طلب جديد من ${newP.teacher_name || "مدرس"}!`, {
              description: `${newP.config?.platform_name || "منصة جديدة"} — ${newP.teacher_phone || ""}`,
              duration: 8000,
            });
          }
        }
        load();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "platforms" }, (payload: any) => {
        const oldP = payload.old;
        const newP = payload.new;
        // Detect draft → pending transition (real new request)
        if (oldP?.payment_status === "draft" && newP?.payment_status === "unpaid" && newP?.status === "pending") {
          playNotificationSound();
          toast.success(`🔔 طلب جديد من ${newP.teacher_name}!`, {
            description: `${newP.config?.platform_name || "منصة جديدة"} — ${newP.teacher_phone}`,
            duration: 8000,
          });
        }
        load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => loadStudentCounts())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loggedIn]);

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // ignore
    }
  };

  const runAiCheck = async (platformId: string) => {
    setCheckingId(platformId);
    const startedAt = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke("rootix-check", {
        body: { platform_id: platformId },
      });
      if (error) throw error;
      // Keep cinematic animation visible at least 9s
      const elapsed = Date.now() - startedAt;
      if (elapsed < 9000) await new Promise((r) => setTimeout(r, 9000 - elapsed));
      setCheckResults((prev) => ({ ...prev, [platformId]: data }));
      if (data.fixes_applied?.length) {
        toast.success(`🛠️ Rooty أصلح ${data.fixes_applied.length} مشكلة`);
      } else if (data.ok) {
        toast.success("✅ المنصة سليمة 100%");
      } else {
        toast.error(`⚠️ ${data.issues.length} مشكلة محتاجة مراجعة`);
      }
    } catch (e: any) {
      toast.error("فشل الفحص: " + e.message);
    } finally {
      setCheckingId(null);
    }
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("platforms")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else {
      setPlatforms((data as any) || []);
      await loadStudentCounts();
    }
    setLoading(false);
  };

  const loadStudentCounts = async () => {
    const { data: studentsData } = await supabase.from("students").select("platform_id, created_at");
    if (!studentsData) return;
    const counts: StudentCounts = {};
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    let todayCount = 0, weekCount = 0;
    for (const s of studentsData as any[]) {
      counts[s.platform_id] = (counts[s.platform_id] || 0) + 1;
      const t = new Date(s.created_at).getTime();
      if (now - t < dayMs) todayCount++;
      if (now - t < 7 * dayMs) weekCount++;
    }
    setStudentCounts(counts);

    const [{ count: contentCount }, { data: examResults }, { data: payments }] = await Promise.all([
      supabase.from("content").select("*", { count: "exact", head: true }),
      supabase.from("exam_results").select("score,total"),
      supabase.from("platform_payments").select("amount,platform_id,paid_at"),
    ]);
    const totalExams = examResults?.length || 0;
    const avgScore = totalExams > 0
      ? Math.round((examResults!.reduce((s: number, r: any) => s + (r.total ? (r.score / r.total) * 100 : 0), 0) / totalExams))
      : 0;

    // Group payments per platform
    const grouped: Record<string, any[]> = {};
    let lifetime = 0;
    for (const p of (payments || []) as any[]) {
      grouped[p.platform_id] = grouped[p.platform_id] || [];
      grouped[p.platform_id].push(p);
      lifetime += p.amount || 0;
    }
    setPaymentsByPlatform(grouped);

    setGlobalStats((prev) => ({
      ...prev,
      totalStudents: studentsData.length,
      totalContent: contentCount || 0,
      totalExams,
      avgScore,
      todayStudents: todayCount,
      weekStudents: weekCount,
      lifetimeRevenue: lifetime,
    }));
  };

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("rootix_admin", "1");
      setLoggedIn(true);
      toast.success("أهلاً بك في لوحة ROOTIX");
    } else toast.error("بيانات غير صحيحة");
  };

  const logout = () => {
    localStorage.removeItem("rootix_admin");
    setLoggedIn(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "approved" || status === "active") {
      patch.approved_at = new Date().toISOString();
      patch.status = "active";
    }
    const { error } = await supabase.from("platforms").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "تم نشر المنصة! 🎉" : "تم التحديث");
  };

  const togglePayment = async (id: string, current: string) => {
    const next = current === "paid" ? "unpaid" : "paid";
    const { error } = await supabase.from("platforms").update({ payment_status: next }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(next === "paid" ? "تم تأكيد الدفع" : "تم إلغاء تأكيد الدفع");
  };

  const deletePlatform = async (id: string) => {
    const reason = prompt("ليه بتحذف المنصة دي؟ (اكتب السبب)");
    if (!reason || !reason.trim()) return toast.error("لازم تكتب سبب");
    const { error } = await supabase.from("platforms").update({
      status: "deleted",
      deleted_at: new Date().toISOString(),
      deleted_reason: reason.trim(),
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الأرشفة");
  };

  const restorePlatform = async (id: string) => {
    if (!confirm("ترجع المنصة دي؟")) return;
    await supabase.from("platforms").update({ status: "pending", deleted_at: null, deleted_reason: null }).eq("id", id);
    toast.success("رجعت");
  };

  const purgePlatform = async (id: string) => {
    if (!confirm("⚠️ حذف نهائي! هيتم مسح المنصة + الطلاب + المحتوى + الدفعات + الأكواد. مش هترجع تاني. متأكد؟")) return;
    // Cascade delete: payments, students, codes, content, exam_results
    await Promise.all([
      supabase.from("platform_payments").delete().eq("platform_id", id),
      supabase.from("students").delete().eq("platform_id", id),
      supabase.from("student_codes").delete().eq("platform_id", id),
      supabase.from("content").delete().eq("platform_id", id),
      supabase.from("exam_results").delete().eq("platform_id", id),
      supabase.from("rooty_actions").delete().eq("platform_id", id),
      supabase.from("video_watch").delete().eq("platform_id", id),
    ]);
    const { error } = await supabase.from("platforms").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف نهائياً (المنصة + كل بياناتها)");
  };

  const openStudents = async (p: Platform) => {
    setStudentsModalFor(p);
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("platform_id", p.id)
      .order("created_at", { ascending: false });
    setStudentsModalData(data || []);
  };

  const openCompanyReport = () => setCompanyReportOpen(true);

  const resetAllRevenue = async () => {
    if (!confirm("⚠️ هتمسح كل الدفعات + ترجع كل المنصات لـ غير مدفوع. متأكد؟")) return;
    if (!confirm("متأكد فعلاً؟ مفيش رجوع.")) return;
    await supabase.from("platform_payments").delete().gte("amount", -1);
    await supabase.from("platforms").update({ payment_status: "unpaid" }).gte("package_price", 0);
    toast.success("✅ تم تصفير كل الإيرادات");
    load();
  };

  const saveWarning = async (id: string, msg: string) => {
    const trimmed = msg.trim();
    await supabase.from("platforms").update({
      admin_warning: trimmed || null,
      admin_warning_at: trimmed ? new Date().toISOString() : null,
    } as any).eq("id", id);
    toast.success(trimmed ? "✅ تم إرسال التحذير للمدرس" : "تم مسح التحذير");
    setWarningModalFor(null);
    load();
  };


  const changePackage = async (p: Platform) => {
    const newCount = prompt(`غير عدد الطلاب للباقة (الحالي: ${p.package_students}):`, String(p.package_students));
    if (!newCount) return;
    const newPrice = prompt(`السعر الجديد بالجنيه (الحالي: ${p.package_price}):`, String(p.package_price));
    if (!newPrice) return;
    await supabase.from("platforms").update({
      package_students: parseInt(newCount),
      package_price: parseInt(newPrice),
      upgrade_request: null,
    }).eq("id", p.id);
    toast.success("تم تحديث الباقة");
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/m/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("تم نسخ رابط المنصة");
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
        <form onSubmit={login} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
          <div className="flex items-center gap-2 mb-6">
            <RootixLogo size={32} />
            <span className="font-bold">ROOTIX Admin</span>
          </div>
          <h1 className="text-2xl font-bold mb-6">تسجيل دخول الأدمن</h1>
          <div className="space-y-3">
            <Input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">دخول</Button>
            <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="inline w-3 h-3 ml-1" />العودة
            </Link>
          </div>
        </form>
      </div>
    );
  }

  const isOverCapacity = (p: Platform) => (studentCounts[p.id] || 0) > p.package_students;
  const hasAlert = (p: Platform) =>
    isOverCapacity(p) ||
    !!p.upgrade_request ||
    (p.status === "active" && p.payment_status !== "paid");

  const filtered = platforms
    .filter((p) => {
      if (filter === "deleted") return p.status === "deleted" || p.deleted_at;
      if (p.status === "deleted" || p.deleted_at) return false;
      if (filter === "all") return true;
      if (filter === "pending") return p.status === "pending";
      if (filter === "approved") return p.status === "active" || p.status === "approved";
      if (filter === "paused") return p.status === "paused";
      if (filter === "alerts") return hasAlert(p);
      return true;
    })
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.teacher_name?.toLowerCase().includes(q) ||
        p.teacher_phone?.includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.config?.platform_name?.toLowerCase().includes(q)
      );
    });

  const deletedPlatforms = platforms.filter((p) => p.status === "deleted" || p.deleted_at);
  const stats = {
    total: platforms.filter((p) => p.status !== "deleted" && !p.deleted_at).length,
    pending: platforms.filter((p) => p.status === "pending").length,
    active: platforms.filter((p) => p.status === "active" || p.status === "approved").length,
    alerts: platforms.filter((p) => p.status !== "deleted" && !p.deleted_at && hasAlert(p)).length,
    deleted: deletedPlatforms.length,
    losses: deletedPlatforms.reduce((s, p) => s + (p.package_price || 0), 0),
    revenue: platforms
      .filter((p) => (p.status === "active" || p.status === "approved") && p.payment_status === "paid")
      .reduce((s, p) => s + p.package_price, 0),
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RootixLogo size={32} />
            <span className="font-bold">ROOTIX Admin</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mr-2">Live</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 ml-2" />خروج
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* New requests alert banner */}
        {stats.pending > 0 && (
          <button
            onClick={() => setFilter("pending")}
            className="w-full mb-6 rounded-xl border-2 border-primary bg-gradient-to-l from-primary/20 via-primary/10 to-transparent p-4 flex items-center gap-4 hover:from-primary/30 transition-all animate-pulse-glow text-start"
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6 text-primary animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">🔔 عندك {stats.pending} طلب جديد محتاج رد!</div>
              <div className="text-sm text-muted-foreground">دوس هنا تشوف الطلبات الجديدة</div>
            </div>
            <span className="text-2xl font-black text-primary">{stats.pending}</span>
          </button>
        )}

        {/* Hero stats — company-wide */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-primary/5 p-5">
            <div className="text-xs text-muted-foreground mb-1">💰 الإيراد الشهري</div>
            <div className="text-3xl font-black text-primary">{stats.revenue.toLocaleString("ar-EG")}<span className="text-base mr-1">ج</span></div>
            <div className="text-xs text-muted-foreground mt-1">من {stats.active} منصة نشطة</div>
          </div>
          <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/15 to-green-500/5 p-5">
            <div className="text-xs text-muted-foreground mb-1">👥 إجمالي الطلاب</div>
            <div className="text-3xl font-black text-green-500">{globalStats.totalStudents.toLocaleString("ar-EG")}</div>
            <div className="text-xs text-muted-foreground mt-1">+{globalStats.todayStudents} النهارده • +{globalStats.weekStudents} الأسبوع</div>
          </div>
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/15 to-blue-500/5 p-5">
            <div className="text-xs text-muted-foreground mb-1">📚 إجمالي المحتوى</div>
            <div className="text-3xl font-black text-blue-500">{globalStats.totalContent.toLocaleString("ar-EG")}</div>
            <div className="text-xs text-muted-foreground mt-1">فيديو + PDF + امتحانات</div>
          </div>
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 to-purple-500/5 p-5 relative">
            <div className="text-xs text-muted-foreground mb-1">💎 إجمالي الإيرادات (كل الفلوس)</div>
            <div className="text-3xl font-black text-purple-500">{globalStats.lifetimeRevenue.toLocaleString("ar-EG")}<span className="text-base mr-1">ج</span></div>
            <div className="text-xs text-muted-foreground mt-1">من بداية ROOTIX لحد دلوقتي</div>
            <button
              onClick={resetAllRevenue}
              className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
              title="تصفير كل الإيرادات والدفعات"
            >
              🗑️ تصفير
            </button>
          </div>
        </div>

        {/* Health arrow + report */}
        {(() => {
          const activeCount = stats.active || 0;
          const paidCount = platforms.filter(p => (p.status === "active" || p.status === "approved") && p.payment_status === "paid").length;
          const paidRatio = activeCount > 0 ? paidCount / activeCount : 0;
          const isHealthy = paidRatio >= 0.6 && activeCount > 0;
          const HealthIcon = isHealthy ? TrendingUp : TrendingDown;
          const healthColor = isHealthy ? "text-green-500" : "text-destructive";
          const healthBg = isHealthy ? "from-green-500/15 to-green-500/5 border-green-500/40" : "from-destructive/15 to-destructive/5 border-destructive/40";
          const healthLabel = activeCount === 0 ? "ابدأ ضم منصات" : isHealthy ? "الموقع بصحة ممتازة 🚀" : "محتاج انتباه — متابعة الدفعات";
          return (
            <div className={`mb-6 rounded-2xl border-2 bg-gradient-to-l ${healthBg} p-5 flex items-center gap-4 flex-wrap`}>
              <div className={`w-14 h-14 rounded-2xl bg-card flex items-center justify-center ${healthColor}`}>
                <HealthIcon className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="text-xs text-muted-foreground">حالة الموقع</div>
                <div className={`text-xl font-black ${healthColor}`}>{healthLabel}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {paidCount}/{activeCount} منصة نشطة دفعت • نسبة الدفع {Math.round(paidRatio * 100)}%
                </div>
              </div>
              <Button onClick={openCompanyReport} className="bg-primary text-primary-foreground">
                <FileText className="w-4 h-4 ml-1" /> تقرير شامل عن الشركة
              </Button>
            </div>
          );
        })()}

        {/* Operational stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          {[
            { label: "إجمالي المنصات", value: stats.total, icon: Users, color: "text-primary" },
            { label: "طلبات جديدة", value: stats.pending, icon: Calendar, color: "text-yellow-500" },
            { label: "منصات نشطة", value: stats.active, icon: CheckCircle, color: "text-green-500" },
            { label: "تحتاج انتباه", value: stats.alerts, icon: AlertTriangle, color: "text-orange-500" },
            { label: "غير مدفوعة", value: platforms.filter(p => (p.status === "active" || p.status === "approved") && p.payment_status !== "paid").length, icon: AlertTriangle, color: "text-destructive" },
            { label: "خسائر (محذوفة)", value: stats.losses + " ج", icon: AlertTriangle, color: "text-destructive" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                {s.label}
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>


        {/* Top performers */}
        {(() => {
          const topPlatforms = [...platforms]
            .filter(p => p.status !== "deleted" && !p.deleted_at)
            .map(p => ({ ...p, _students: studentCounts[p.id] || 0 }))
            .sort((a, b) => b._students - a._students)
            .slice(0, 5);
          if (topPlatforms.length === 0) return null;
          return (
            <div className="mb-6 rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm">🏆 أعلى 5 منصات بعدد الطلاب</h3>
              </div>
              <div className="space-y-2">
                {topPlatforms.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-500" : i === 1 ? "bg-gray-400/20 text-gray-400" : i === 2 ? "bg-orange-500/20 text-orange-500" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.config?.platform_name || p.teacher_name}</div>
                      <div className="text-xs text-muted-foreground">{p.subject} • {p.teacher_name}</div>
                    </div>
                    <div className="text-sm font-bold">{p._students} طالب</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث باسم المدرس، رقمه، كود المنصة، أو اسم المنصة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
          {[
            { k: "pending", label: "طلبات جديدة", count: stats.pending },
            { k: "approved", label: "نشطة", count: stats.active },
            { k: "alerts", label: "⚠️ انتباه", count: stats.alerts },
            { k: "paused", label: "موقوفة" },
            { k: "all", label: "الكل" },
            { k: "deleted", label: "🗑️ محذوفة", count: stats.deleted },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setFilter(t.k as any)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                filter === t.k ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="mr-2 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Platforms */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-5xl mb-3">📭</div>
            <div>مفيش منصات في القسم ده</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const currentStudents = studentCounts[p.id] || 0;
              const overCapacity = isOverCapacity(p);
              const usagePercent = Math.min(100, Math.round((currentStudents / p.package_students) * 100));

              return (
                <div key={p.id} className={`rounded-xl border bg-card p-5 ${overCapacity ? "border-orange-500/50 bg-orange-500/5" : "border-border"}`}>
                  <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{p.code}</span>
                        <StatusBadge status={p.status} />
                        <span className={`text-xs px-2 py-0.5 rounded ${p.payment_status === "paid" ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                          {p.payment_status === "paid" ? "✓ مدفوع" : "✗ غير مدفوع"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">{p.template_tier}</span>
                        {overCapacity && (
                          <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-500 font-semibold animate-pulse">
                            ⚠️ تجاوز الباقة
                          </span>
                        )}
                        {p.upgrade_request && (
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary font-semibold">
                            📈 طلب ترقية
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{p.config?.platform_name || "منصة " + p.teacher_name}</h3>
                      <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span>👨‍🏫 <strong className="text-foreground">{p.teacher_name}</strong></span>
                        <a href={`tel:${p.teacher_phone}`} className="hover:text-primary">📞 {p.teacher_phone}</a>
                        <a href={`https://wa.me/2${p.teacher_phone?.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-green-500 hover:underline">واتساب</a>
                        <span>📚 {p.subject} - {p.stage}</span>
                        <span className="font-semibold text-foreground">💰 {p.package_price} ج/شهر</span>
                      </div>
                      {/* Dates & Payments summary */}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> أنشئت: {new Date(p.created_at).toLocaleDateString("ar-EG")}</span>
                        {(p as any).approved_at && (
                          <span className="flex items-center gap-1 text-green-500"><CheckCircle className="w-3 h-3" /> مفعّلة: {new Date((p as any).approved_at).toLocaleDateString("ar-EG")}</span>
                        )}
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <DollarSign className="w-3 h-3" />
                          دفع {(paymentsByPlatform[p.id] || []).length} شهر • إجمالي: {((paymentsByPlatform[p.id] || []).reduce((s, x) => s + (x.amount || 0), 0)).toLocaleString("ar-EG")} ج
                        </span>
                        {(p as any).deleted_at && (
                          <span className="flex items-center gap-1 text-destructive">
                            <Trash2 className="w-3 h-3" /> حُذفت: {new Date((p as any).deleted_at).toLocaleDateString("ar-EG")}
                          </span>
                        )}
                      </div>

                      {/* Student usage bar */}
                      <div className="mt-3 max-w-md">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">الطلاب المسجلون</span>
                          <span className={`font-semibold ${overCapacity ? "text-orange-500" : "text-foreground"}`}>
                            {currentStudents} / {p.package_students}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full transition-all ${overCapacity ? "bg-orange-500" : usagePercent > 85 ? "bg-yellow-500" : "bg-primary"}`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>

                      {p.upgrade_request && (
                        <div className="mt-3 p-2 rounded bg-primary/10 border border-primary/30 text-sm">
                          <strong className="text-primary">طلب ترقية:</strong> {p.upgrade_request}
                        </div>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: p.config?.template?.primary_color || p.config?.primary_color || "#888" }} />
                  </div>

                  {/* AI Check result */}
                  {checkResults[p.id] && (
                    <div className={`mb-3 p-3 rounded-lg border text-sm ${checkResults[p.id].ok ? "border-green-500/30 bg-green-500/5" : "border-orange-500/30 bg-orange-500/5"}`}>
                      <div className="font-semibold mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        تقرير ROOTIX AI
                      </div>
                      <div className="text-muted-foreground mb-2">{checkResults[p.id].summary}</div>
                      {checkResults[p.id].fixes_applied?.length > 0 && (
                        <ul className="text-xs space-y-0.5">
                          {checkResults[p.id].fixes_applied.map((f: string, i: number) => (
                            <li key={i} className="text-green-500">✓ {f}</li>
                          ))}
                        </ul>
                      )}
                      {checkResults[p.id].issues?.filter((i: any) => i.severity === "warn").map((iss: any, i: number) => (
                        <div key={i} className="text-xs text-yellow-500 mt-1">⚠️ {iss.msg}</div>
                      ))}
                    </div>
                  )}

                  {/* Auto-check summary stored on platform */}
                  {p.admin_notes && !checkResults[p.id] && (
                    <div className="mb-3 p-2 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground">
                      <Sparkles className="w-3 h-3 inline ml-1 text-primary" />
                      {p.admin_notes}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                    {p.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(p.id, "approved")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <CheckCircle className="w-4 h-4 ml-1" />قبول ونشر
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(p.id, "rejected")}>
                          <XCircle className="w-4 h-4 ml-1" />رفض
                        </Button>
                      </>
                    )}
                    {(p.status === "active" || p.status === "approved") && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => copyLink(p.slug)}>
                          <Copy className="w-4 h-4 ml-1" />نسخ الرابط
                        </Button>
                        <Link to={`/m/${p.slug}`} target="_blank">
                          <Button size="sm" variant="outline"><ExternalLink className="w-4 h-4 ml-1" />فتح المنصة</Button>
                        </Link>
                        <Link to={`/platform-admin/${p.slug}`} target="_blank">
                          <Button size="sm" variant="outline"><Eye className="w-4 h-4 ml-1" />لوحة المدرس</Button>
                        </Link>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, "paused")}>
                          <Pause className="w-4 h-4 ml-1" />إيقاف
                        </Button>
                        <Button size="sm" onClick={() => setPaymentsModalFor(p)} className="bg-green-600 hover:bg-green-700 text-white">
                          <DollarSign className="w-4 h-4 ml-1" />الدفعات الشهرية
                        </Button>
                        <Button size="sm" onClick={() => openStudents(p)} variant="outline" className="border-blue-500/40 text-blue-500 hover:bg-blue-500/10">
                          <Users className="w-4 h-4 ml-1" />عرض الطلاب ({studentCounts[p.id] || 0})
                        </Button>
                      </>
                    )}
                    {p.status === "paused" && (
                      <Button size="sm" onClick={() => updateStatus(p.id, "active")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Play className="w-4 h-4 ml-1" />تشغيل
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runAiCheck(p.id)}
                      disabled={checkingId === p.id}
                      className="border-primary/50 text-primary hover:bg-primary/10"
                    >
                      {checkingId === p.id ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Sparkles className="w-4 h-4 ml-1" />}
                      فحص بـ AI
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => changePackage(p)}>
                      تغيير الباقة
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setWarningModalFor(p)} className={(p as any).admin_warning ? "border-yellow-500 text-yellow-600 bg-yellow-500/10" : "border-yellow-500/40 text-yellow-600"}>
                      <AlertTriangle className="w-4 h-4 ml-1" />{(p as any).admin_warning ? "تعديل التحذير" : "إرسال تحذير"}
                    </Button>
                    {p.dashboard_password && (
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(p.dashboard_password!); toast.success("نسخ كلمة سر المدرس: " + p.dashboard_password); }}>
                        🔑 كلمة السر
                      </Button>
                    )}
                    {(p.status === "deleted" || p.deleted_at) ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => restorePlatform(p.id)}>↩️ استرجاع</Button>
                        <Button size="sm" variant="ghost" onClick={() => purgePlatform(p.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4" /> نهائي
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => deletePlatform(p.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {paymentsModalFor && (
        <PaymentsModal
          platform={paymentsModalFor}
          payments={paymentsByPlatform[paymentsModalFor.id] || []}
          onClose={() => setPaymentsModalFor(null)}
          onChange={loadStudentCounts}
        />
      )}

      {studentsModalFor && (
        <StudentsListModal
          platform={studentsModalFor}
          students={studentsModalData}
          onClose={() => { setStudentsModalFor(null); setStudentsModalData([]); }}
        />
      )}

      {companyReportOpen && (
        <CompanyReportModal
          platforms={platforms}
          studentCounts={studentCounts}
          paymentsByPlatform={paymentsByPlatform}
          stats={stats}
          globalStats={globalStats}
          onClose={() => setCompanyReportOpen(false)}
        />
      )}
      {warningModalFor && (
        <WarningModal
          platform={warningModalFor}
          onClose={() => setWarningModalFor(null)}
          onSave={saveWarning}
        />
      )}
    </div>
  );
}

function WarningModal({ platform, onClose, onSave }: { platform: any; onClose: () => void; onSave: (id: string, msg: string) => void }) {
  const [msg, setMsg] = useState(platform.admin_warning || "");
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border-2 border-yellow-500/50 rounded-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="border-b border-border p-5 flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" /> إرسال تحذير لـ {platform.teacher_name}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-muted-foreground">هتظهر في لوحة المدرس بس (مش هتظهر للطلاب) كبانر أصفر بارز.</p>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="اكتب رسالتك للمدرس... مثال: برجاء سداد رسوم الشهر الجاي قبل يوم 10."
            className="w-full min-h-[140px] rounded-lg border border-input bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          />
          <div className="flex gap-2">
            <Button onClick={() => onSave(platform.id, msg)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white">
              {msg.trim() ? "إرسال التحذير" : "مسح التحذير الحالي"}
            </Button>
            {platform.admin_warning && (
              <Button variant="outline" onClick={() => onSave(platform.id, "")}>إلغاء التحذير</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "معلق", cls: "bg-yellow-500/10 text-yellow-400" },
    approved: { label: "نشط", cls: "bg-green-500/10 text-green-500" },
    active: { label: "نشط", cls: "bg-green-500/10 text-green-500" },
    paused: { label: "موقوف", cls: "bg-orange-500/10 text-orange-400" },
    rejected: { label: "مرفوض", cls: "bg-destructive/10 text-destructive" },
  };
  const v = map[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return <span className={`text-xs px-2 py-0.5 rounded ${v.cls}`}>{v.label}</span>;
}

function PaymentsModal({ platform, payments, onClose, onChange }: { platform: Platform; payments: any[]; onClose: () => void; onChange: () => void }) {
  const [amount, setAmount] = useState(platform.package_price);
  const [monthLabel, setMonthLabel] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const total = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const monthsPaid = payments.length;

  const addPayment = async () => {
    if (!amount || amount <= 0) return toast.error("ادخل مبلغ صح");
    setBusy(true);
    const { error } = await supabase.from("platform_payments").insert({
      platform_id: platform.id,
      amount,
      month_label: monthLabel,
      notes: notes.trim() || null,
    });
    if (!error) {
      // Also update payment_status to "paid" for backward compat
      await supabase.from("platforms").update({ payment_status: "paid" }).eq("id", platform.id);
      toast.success("✅ تم تسجيل الدفعة");
      setNotes("");
      onChange();
    } else {
      toast.error(error.message);
    }
    setBusy(false);
  };

  const removePayment = async (id: string) => {
    if (!confirm("احذف الدفعة دي؟")) return;
    await supabase.from("platform_payments").delete().eq("id", id);
    toast.success("اتمسحت");
    onChange();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" />دفعات {platform.config?.platform_name || platform.teacher_name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">دفع {monthsPaid} شهر • إجمالي {total.toLocaleString("ar-EG")} ج</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="font-bold text-sm">➕ سجل دفعة شهر جديد</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">المبلغ (ج)</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">الشهر (مثلاً 2026-05)</label>
                <Input value={monthLabel} onChange={(e) => setMonthLabel(e.target.value)} />
              </div>
            </div>
            <Input placeholder="ملاحظات (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button onClick={addPayment} disabled={busy} className="w-full bg-green-600 hover:bg-green-700 text-white">
              {busy ? "جاري الحفظ..." : `✓ سجل ${amount} ج عن شهر ${monthLabel}`}
            </Button>
          </div>

          <div>
            <div className="font-bold text-sm mb-2 flex items-center gap-2"><Clock className="w-4 h-4" />سجل الدفعات ({payments.length})</div>
            {payments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">مفيش دفعات لسه — سجل أول شهر فوق</div>
            ) : (
              <div className="space-y-2">
                {[...payments].sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()).map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                    <div>
                      <div className="font-semibold text-sm">{p.amount.toLocaleString("ar-EG")} ج • شهر {p.month_label || "—"}</div>
                      <div className="text-xs text-muted-foreground">{new Date(p.paid_at).toLocaleString("ar-EG")} {p.notes ? `• ${p.notes}` : ""}</div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removePayment(p.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentsListModal({ platform, students, onClose }: { platform: Platform; students: any[]; onClose: () => void }) {
  const copyAll = () => {
    const txt = students.map((s, i) => `${i + 1}. ${s.full_name} | ${s.phone} | كود: ${s.access_code} | ${s.grade_level}`).join("\n");
    navigator.clipboard.writeText(txt);
    toast.success("تم نسخ بيانات الطلاب");
  };
  const downloadCsv = () => {
    const header = "#,Name,Phone,Code,Grade,Joined\n";
    const rows = students.map((s, i) =>
      `${i + 1},"${(s.full_name || "").replace(/"/g, "'")}","${s.phone}","${s.access_code}","${s.grade_level}","${new Date(s.created_at).toISOString().slice(0, 10)}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `students-${platform.slug}.csv`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> طلاب {platform.config?.platform_name || platform.teacher_name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{students.length} طالب مسجل</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copyAll}><Copy className="w-3.5 h-3.5 ml-1" />نسخ</Button>
            <Button size="sm" variant="outline" onClick={downloadCsv}><Download className="w-3.5 h-3.5 ml-1" />CSV</Button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-5">
          {students.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">مفيش طلاب لسه</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-start p-2">#</th>
                    <th className="text-start p-2">الاسم</th>
                    <th className="text-start p-2">التليفون</th>
                    <th className="text-start p-2">الكود</th>
                    <th className="text-start p-2">الصف</th>
                    <th className="text-start p-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-2 text-muted-foreground">{i + 1}</td>
                      <td className="p-2 font-medium">{s.full_name}</td>
                      <td className="p-2 font-mono text-xs">{s.phone}</td>
                      <td className="p-2 font-mono text-xs text-primary">{s.access_code}</td>
                      <td className="p-2">{s.grade_level}</td>
                      <td className="p-2 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString("ar-EG")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompanyReportModal({ platforms, studentCounts, paymentsByPlatform, stats, globalStats, onClose }: any) {
  const totalPlatforms = platforms.filter((p: any) => !p.deleted_at).length;
  const activePlatforms = platforms.filter((p: any) => (p.status === "active" || p.status === "approved") && !p.deleted_at).length;
  const paidPlatforms = platforms.filter((p: any) => p.payment_status === "paid" && !p.deleted_at).length;
  const unpaidActive = platforms.filter((p: any) => (p.status === "active" || p.status === "approved") && p.payment_status !== "paid" && !p.deleted_at).length;
  const pendingCount = platforms.filter((p: any) => p.status === "pending").length;
  const pausedCount = platforms.filter((p: any) => p.status === "paused").length;
  const deletedCount = platforms.filter((p: any) => p.deleted_at || p.status === "deleted").length;
  const proCount = platforms.filter((p: any) => p.template_tier === "pro" && !p.deleted_at).length;
  const normalCount = platforms.filter((p: any) => p.template_tier !== "pro" && !p.deleted_at).length;

  // Subjects breakdown
  const subjectsMap: Record<string, number> = {};
  platforms.filter((p: any) => !p.deleted_at).forEach((p: any) => {
    const s = p.subject || "غير محدد";
    subjectsMap[s] = (subjectsMap[s] || 0) + 1;
  });
  const subjects = Object.entries(subjectsMap).sort((a, b) => b[1] - a[1]);

  // Top revenue platforms
  const topRevenue = platforms
    .filter((p: any) => !p.deleted_at)
    .map((p: any) => ({
      ...p,
      _rev: (paymentsByPlatform[p.id] || []).reduce((s: number, x: any) => s + (x.amount || 0), 0),
      _months: (paymentsByPlatform[p.id] || []).length,
      _students: studentCounts[p.id] || 0,
    }))
    .sort((a: any, b: any) => b._rev - a._rev)
    .slice(0, 10);

  const paidRatio = activePlatforms > 0 ? Math.round((paidPlatforms / activePlatforms) * 100) : 0;
  const avgRevenuePerPlatform = activePlatforms > 0 ? Math.round(globalStats.lifetimeRevenue / activePlatforms) : 0;
  const avgStudentsPerPlatform = activePlatforms > 0 ? Math.round(globalStats.totalStudents / activePlatforms) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-auto" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
          <div>
            <h2 className="font-black text-2xl flex items-center gap-2">📊 تقرير شامل عن ROOTIX</h2>
            <p className="text-xs text-muted-foreground mt-1">آخر تحديث: {new Date().toLocaleString("ar-EG")}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Hero KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard color="primary" label="إجمالي الإيراد" value={`${globalStats.lifetimeRevenue.toLocaleString("ar-EG")} ج`} sub={`من بداية ROOTIX`} />
            <KpiCard color="green" label="الإيراد الشهري الحالي" value={`${stats.revenue.toLocaleString("ar-EG")} ج`} sub={`من ${paidPlatforms} منصة دفعت`} />
            <KpiCard color="blue" label="إجمالي الطلاب" value={globalStats.totalStudents.toLocaleString("ar-EG")} sub={`+${globalStats.todayStudents} النهاردة`} />
            <KpiCard color="purple" label="منصات نشطة" value={`${activePlatforms}`} sub={`من إجمالي ${totalPlatforms}`} />
          </div>

          {/* Platforms breakdown */}
          <div className="rounded-2xl border border-border bg-muted/20 p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">🏗️ تفاصيل المنصات</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Stat label="إجمالي المنصات" v={totalPlatforms} />
              <Stat label="نشطة وشغالة" v={activePlatforms} green />
              <Stat label="طلبات معلقة" v={pendingCount} yellow />
              <Stat label="موقوفة" v={pausedCount} />
              <Stat label="محذوفة/مؤرشفة" v={deletedCount} red />
              <Stat label="باقة Pro" v={proCount} />
              <Stat label="باقة عادية" v={normalCount} />
              <Stat label="غير مدفوعة الآن" v={unpaidActive} red />
            </div>
          </div>

          {/* Financials */}
          <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">💰 التفاصيل المالية</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <Stat label="إجمالي الإيرادات (Lifetime)" v={`${globalStats.lifetimeRevenue.toLocaleString("ar-EG")} ج`} />
              <Stat label="الإيراد الشهري المتوقع" v={`${stats.revenue.toLocaleString("ar-EG")} ج`} green />
              <Stat label="الخسائر (محذوفة)" v={`${stats.losses.toLocaleString("ar-EG")} ج`} red />
              <Stat label="نسبة الدفع" v={`${paidRatio}%`} />
              <Stat label="متوسط إيراد المنصة" v={`${avgRevenuePerPlatform.toLocaleString("ar-EG")} ج`} />
              <Stat label="متوسط الطلاب لكل منصة" v={`${avgStudentsPerPlatform}`} />
            </div>
          </div>

          {/* Content */}
          <div className="rounded-2xl border border-border bg-muted/20 p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">📚 المحتوى والتفاعل</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Stat label="إجمالي المحتوى" v={globalStats.totalContent} />
              <Stat label="إجمالي الامتحانات المحلولة" v={globalStats.totalExams} />
              <Stat label="متوسط درجة الامتحان" v={`${globalStats.avgScore}%`} green />
              <Stat label="طلاب جدد الأسبوع" v={globalStats.weekStudents} />
            </div>
          </div>

          {/* Subjects */}
          {subjects.length > 0 && (
            <div className="rounded-2xl border border-border bg-muted/20 p-5">
              <h3 className="font-bold text-lg mb-4">📖 المنصات حسب المادة</h3>
              <div className="flex flex-wrap gap-2">
                {subjects.map(([s, n]) => (
                  <span key={s} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">{s} <span className="text-xs opacity-70">({n})</span></span>
                ))}
              </div>
            </div>
          )}

          {/* Top revenue */}
          {topRevenue.length > 0 && (
            <div className="rounded-2xl border border-border bg-muted/20 p-5">
              <h3 className="font-bold text-lg mb-4">🏆 أعلى المنصات بالإيراد</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground border-b border-border">
                    <tr><th className="text-start p-2">#</th><th className="text-start p-2">المنصة</th><th className="text-start p-2">المدرس</th><th className="text-start p-2">الطلاب</th><th className="text-start p-2">عدد الشهور</th><th className="text-start p-2">الإيراد</th></tr>
                  </thead>
                  <tbody>
                    {topRevenue.map((p: any, i: number) => (
                      <tr key={p.id} className="border-b border-border/40">
                        <td className="p-2 text-muted-foreground">{i + 1}</td>
                        <td className="p-2 font-medium">{p.config?.platform_name || "—"}</td>
                        <td className="p-2">{p.teacher_name}</td>
                        <td className="p-2">{p._students}</td>
                        <td className="p-2">{p._months}</td>
                        <td className="p-2 font-bold text-green-500">{p._rev.toLocaleString("ar-EG")} ج</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ color, label, value, sub }: any) {
  const colors: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 border-primary/30 text-primary",
    green: "from-green-500/15 to-green-500/5 border-green-500/30 text-green-500",
    blue: "from-blue-500/15 to-blue-500/5 border-blue-500/30 text-blue-500",
    purple: "from-purple-500/15 to-purple-500/5 border-purple-500/30 text-purple-500",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${colors[color]}`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function Stat({ label, v, green, red, yellow }: any) {
  const cls = green ? "text-green-500" : red ? "text-destructive" : yellow ? "text-yellow-500" : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-xl font-bold ${cls}`}>{v}</div>
    </div>
  );
}
