import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RootixLogo } from "@/components/RootixLogo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(next, { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate(next, { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, next]);

  const signIn = async () => {
    setLoading(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth?next=" + encodeURIComponent(next),
      });
      if (res.error) {
        toast.error("فشل تسجيل الدخول");
        setLoading(false);
      }
    } catch {
      toast.error("حصلت مشكلة");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(closest-side, hsl(142 76% 55% / 0.5), transparent)" }}
      />
      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-10 shadow-2xl text-center">
          <div className="flex justify-center mb-6">
            <RootixLogo size={72} />
          </div>
          <h1 className="text-3xl font-bold mb-2">أهلاً في ROOTIX</h1>
          <p className="text-sm text-muted-foreground mb-8">
            سجّل دخولك بحساب جوجل علشان تكمل
          </p>
          <Button
            onClick={signIn}
            disabled={loading}
            size="lg"
            className="w-full h-12 bg-white text-black hover:bg-white/90 font-semibold gap-3"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3c-2 1.5-4.6 2.4-7.5 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.5 5.3C40.4 36.4 44 30.7 44 24c0-1.2-.1-2.3-.4-3.5z" />
              </svg>
            )}
            الدخول بحساب جوجل
          </Button>
          <p className="text-xs text-muted-foreground mt-6">
            بتسجيل الدخول، أنت بتوافق على شروط الاستخدام
          </p>
        </div>
      </div>
    </div>
  );
}
