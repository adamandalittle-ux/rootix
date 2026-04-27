import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function Success() {
  const [params] = useSearchParams();
  const code = params.get("code") || "";
  const slug = params.get("slug") || "";

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-2xl border border-primary/30 bg-card p-8 text-center fade-in-up">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-3">تم إرسال طلبك بنجاح!</h1>
        <p className="text-muted-foreground mb-6">
          وصل طلبك للأدمن. الفريق هيتواصل معاك خلال 24 ساعة على الرقم اللي كتبته علشان يتفق معاك على الدفع.
        </p>

        <div className="space-y-3 text-start mb-6">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="text-xs text-muted-foreground mb-1">كود منصتك</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-mono font-bold text-primary">{code}</div>
              <Button variant="ghost" size="icon" onClick={() => copy(code)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="text-xs text-muted-foreground mb-1">رابط منصتك (بعد الموافقة)</div>
            <div className="text-sm font-mono break-all">/m/{slug}</div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-6">
          💡 يفضل تصور الشاشة دي واحتفظ بالكود
        </div>

        <Link to="/">
          <Button variant="outline" className="w-full">العودة للرئيسية</Button>
        </Link>
      </div>
    </div>
  );
}
