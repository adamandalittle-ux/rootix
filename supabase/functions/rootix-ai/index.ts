// ROOTIX AI Builder v4 — Smart, conversational, 20-30 questions, color swatches, consistent design
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";

const TEMPLATES_JSON = `[
 {"id":"royal-gold","name":"الملكي الذهبي","mood":"luxury","primary":"#d4af37"},
 {"id":"midnight-tech","name":"ميدنايت تيك","mood":"tech","primary":"#3b82f6"},
 {"id":"ocean-calm","name":"المحيط الهادي","mood":"calm","primary":"#0891b2"},
 {"id":"sunset-warm","name":"غروب الشمس","mood":"warm","primary":"#f97316"},
 {"id":"neon-modern","name":"نيون عصري","mood":"modern","primary":"#8b5cf6"},
 {"id":"emerald-lux","name":"الزمرد الفاخر","mood":"luxury","primary":"#10b981"},
 {"id":"crimson-power","name":"القرمزي القوي","mood":"warm","primary":"#b91c1c"},
 {"id":"sakura-soft","name":"ساكورا الناعم","mood":"calm","primary":"#ec4899"},
 {"id":"desert-sand","name":"رمال الصحراء","mood":"warm","primary":"#b45309"},
 {"id":"arctic-ice","name":"الثلج القطبي","mood":"tech","primary":"#0ea5e9"},
 {"id":"galaxy-deep","name":"مجرة عميقة","mood":"modern","primary":"#6366f1"},
 {"id":"forest-earth","name":"غابة الأرض","mood":"calm","primary":"#15803d"},
 {"id":"coral-reef","name":"الشعب المرجانية","mood":"warm","primary":"#f43f5e"},
 {"id":"mono-editorial","name":"الأبيض والأسود","mood":"modern","primary":"#18181b"},
 {"id":"cyber-grid","name":"شبكة سايبر","mood":"tech","primary":"#22c55e"},
 {"id":"pastel-cloud","name":"باستيل سحابي","mood":"calm","primary":"#a78bfa"},
 {"id":"ruby-academy","name":"أكاديمية الياقوت","mood":"luxury","primary":"#9f1239"},
 {"id":"sapphire-prep","name":"الياقوت الأزرق","mood":"tech","primary":"#1d4ed8"},
 {"id":"amber-classic","name":"الكهرماني الكلاسيكي","mood":"luxury","primary":"#d97706"},
 {"id":"violet-future","name":"البنفسجي المستقبلي","mood":"modern","primary":"#7c3aed"}
]`;

const SYSTEM_PROMPT = `أنت "ROOTIX AI" — مهندس منصات تعليمية محترف. شخصيتك: مصري، ودود، **مختصر جداً**.

## ⚡ قاعدة الذهب: ردك ≤ 200 حرف
- ترحيب قصير + سؤال + SUGGESTIONS.
- ممنوع رغي. ممنوع تكرار كلام المدرس.

## القوالب
${TEMPLATES_JSON}

## ⚠️ ممنوع تسأل عن:
اسم المدرس / تليفون / باقة / سعر / إيميل. دي بيدخلها في فورم بعدين.

## ✅ مطلوب تسأل عن:
**اسم الرابط بالإنجليزي** — قصير ≤ 25 حرف، حروف صغيرة وشُرطة فقط.

## القواعد:
1. سؤال واحد لكل رسالة.
2. لو قال "اختار انت" → اختار وكمل.
3. اللون اللي يختاره = موحد على كل الصفحات.

## الأسئلة (15 كحد أقصى):
1. المادة؟ SUGGESTIONS: ["رياضيات","علوم","عربي","إنجليزي","فيزياء","كيمياء","أحياء","دراسات","فرنساوي"]
2. المرحلة؟ SUGGESTIONS: ["ابتدائي","إعدادي","ثانوي"]
3. الصفوف؟
4. اسم المنصة؟ (اقترح 4 أسماء)
5. اسم الرابط بالإنجليزي؟ (اقترح 3-4)
6. المزاج؟ COLOR_SWATCH + SUGGESTIONS: ["فخم","تقني","هادي","دافي","عصري"]
7. اللون الأساسي؟ COLOR_SWATCH (4)
8. القالب؟ COLOR_SWATCH (3-4)
9-11. تبويبات الفيديوهات/الامتحانات/PDF
12. علامة مائية؟
13. نتيجة الامتحان؟ ["فورية","يستنى المدرس"]
14. شكل الأزرار؟ ["مدورة","ناعمة","حادة"]
15. دخول الطلاب؟ ["مفتوح","بكود"]

بعدها → استدعي \`save_platform_config\` فوراً.

## فورمات الرد:
\`\`\`
[ترحيب قصير] [السؤال]
SUGGESTIONS: ["خ1","خ2","خ3"]
\`\`\`
لو سؤال لون: أضف COLOR_SWATCH: [{"name":"...","hex":"#xxxxxx"}, ...]

## نهاية المحاورة:
لو قال "خلصنا" / "اعمل المنصة" → استدعي \`save_platform_config\` بأحسن defaults.`;

