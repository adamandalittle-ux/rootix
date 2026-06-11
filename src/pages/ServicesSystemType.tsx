import { Link, useNavigate, useParams } from "react-router-dom";
import { RootixLogo } from "@/components/RootixLogo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Hourglass } from "lucide-react";

const LABELS: Record<string, string> = {
  cashier: "سيستم كاشير",
  playstation: "سيستم بلاي ستيشن",
  restaurant: "سيستم مطعم",
  custom: "سيستم خاص",
};

export default function ServicesSystemType() {
  const { type } = useParams();
  const navigate = useNavigate();
  const label = LABELS[type || ""] || "السيستم";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <RootixLogo size={36} />
            <span className="font-bold text-lg tracking-tight">ROOTIX</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigate("/services/systems")} className="gap-2">
            <ArrowRight className="w-4 h-4" /> رجوع
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-24 max-w-2xl text-center">
        <div className="inline-flex w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 items-center justify-center mb-6">
          <Hourglass className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-3">{label}</h1>
        <h2 className="text-2xl text-primary mb-4">قريباً</h2>
        <p className="text-muted-foreground leading-relaxed">
          بنشتغل دلوقتي على تجهيز مجموعة كبيرة من سيستمات {label} الجاهزة بأسعار وخدمات مختلفة.
          ترقب الإطلاق قريب.
        </p>
      </div>
    </div>
  );
}
