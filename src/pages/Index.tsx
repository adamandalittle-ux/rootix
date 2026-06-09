import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Shield, Users, ArrowLeft, Check, Star } from "lucide-react";
import { RootixLogo } from "@/components/RootixLogo";
// Star kept for features grid below

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <RootixLogo size={36} />
            <span className="font-bold text-lg tracking-tight">ROOTIX</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/builder">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                ابدأ الآن
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="container mx-auto px-6 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">أول منصة AI لبناء منصات المدرسين في مصر</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              ابني منصتك التعليمية
              <br />
              <span className="text-gradient">بـ AI في دقائق</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              اتكلم مع الذكاء الاصطناعي، قوله إنت عايز إيه، وهو يبنيلك منصة كاملة لطلابك.
              بدل ما تدفع 50,000 جنيه لشركة برمجة، ادفع باقة شهرية تبدأ من <span className="text-foreground font-semibold">500 جنيه</span>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/builder">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-8 group">
                  ابني منصتك دلوقتي
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:translate-x-[-4px] transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-12 px-8 border-border">
                شوف العرض التوضيحي
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> تفعيل خلال 24 ساعة</div>
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> بدون برمجة</div>
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> حماية متقدمة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Sparkles,
              title: "AI ذكي يبني منصتك",
              desc: "اتكلم مع المساعد الذكي وهو يسألك كل التفاصيل اللي محتاجها، ويبنيلك منصة بمواصفاتك.",
            },
            {
              icon: Zap,
              title: "تفعيل في 24 ساعة",
              desc: "بمجرد موافقتك ودفع الباقة، منصتك تتنشر على رابط خاص بيك جاهزة للطلاب.",
            },
            {
              icon: Shield,
              title: "حماية بعلامة مائية",
              desc: "كل فيديو بيظهر فيه اسم ورقم الطالب بشكل متحرك لمنع التسريب 100%.",
            },
            {
              icon: Users,
              title: "باقات من 50 لـ 1200 طالب",
              desc: "اختار الباقة اللي تناسبك وزوّد أو قلّل عدد الطلاب في أي وقت.",
            },
            {
              icon: Star,
              title: "تيمبلات عادي و PRO",
              desc: "اختار من تصميمات عادية أو PRO فيها صوت وأنيميشن متقدم وخانة ملخص بـ AI.",
            },
            {
              icon: Check,
              title: "تحكم كامل من لوحتك",
              desc: "ترفع فيديوهات، PDF، أسئلة، امتحانات، وتتحكم في الطلاب كلهم من مكان واحد.",
            },
          ].map((f, i) => (
            <div key={i} className="group relative rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview removed — pricing shown only after AI builds the platform */}

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="relative rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">جاهز تبني منصتك؟</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              اتكلم مع ROOTIX AI دلوقتي وخلي منصتك جاهزة في أقل من 10 دقائق
            </p>
            <Link to="/builder">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-8 pulse-glow">
                ابدأ البناء مجاناً
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ROOTIX — حلول ذكية للتعليم الإلكتروني في مصر
      </footer>
    </div>
  );
};

export default Index;