const SAVE_PLATFORM_FN = {
  name: "save_platform_config",
  description: "احفظ بيانات المنصة الكاملة بعد المحاورة. استدعي ده مرة واحدة بس في الآخر.",
  parameters: {
    type: "object",
    properties: {
      subject: { type: "string", enum: ["math","science","arabic","studies","english","physics","chemistry","biology","french"] },
      stage: { type: "string", enum: ["primary","prep","secondary"] },
      grade_levels: { type: "array", items: { type: "string" } },
      platform_name: { type: "string" },
      slug: { type: "string", description: "إنجليزي a-z 0-9 dashes فقط" },
      mood: { type: "string", enum: ["luxury","tech","calm","warm","modern"] },
      template_id: { type: "string" },
      logo_text: { type: "string" },
      welcome_message: { type: "string" },
      videos_label: { type: "string" },
      exams_label: { type: "string" },
      pdf_label: { type: "string" },
      questions_label: { type: "string" },
      button_shape: { type: "string", enum: ["round","soft","sharp"] },
      animation_level: { type: "string", enum: ["simple","medium","advanced"] },
      watermark_enabled: { type: "boolean" },
      video_speeds: { type: "boolean" },
      prevent_download: { type: "boolean" },
      student_navbar_visible: { type: "boolean" },
      instant_exam_results: { type: "boolean" },
      content_locked_by_grade: { type: "boolean" },
      new_badge_enabled: { type: "boolean" },
      default_gate_mode: { type: "string", enum: ["open","code"] },
      allow_pdf_download: { type: "boolean" },
      show_student_count: { type: "boolean" },
      leaderboard_enabled: { type: "boolean" },
      about_teacher_page: { type: "boolean" },
    },
    required: ["subject","stage","grade_levels","platform_name","slug","mood","template_id"],
  },
};

// Convert OpenAI-style messages to Gemini "contents" format
function toGeminiContents(messages: Array<{ role: string; content: string }>) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

// Send a single SSE chunk in OpenAI-compatible format
function sseChunk(controller: ReadableStreamDefaultController, encoder: TextEncoder, delta: any) {
  const payload = { choices: [{ delta }] };
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const API_KEY = Deno.env.get("ROOTIX_GEMINI_API_KEY");
    if (!API_KEY) throw new Error("ROOTIX_GEMINI_API_KEY is not configured");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:streamGenerateContent?alt=sse&key=${API_KEY}`;

    const geminiBody = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: toGeminiContents(messages),
      tools: [{ functionDeclarations: [SAVE_PLATFORM_FN] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 400,
      },
    };

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!upstream.ok) {
      const t = await upstream.text();
      console.error("Gemini error:", upstream.status, t);
      const status = upstream.status === 429 ? 429 : upstream.status === 403 ? 402 : 500;
      const msg = status === 429 ? "تم تجاوز الحد المسموح، جرب بعد دقيقة." : status === 402 ? "مفتاح API محدود أو منتهي." : "خطأ من Gemini.";
      return new Response(JSON.stringify({ error: msg }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream Gemini SSE → re-emit as OpenAI-compatible SSE that Builder.tsx already parses
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = upstream.body!.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        let buf = "";
        let toolEmitted = false;
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            let nl: number;
            while ((nl = buf.indexOf("\n")) !== -1) {
              const line = buf.slice(0, nl).trim();
              buf = buf.slice(nl + 1);
              if (!line.startsWith("data:")) continue;
              const json = line.slice(5).trim();
              if (!json || json === "[DONE]") continue;
              try {
                const obj = JSON.parse(json);
                const parts = obj?.candidates?.[0]?.content?.parts || [];
                for (const p of parts) {
                  if (p.text) {
                    sseChunk(controller, encoder, { content: p.text });
                  } else if (p.functionCall && !toolEmitted) {
                    toolEmitted = true;
                    const args = JSON.stringify(p.functionCall.args || {});
                    sseChunk(controller, encoder, {
                      tool_calls: [{
                        index: 0,
                        function: { name: p.functionCall.name, arguments: args },
                      }],
                    });
                  }
                }
              } catch {
                // ignore partial line
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (e) {
          console.error("stream error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error("rootix-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
