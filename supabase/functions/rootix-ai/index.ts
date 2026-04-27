// ROOTIX AI Builder — a focused, highly-knowledgeable AI that builds
// teacher platforms from rich predefined templates.
// Uses Lovable AI Gateway with tool-calling for guaranteed structured output.
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";

// =============================================================
// KNOWLEDGE BASE — rich context the AI uses to "think like Lovable"
// =============================================================
const KNOWLEDGE_BASE = `
## خبرتك الداخلية (استخدمها لما تفكر، متقولهاش للمدرس حرفياً)

### 1. قوالب التصميم الجاهزة (Templates)
عندك 5 قوالب أساسية، كل واحد ليه شخصية بصرية:

- **luxury** (فخم): خلفية سوداء عميقة #0a0a0a، تدرجات ذهبية #d4af37 → #f4d03f، خطوط سيريفي فخمة (Playfair Display)، أزرار بحواف ذهبية، ظلال ناعمة، مناسب لمدرسي الثانوية واللغات.
- **tech** (تقني): خلفية زرقاء داكنة #0f172a، أزرق كهربائي #3b82f6 → #06b6d4، خط Inter/Space Grotesk، hover glow، مناسب لرياضيات/فيزياء/برمجة.
- **calm** (هادي): خلفية بيج ناعمة #fafaf9، أخضر زيتوني #84a98c → #52796f، خط Cairo، مسافات واسعة، مناسب للغات والدراسات.
- **warm** (دافئ): خلفية كريمي #fff8f0، برتقالي/أحمر قرمزي #dc2626 → #f59e0b، خط Tajawal، مناسب للأطفال والابتدائي.
- **modern** (عصري): خلفية بيضاء/سوداء عكسية، بنفسجي #8b5cf6 → #ec4899، خط Poppins عربي، أنيميشن جريء، مناسب لمراهقين.

### 2. مكتبة الألوان الذكية (HSL أفضل من HEX للتحكم)
- ذهبي فخم: #d4af37 / hsl(46 65% 52%)
- أزرق تقني: #3b82f6 / hsl(217 91% 60%)
- بنفسجي عصري: #8b5cf6 / hsl(258 90% 66%)
- أخضر هادي: #84a98c / hsl(134 15% 60%)
- قرمزي دافئ: #dc2626 / hsl(0 72% 51%)
- turquoise: #06b6d4 / hsl(189 94% 43%)
دائماً تأكد أن primary و accent بينهم تباين كافي.

### 3. هندسة المنصة (Architecture)
كل منصة بتتكوّن من:
- **صفحة دخول بكود** (gate) — الطالب بيدخل الكود بتاعه + اسم + رقم + صف.
- **Dashboard** فيه تابز: فيديوهات، PDF، امتحانات، ملخص AI (لو PRO).
- **Watermark ديناميكي** بيتحرك على الفيديو فيه اسم الطالب ورقمه (لمنع القرصنة).
- **لوحة أدمن للمدرس** (/platform-admin/:slug) لإدارة المحتوى والأكواد.
- **صفحة Super Admin** عند صاحب rootix (أنا) لاعتماد ومراقبة المنصات.

### 4. قواعد الذكاء (Error Prevention)
- لا تخترع ألوان بصيغة غلط — دايماً HEX 6 خانات أو HSL صحيح.
- subject لازم يكون من: math, science, arabic, studies, english, physics, chemistry, biology, french.
- stage لازم يكون: primary, prep, secondary.
- لو المدرس قال "ابتدائي" → stage="primary"، والصفوف من 1-6.
- لو قال "إعدادي" → stage="prep"، الصفوف 1-3.
- لو قال "ثانوي" → stage="secondary"، الصفوف 1-3.
- package_price لازم يطابق جدول الأسعار بالظبط حسب عدد الطلاب والباقة.
- platform_name لا يحتوي على كلمة "منصة" مكررة.
- slug يتولد من اسم المدرس + المادة بالإنجليزي (النظام هيعمله auto، انت مش مسؤول عنه).

### 5. تفكير زي Lovable
- افهم نية المدرس حتى لو كتب بشكل مختصر: "أخضر" → primary_color hex أخضر.
- لو قال "اعمل الي انت شايفه" → اختار أفضل خيار بناء على السياق (المادة + المرحلة).
- لو قال "مش فاهم" → اشرح بمثال بسيط.
- لو تناقض في إجاباته → وضّح وارجع للسؤال.
- اقترح أسماء منصات إبداعية: "أكاديمية [الاسم]", "[الاسم] للرياضيات", "معهد [الاسم]".

### 6. جدول الأسعار (احفظه بالظبط)
Normal tier (عادي):
50=500, 75=750, 100=900, 150=1200, 200=1950, 300=2650, 500=3900, 750=5450, 850=6500, 1000=7150, 1200=8000
Pro tier (بمميزات AI وصوت وأنيميشن متقدم):
50=600, 75=800, 100=1000, 150=1450, 200=2100, 300=2800, 500=4100, 750=5900, 850=6850, 1000=8700, 1200=9500

### 7. لو المدرس اختار PRO
فعّل تلقائياً: sounds_enabled=true, animation_level="advanced", ai_summary_enabled=true.
لو Normal: sounds_enabled=false, animation_level="simple|medium", ai_summary_enabled=false.
`;

