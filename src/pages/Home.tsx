import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RootixLogo } from "@/components/RootixLogo";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Wrench, ArrowLeft, LogOut } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const go = (target: string) => {
    if (!authed) navigate("/auth?next=" + encodeURIComponent(target));
    else navigate(target);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <RootixLogo size={36} />
            <span className="font-bold text-lg tracking-tight">ROOTIX</span>
          </Link>
          <div className="flex items-center gap-3">
            {authed ? (
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="w-4 h-4" /> خروج
              </Button>
            ) : (
              <Link to="/auth">
                <Button size="sm" variant="outline">تسجيل الدخول</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(closest-side, hsl(142 76% 55% / 0.4), transparent)" }}
        />
        <div className="container mx-auto px-6 py-20 md:py-28 relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">اختار اللي محتاجه</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              أهلاً بيك في <span className="text-gradient">ROOTIX</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              عندنا حاجتين: تبني منصتك التعليمية، أو تستفيد من خدماتنا
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <button
              onClick={() => go("/builder")}
              className="group relative text-right rounded-3xl border border-border bg-card p-10 hover:border-primary/60 transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_hsl(142_76%_55%/0.5)] overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "radial-gradient(ellipse at top right, hsl(142 76% 55% / 0.15), transparent 70%)" }} />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-3">بناء المنصات</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  اتكلم مع AI وابني منصتك التعليمية كاملة بالفيديوهات والامتحانات والطلاب في دقائق
                </p>
                <div className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                  ابدأ البناء <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </button>

            <button
              onClick={() => go("/services")}
              className="group relative text-right rounded-3xl border border-border bg-card p-10 hover:border-[hsl(28_92%_60%)]/60 transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_hsl(28_92%_60%/0.5)] overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "radial-gradient(ellipse at top right, hsl(28 92% 60% / 0.15), transparent 70%)" }} />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border"
                  style={{ background: "hsl(28 92% 60% / 0.1)", borderColor: "hsl(28 92% 60% / 0.3)" }}>
                  <Wrench className="w-8 h-8" style={{ color: "hsl(28 92% 60%)" }} />
                </div>
                <h2 className="text-3xl font-bold mb-3">الخدمات</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  بناء سيستمات (كاشير، بلاي ستيشن، مطعم...) ومونتاج فيديوهات تعليمية أو تصميم
                </p>
                <div className="inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all"
                  style={{ color: "hsl(28 92% 60%)" }}>
                  استكشف الخدمات <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ROOTIX
      </footer>
    </div>
  );
}
