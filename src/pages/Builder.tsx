import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

interface PlatformConfig {
  teacher_name: string;
  teacher_phone: string;
  subject: string;
  stage: string;
  grade_levels: string[];
  platform_name: string;
  logo_text: string;
  mood: string;
  primary_color: string;
  accent_color: string;
  button_shape: string;
  sounds_enabled: boolean;
  animation_level: string;
  ai_summary_enabled: boolean;
  welcome_message: string;
  codes_count: number;
  videos_label: string;
  exams_label: string;
  template_tier: "normal" | "pro";
  package_students: number;
  package_price: number;
}

function parseSuggestions(text: string): { clean: string; suggestions: string[] } {
  const match = text.match(/SUGGESTIONS:\s*(\[[\s\S]*?\])/);
  if (!match) return { clean: text, suggestions: [] };
  try {
    const suggestions = JSON.parse(match[1]);
    const clean = text.replace(match[0], "").trim();
    return { clean, suggestions: Array.isArray(suggestions) ? suggestions : [] };
  } catch {
    return { clean: text, suggestions: [] };
  }
}

// Tool-call accumulator for streamed function arguments
function accumulateToolCall(delta: any, acc: { name?: string; args: string }) {
  const tc = delta?.tool_calls?.[0];
  if (!tc) return;
  if (tc.function?.name) acc.name = tc.function.name;
  if (tc.function?.arguments) acc.args += tc.function.arguments;
}

function tryParseToolConfig(acc: { name?: string; args: string }): PlatformConfig | null {
  if (acc.name !== "save_platform_config" || !acc.args) return null;
  try {
    return JSON.parse(acc.args) as PlatformConfig;
  } catch {
    return null;
  }
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) + "-" + Math.random().toString(36).slice(2, 6)
  );
}

function genCode(): string {
  return "R-" + Math.floor(1000 + Math.random() * 9000);
}

export default function Builder() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "أهلاً بيك في ROOTIX! 👋 أنا هبنيلك منصتك التعليمية خطوة بخطوة. هسألك 20 سؤال بسيط علشان أفهم كل حاجة عايزها.\n\nنبدأ؟ اكتب 'ابدأ' أو قولي اسمك كمدرس مباشرة.\n\nSUGGESTIONS: [\"ابدأ\",\"مستر أحمد أحمد\",\"ميس سارة محمد\"]",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finalConfig, setFinalConfig] = useState<PlatformConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: Msg = { role: "user", content: trimmed };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    // Stream assistant response + tool call
    let assistantSoFar = "";
    const toolAcc = { name: undefined as string | undefined, args: "" };
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rootix-ai`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newHistory }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("تم تجاوز الحد المسموح، حاول بعد قليل");
        else if (resp.status === 402) toast.error("الرصيد نفد");
        else toast.error("حصل خطأ، حاول تاني");
        setMessages(newHistory);
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, idx);
          textBuffer = textBuffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            const content = delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantSoFar };
                return copy;
              });
            }
            accumulateToolCall(delta, toolAcc);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Check if AI called the save_platform_config tool
      const cfg = tryParseToolConfig(toolAcc);
      if (cfg) {
        setFinalConfig(cfg);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "✅ تمام! جهزت كل تفاصيل منصتك. راجع الملخص تحت واضغط تأكيد.",
          };
          return copy;
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("حصل خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const submitPlatform = async () => {
    if (!finalConfig) return;
    setSubmitting(true);
    try {
      const code = genCode();
      const slug = slugify(finalConfig.platform_name || finalConfig.teacher_name);
      const { error } = await supabase.from("platforms").insert({
        code,
        slug,
        teacher_name: finalConfig.teacher_name,
        teacher_phone: finalConfig.teacher_phone,
        subject: finalConfig.subject,
        stage: finalConfig.stage,
        grade_levels: finalConfig.grade_levels,
        template_tier: finalConfig.template_tier,
        package_students: finalConfig.package_students,
        package_price: finalConfig.package_price,
        config: finalConfig as any,
        status: "pending",
      });
      if (error) throw error;
      toast.success("تم إرسال طلبك! الكود: " + code);
      setTimeout(() => navigate("/success?code=" + code + "&slug=" + slug), 1500);
    } catch (e: any) {
      console.error(e);
      toast.error("فشل الإرسال: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const { clean, suggestions } = lastAssistant ? parseSuggestions(lastAssistant.content) : { clean: "", suggestions: [] };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">العودة</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center font-bold text-primary-foreground text-xs">R</div>
            <span className="font-semibold text-sm">ROOTIX AI Builder</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 container max-w-3xl mx-auto px-4 py-6 flex flex-col">
        {/* Messages */}
        <div className="flex-1 space-y-4 pb-6">
          {messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const { clean: cleanText } = parseSuggestions(m.content);
            const doneCfg = m.role === "assistant" ? parseDoneConfig(m.content) : null;
            const displayContent = doneCfg ? "✅ تم تجهيز منصتك! راجع التفاصيل تحت واضغط تأكيد الطلب." : cleanText;

            return (
              <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"} fade-in-up`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-primary font-semibold">
                      <Sparkles className="w-3 h-3" />
                      ROOTIX AI
                    </div>
                  )}
                  {displayContent || (isLast && loading && <Loader2 className="w-4 h-4 animate-spin" />)}
                </div>
              </div>
            );
          })}
          {loading && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-end">
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Final config summary */}
        {finalConfig && (
          <div className="mb-4 rounded-xl border border-primary/50 bg-primary/5 p-5 fade-in-up">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              ملخص منصتك
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div><span className="text-muted-foreground">الاسم:</span> {finalConfig.platform_name}</div>
              <div><span className="text-muted-foreground">المدرس:</span> {finalConfig.teacher_name}</div>
              <div><span className="text-muted-foreground">المادة:</span> {finalConfig.subject}</div>
              <div><span className="text-muted-foreground">المرحلة:</span> {finalConfig.stage}</div>
              <div><span className="text-muted-foreground">الباقة:</span> {finalConfig.package_students} طالب</div>
              <div><span className="text-muted-foreground">السعر:</span> {finalConfig.package_price} ج / شهر</div>
              <div><span className="text-muted-foreground">النوع:</span> {finalConfig.template_tier.toUpperCase()}</div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">اللون:</span>
                <span className="w-4 h-4 rounded" style={{ backgroundColor: finalConfig.primary_color }} />
                {finalConfig.primary_color}
              </div>
            </div>
            <Button onClick={submitPlatform} disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "تأكيد الطلب وإرسال للأدمن"}
            </Button>
          </div>
        )}

        {/* Suggestions */}
        {!finalConfig && suggestions.length > 0 && !loading && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => send(s)}
                className="text-sm px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/10 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        {!finalConfig && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 sticky bottom-4 bg-background/80 backdrop-blur-xl rounded-xl border border-border p-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب إجابتك..."
              disabled={loading}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
            <Button type="submit" disabled={loading || !input.trim()} size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