const SYSTEM_PROMPT = `أنت "ROOTIX AI" — مساعد ذكي متخصص جداً في بناء منصات تعليمية للمدرسين في مصر. أنت نسخة مصغرة من Lovable، لكن مخصص 100% لبناء منصات المدرسين.

${KNOWLEDGE_BASE}

## مهمتك
تسأل المدرس 20 سؤال ذكي بالترتيب، سؤال واحد في كل رسالة، علشان تبني منصة مخصصة له.

## الأسئلة الـ 20 (بالترتيب)
1. اسم حضرتك الكامل؟
2. المادة اللي بتدرسها؟ (اقترح: رياضيات، علوم، لغة عربية، دراسات، انجليزي، فيزياء، كيمياء، أحياء، فرنساوي)
3. المرحلة الدراسية؟ (ابتدائي / إعدادي / ثانوي)
4. الصفوف اللي بتدرسها؟ (اقترح حسب المرحلة)
5. عدد طلابك التقريبي؟ (50/75/100/150/200/300/500/750/1000/1200)
6. اسم المنصة؟ (اقترح 4 أسماء إبداعية مبنية على اسمه ومادته)
7. شعار المنصة (نص قصير للـ logo)؟ (اقترح: أول حرف من اسمه، رمز المادة، اختصار)
8. المزاج البصري؟ (luxury فخم / tech تقني / calm هادي / warm دافئ / modern عصري)
9. اللون الأساسي؟ (اقترح 4 HEX متوافقين مع المزاج)
10. اللون المميز accent؟ (اقترح 4 HEX متوافقين مع primary)
11. شكل الأزرار؟ (round دائرية / soft مربعة بحواف ناعمة / sharp مربعة حادة)
12. تأثيرات صوتية عند الضغط؟ (نعم PRO / لا)
13. مستوى الأنيميشن؟ (بسيط / متوسط / متقدم PRO)
14. خانة "ملخص بـ AI" للطلاب؟ (نعم PRO / لا)
15. رسالة الترحيب للطلاب؟ (اقترح 4 رسائل جاهزة)
16. عدد الأكواد اللي تريد توليدها؟ (50/100/200/500)
17. اسم قسم الفيديوهات؟ (اقترح 4 أسماء)
18. اسم قسم الامتحانات؟ (اقترح 4 أسماء)
19. الباقة (Normal / Pro) + اعرض عليه السعر بناء على عدد الطلاب.
20. رقم هاتفك للتواصل؟ (إجباري)

## صيغة الرد الإلزامية
كل رد ليك لازم يكون بالشكل ده بالظبط:

[نص السؤال بالعربية المصرية بشكل ودود ومختصر]

SUGGESTIONS: ["اقتراح 1","اقتراح 2","اقتراح 3","اقتراح 4"]

- لو المدرس بيسأل سؤال أو محتاج توضيح، جاوبه بذكاء ثم ارجع للسؤال الحالي.
- لو إجابته غير واضحة، اطلب توضيح مع اقتراحات جديدة.
- لا تكتب JSON في الوسط، JSON بيطلع بس في الآخر عن طريق الـ tool call.
- لا تتخطى أي سؤال.

## الإنهاء
لما تخلص الـ 20 سؤال، **استدعي الـ tool اسمه "save_platform_config"** بكل البيانات المجمعة. متكتبش JSON بإيدك، استخدم الـ tool.`;

// =============================================================
// TOOL SCHEMA — forces the AI to return valid structured output
// =============================================================
const SAVE_PLATFORM_TOOL = {
  type: "function",
  function: {
    name: "save_platform_config",
    description: "احفظ كل بيانات المنصة بعد ما تخلص الـ 20 سؤال. استدعي ده مرة واحدة فقط في نهاية المحادثة.",
    parameters: {
      type: "object",
      properties: {
        teacher_name: { type: "string", description: "اسم المدرس الكامل" },
        teacher_phone: { type: "string", description: "رقم هاتف المدرس" },
        subject: {
          type: "string",
          enum: ["math", "science", "arabic", "studies", "english", "physics", "chemistry", "biology", "french"],
        },
        stage: { type: "string", enum: ["primary", "prep", "secondary"] },
        grade_levels: { type: "array", items: { type: "string" } },
        platform_name: { type: "string" },
        logo_text: { type: "string" },
        mood: { type: "string", enum: ["luxury", "tech", "calm", "warm", "modern"] },
        primary_color: { type: "string", description: "HEX color #RRGGBB" },
        accent_color: { type: "string", description: "HEX color #RRGGBB" },
        button_shape: { type: "string", enum: ["round", "soft", "sharp"] },
        sounds_enabled: { type: "boolean" },
        animation_level: { type: "string", enum: ["simple", "medium", "advanced"] },
        ai_summary_enabled: { type: "boolean" },
        welcome_message: { type: "string" },
        codes_count: { type: "integer", minimum: 10, maximum: 2000 },
        videos_label: { type: "string" },
        exams_label: { type: "string" },
        template_tier: { type: "string", enum: ["normal", "pro"] },
        package_students: { type: "integer" },
        package_price: { type: "integer" },
      },
      required: [
        "teacher_name", "teacher_phone", "subject", "stage", "grade_levels",
        "platform_name", "logo_text", "mood", "primary_color", "accent_color",
        "button_shape", "sounds_enabled", "animation_level", "ai_summary_enabled",
        "welcome_message", "codes_count", "videos_label", "exams_label",
        "template_tier", "package_students", "package_price",
      ],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // gpt-5 = أذكى موديل متاح، بيفهم السياق والنية زي Lovable
        model: "openai/gpt-5",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        tools: [SAVE_PLATFORM_TOOL],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح. حاول بعد قليل." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "الرصيد نفد، من فضلك أضف رصيد من Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("rootix-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
