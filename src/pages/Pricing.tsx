import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, ArrowLeft, Loader2, Sparkles, Crown, Phone, MessageCircle } from "lucide-react";
import { PACKAGES } from "@/lib/pricing";
import { RootixLogo } from "@/components/RootixLogo";

export default function Pricing() {
  const [params] = useSearchParams();
  const platformCode = params.get("code");
  const navigate = useNavigate();

  const [platform, setPlatform] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [tier, setTier] = useState<"normal" | "pro">("normal");
  const [teacherName, setTeacherName] = useState("");
  const [teacherPhone, setTeacherPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!platformCode) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("platforms")
        .select("*")
        .eq("code", platformCode)
        .maybeSingle();
      if (data) {
        setPlatform(data);
        setTeacherName(data.teacher_name || "");
        setTeacherPhone(data.teacher_phone || "");
        setSelected(data.package_students);
        setTier((data.template_tier as any) || "normal");
      }
      setLoading(false);
    })();
  }, [platformCode]);

  const submit = async () => {
    if (!selected) return toast.error("اختار باقة الأول");
    if (!teacherName.trim() || !teacherPhone.trim())
      return toast.error("اكتب اسمك ورقم هاتفك");

    setSubmitting(true);
    try {
      const pkg = PACKAGES.find((p) => p.students === selected)!;
      const finalPrice = tier === "pro" ? Math.round(pkg.price * 1.15) : pkg.price;

      if (platform) {
        // Update existing platform
        const { error } = await supabase
          .from("platforms")
          .update({
            teacher_name: teacherName,
            teacher_phone: teacherPhone,
            requested_students: selected,
            requested_tier: tier,
            package_students: selected,
            package_price: finalPrice,
            template_tier: tier,
            status: "pending",
          })
          .eq("id", platform.id);
        if (error) throw error;
        toast.success("تم إرسال طلب الباقة للأدمن! هنتواصل معاك قريب 🎉");
        setTimeout(() => navigate(`/success?code=${platform.code}&slug=${platform.slug}`), 1200);
      } else {
        // Standalone package request (no platform yet)
        toast.info("من فضلك ابني منصتك أولاً من صفحة البناء");
        setTimeout(() => navigate("/builder"), 1500);
      }
    } catch (e: any) {
      toast.error("خطأ: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">العودة</span>
          </Link>
          <div className="flex items-center gap-2">
            <RootixLogo size={32} />
            <span className="font-bold">باقات ROOTIX</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium">
              {platform ? `باقة منصة ${platform.config?.platform_name || platform.teacher_name}` : "اختار باقتك"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            اختار الباقة اللي <span className="text-gradient">تناسب طلابك</span>
          </h1>
          <p className="text-muted-foreground">
            ادفع شهرياً بس، ترقى أو قلل في أي وقت بضغطة زر — بدون تواصل يدوي
          </p>
        </div>

        {/* Tier switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setTier("normal")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                tier === "normal" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              عادي
            </button>
            <button
              onClick={() => setTier("pro")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition flex items-center gap-1.5 ${
                tier === "pro" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              PRO (+15%)
            </button>
          </div>
        </div>

        {/* Packages grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-w-6xl mx-auto mb-10">
          {PACKAGES.map((p) => {
            const price = tier === "pro" ? Math.round(p.price * 1.15) : p.price;
            const isSelected = selected === p.students;
            return (
              <button
                key={p.students}
                onClick={() => setSelected(p.students)}
                className={`relative text-right rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30 scale-[1.02]"
                    : p.highlight
                    ? "border-primary/40 bg-card hover:border-primary"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {p.label && (
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {p.label}
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <div className="text-2xl font-bold">
                  {p.students === 1501 ? "+1500" : p.students}
                  <span className="text-xs font-normal text-muted-foreground mr-1">طالب</span>
                </div>
                <div className="text-lg font-bold text-primary mt-1">{price} ج</div>
                <div className="text-[10px] text-muted-foreground">شهرياً</div>
                {p.note && <div className="text-[10px] text-yellow-500 mt-1 font-semibold">⚡ {p.note}</div>}
              </button>
            );
          })}
        </div>

        {/* Contact form */}
        <div className="max-w-xl mx-auto rounded-2xl border border-border bg-card p-6 md:p-8">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            بياناتك للتواصل
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            بعد ما تأكد الباقة، الأدمن هيكلمك علطول ليأخد الفلوس وينشر المنصة
          </p>

          <div className="space-y-4">
            <div>
              <Label className="text-xs">اسم المدرس</Label>
              <Input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="مستر أحمد محمد" />
            </div>
            <div>
              <Label className="text-xs">رقم الهاتف (واتساب يُفضّل)</Label>
              <Input value={teacherPhone} onChange={(e) => setTeacherPhone(e.target.value)} placeholder="01xxxxxxxxx" type="tel" />
            </div>

            {selected && (
              <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">الباقة:</span><span className="font-semibold">{selected === 1501 ? "+1500" : selected} طالب</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">النوع:</span><span className="font-semibold">{tier === "pro" ? "PRO ⭐" : "عادي"}</span></div>
                <div className="flex justify-between text-lg pt-2 border-t border-border"><span>الإجمالي:</span><span className="font-bold text-primary">{tier === "pro" ? Math.round(PACKAGES.find(p=>p.students===selected)!.price*1.15) : PACKAGES.find(p=>p.students===selected)!.price} ج / شهر</span></div>
              </div>
            )}

            <Button onClick={submit} disabled={submitting || !selected} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <MessageCircle className="w-4 h-4 ml-2" />
                  تأكيد الباقة وإرسال للأدمن
                </>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              هتقدر تغير الباقة (ترقية/تقليل) في أي وقت من لوحة المدرس
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
