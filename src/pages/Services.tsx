import { Link, useNavigate } from "react-router-dom";
import { RootixLogo } from "@/components/RootixLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Cpu, Video } from "lucide-react";

export default function Services() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <RootixLogo size={36} />
            <span className="font-bold text-lg tracking-tight">ROOTIX</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
            <ArrowRight className="w-4 h-4" /> الرئيسية
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center">الخدمات</h1>
        <p className="text-muted-foreground text-center mb-12">اختار الخدمة اللي محتاجها</p>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate("/services/systems")}
            className="group text-right rounded-3xl border border-border bg-card p-10 hover:border-primary/60 transition-all hover:-translate-y-1"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6">
              <Cpu className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">بناء سيستم</h2>
            <p className="text-muted-foreground mb-4">سيستمات كاشير، بلاي ستيشن، مطاعم، أو سيستم خاص بيك</p>
            <div className="inline-flex items-center gap-2 text-primary font-semibold">
              اختار النوع <ArrowLeft className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => navigate("/services/video")}
            className="group text-right rounded-3xl border border-border bg-card p-10 hover:border-[hsl(280_80%_65%)]/60 transition-all hover:-translate-y-1"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border"
              style={{ background: "hsl(280 80% 65% / 0.1)", borderColor: "hsl(280 80% 65% / 0.3)" }}>
              <Video className="w-8 h-8" style={{ color: "hsl(280 80% 65%)" }} />
            </div>
            <h2 className="text-2xl font-bold mb-2">مونتاج فيديو</h2>
            <p className="text-muted-foreground mb-4">مونتاج تعليمي أو تصميم (ريلز / شورت / يوتيوب) بأسعار حسب المدة</p>
            <div className="inline-flex items-center gap-2 font-semibold" style={{ color: "hsl(280 80% 65%)" }}>
              احسب السعر <ArrowLeft className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
