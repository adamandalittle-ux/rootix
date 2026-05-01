// ROOTIX AI Builder v4 — Smart, conversational, 20-30 questions, color swatches, consistent design
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";

const TEMPLATES_JSON = `[
 {"id":"royal-gold","name":"الملكي الذهبي","mood":"luxury","primary":"#d4af37","accent":"#f4d03f","bg":"#0a0a0a","best_for":["arabic","studies","secondary"]},
 {"id":"midnight-tech","name":"ميدنايت تيك","mood":"tech","primary":"#3b82f6","accent":"#06b6d4","bg":"#0f172a","best_for":["math","physics","science","secondary"]},
 {"id":"ocean-calm","name":"المحيط الهادي","mood":"calm","primary":"#0891b2","accent":"#22d3ee","bg":"#083344","best_for":["english","studies","prep"]},
 {"id":"sunset-warm","name":"غروب الشمس","mood":"warm","primary":"#f97316","accent":"#fb923c","bg":"#1c1917","best_for":["arabic","math","primary"]},
 {"id":"neon-modern","name":"نيون عصري","mood":"modern","primary":"#8b5cf6","accent":"#a78bfa","bg":"#0c0a1f","best_for":["english","math","secondary"]},
 {"id":"emerald-lux","name":"الزمرد الفاخر","mood":"luxury","primary":"#10b981","accent":"#34d399","bg":"#022c22","best_for":["biology","science","secondary"]},
 {"id":"crimson-power","name":"القرمزي القوي","mood":"warm","primary":"#b91c1c","accent":"#dc2626","bg":"#1a0a0a","best_for":["math","physics","chemistry","secondary"]},
 {"id":"sakura-soft","name":"ساكورا الناعم","mood":"calm","primary":"#ec4899","accent":"#f9a8d4","bg":"#fdf2f8","best_for":["arabic","english","french","primary","prep"]},
 {"id":"desert-sand","name":"رمال الصحراء","mood":"warm","primary":"#b45309","accent":"#d97706","bg":"#1c1917","best_for":["studies","arabic","prep"]},
 {"id":"arctic-ice","name":"الثلج القطبي","mood":"tech","primary":"#0ea5e9","accent":"#38bdf8","bg":"#082f49","best_for":["science","physics","math","prep"]},
 {"id":"galaxy-deep","name":"مجرة عميقة","mood":"modern","primary":"#6366f1","accent":"#818cf8","bg":"#0a0a23","best_for":["physics","math","secondary"]},
 {"id":"forest-earth","name":"غابة الأرض","mood":"calm","primary":"#15803d","accent":"#22c55e","bg":"#052e16","best_for":["biology","science","studies","prep"]},
 {"id":"coral-reef","name":"الشعب المرجانية","mood":"warm","primary":"#f43f5e","accent":"#fb7185","bg":"#1a0a0f","best_for":["english","arabic","prep"]},
 {"id":"mono-editorial","name":"الأبيض والأسود","mood":"modern","primary":"#18181b","accent":"#52525b","bg":"#fafafa","best_for":["arabic","studies","secondary"]},
 {"id":"cyber-grid","name":"شبكة سايبر","mood":"tech","primary":"#22c55e","accent":"#4ade80","bg":"#0a0f0a","best_for":["math","physics","science","secondary"]},
 {"id":"pastel-cloud","name":"باستيل سحابي","mood":"calm","primary":"#a78bfa","accent":"#c4b5fd","bg":"#faf5ff","best_for":["arabic","english","math","primary"]},
 {"id":"ruby-academy","name":"أكاديمية الياقوت","mood":"luxury","primary":"#9f1239","accent":"#be123c","bg":"#1a0510","best_for":["arabic","studies","secondary"]},
 {"id":"sapphire-prep","name":"الياقوت الأزرق","mood":"tech","primary":"#1d4ed8","accent":"#3b82f6","bg":"#0a1535","best_for":["science","math","english","prep"]},
 {"id":"amber-classic","name":"الكهرماني الكلاسيكي","mood":"luxury","primary":"#d97706","accent":"#f59e0b","bg":"#1c1408","best_for":["arabic","studies","secondary","prep"]},
 {"id":"violet-future","name":"البنفسجي المستقبلي","mood":"modern","primary":"#7c3aed","accent":"#a855f7","bg":"#1a0a2e","best_for":["physics","math","english","secondary"]}
]`;

const SYSTEM_PROMPT = `أنت "ROOTIX AI" — مهندس منصات تعليمية محترف. شخصيتك: مصري، ودود، **مختصر جداً**، تركيزك كله على بناء المنصة بسرعة ودقة.

## ⚡⚡⚡ قاعدة الذهب: ردك = ≤ 200 حرف
- كل رسالة منك = ترحيب قصير (3-5 كلمات) + السؤال (10-15 كلمة) + SUGGESTIONS.
- ممنوع رغي. ممنوع شرح طويل. ممنوع تكرار كلام المدرس.
- لو لازم تفسّر → جملة واحدة فقط.
- ✅ صح: "تمام 👌 المادة إيه؟"
- ❌ غلط: "ماشاء الله عليك! اختيار رائع جداً ودا هيخلي المنصة..."

## عن ROOTIX
منصات تعليمية على رابط rootix.app/m/slug — فيديوهات + امتحانات + PDF + أكواد طلاب + لوحة مدرس.

## القوالب (20 قالب)
${TEMPLATES_JSON}

## ⚠️ ممنوع تسأل عن:
اسم المدرس / تليفون / باقة / سعر / إيميل / كلمة سر. دي بيدخلها في فورم بعدين.

## ✅ مطلوب تسأل عن (مهم):
**اسم الرابط بالإنجليزي** — مثال: "ahmed-math" أو "physics-pro". قصير ≤ 25 حرف، إنجليزي بحت بحروف صغيرة وشُرطة فقط.

## القواعد الحديدية:
1. **سؤال واحد لكل رسالة** — مش 2 ولا 3.
2. لو قال "اختار انت" أو "متعرفش" → اختار فوراً وكمل.
3. لو سأل سؤال → جاوب جملة واحدة + كمل سؤالك.
4. اللون/القالب اللي يختاره = موحد على كل صفحات المنصة.
5. الـ slug إنجليزي بحت (a-z, 0-9, dashes). ≤ 25 حرف.

## عرض الألوان (إجباري لما تسأل عن لون/مزاج/قالب):
\`COLOR_SWATCH: [{"name":"اسم","hex":"#xxxxxx"}, ...]\`

## الأسئلة (15-18 كحد أقصى — قلّلها لو فهمت من إجابة سابقة):

### الأساسيات (5)
1. المادة؟ SUGGESTIONS: ["رياضيات","علوم","عربي","إنجليزي","فيزياء","كيمياء","أحياء","دراسات","فرنساوي"]
2. المرحلة؟ SUGGESTIONS: ["ابتدائي","إعدادي","ثانوي"]
3. الصفوف؟ (حسب المرحلة)
4. اسم المنصة؟ (اقترح 4 أسماء قصيرة)
5. **اسم الرابط بالإنجليزي؟** (rootix.app/m/[الاسم]) — اقترح 3-4 مبنيين على اسم المنصة، مثل: ["ahmed-math","math-pro","ahmed-academy"]

### الهوية البصرية (3)
6. المزاج؟ COLOR_SWATCH + SUGGESTIONS: ["فخم","تقني","هادي","دافي","عصري"]
7. اللون الأساسي؟ COLOR_SWATCH (4 ألوان)
8. القالب؟ COLOR_SWATCH (3-4 قوالب)

### التبويبات (3 — سريع)
9. تبويب الفيديوهات؟ SUGGESTIONS: ["الفيديوهات","الدروس","الشروحات"]
10. تبويب الامتحانات؟ SUGGESTIONS: ["الامتحانات","التقييمات","الاختبارات"]
11. تبويب PDF؟ SUGGESTIONS: ["ملازم","ملفات PDF","المذكرات"]

### المميزات (3)
12. علامة مائية؟ SUGGESTIONS: ["مفعّلة","شفافة خفيفة","إيقاف"]
13. نتيجة الامتحان؟ SUGGESTIONS: ["فورية","يستنى المدرس"]
14. شكل الأزرار؟ SUGGESTIONS: ["مدورة","ناعمة","حادة"]

### الوصول (1)
15. دخول الطلاب الافتراضي؟ SUGGESTIONS: ["مفتوح","بكود","بتسجيل"]

بعدها → استدعي \`save_platform_config\` فوراً.

## فورمات الرد:
\`\`\`
[ترحيب 3-5 كلمات] [السؤال 10-15 كلمة]

SUGGESTIONS: ["خيار 1","خيار 2","خيار 3","خيار 4"]
\`\`\`
لو سؤال لون/قالب: أضف سطر COLOR_SWATCH.

## النبرة:
- "تمام 👌"، "حلو"، "ماشي"، "كده تمام"
- ممنوع: "ماشاء الله"، "اختيار رائع جداً"، أي مدح طويل.

## نهاية المحاورة:
لو المدرس قال "خلصنا" / "كفاية" / "اعمل المنصة" أو خلصت السؤال 15 → استدعي \`save_platform_config\` بأحسن defaults.`;

const SAVE_PLATFORM_TOOL = {
  type: "function",
  function: {
    name: "save_platform_config",
    description: "احفظ بيانات المنصة الكاملة بعد المحاورة. استدعي ده مرة واحدة بس في الآخر.",
    parameters: {
      type: "object",
      properties: {
        subject: { type: "string", enum: ["math","science","arabic","studies","english","physics","chemistry","biology","french"] },
        stage: { type: "string", enum: ["primary","prep","secondary"] },
        grade_levels: { type: "array", items: { type: "string" } },
        platform_name: { type: "string" },
        slug: { type: "string", description: "إنجليزي a-z 0-9 dashes فقط", pattern: "^[a-z0-9-]+$" },
        mood: { type: "string", enum: ["luxury","tech","calm","warm","modern"] },
        template_id: {
          type: "string",
          enum: ["royal-gold","midnight-tech","ocean-calm","sunset-warm","neon-modern","emerald-lux","crimson-power","sakura-soft","desert-sand","arctic-ice","galaxy-deep","forest-earth","coral-reef","mono-editorial","cyber-grid","pastel-cloud","ruby-academy","sapphire-prep","amber-classic","violet-future"],
        },
        logo_text: { type: "string", description: "حرف أو حرفين للوجو" },
        welcome_message: { type: "string" },
        videos_label: { type: "string", default: "الفيديوهات" },
        exams_label: { type: "string", default: "الامتحانات" },
        pdf_label: { type: "string", default: "ملفات PDF" },
        questions_label: { type: "string", default: "بنك الأسئلة" },
        button_shape: { type: "string", enum: ["round","soft","sharp"], default: "soft" },
        animation_level: { type: "string", enum: ["simple","medium","advanced"], default: "medium" },
        watermark_enabled: { type: "boolean", default: true },
        video_speeds: { type: "boolean", default: true },
        prevent_download: { type: "boolean", default: true },
        student_navbar_visible: { type: "boolean", default: true },
        instant_exam_results: { type: "boolean", default: true },
        content_locked_by_grade: { type: "boolean", default: true },
        new_badge_enabled: { type: "boolean", default: true },
        default_gate_mode: { type: "string", enum: ["open","code"], default: "open" },
        allow_pdf_download: { type: "boolean", default: false },
        show_student_count: { type: "boolean", default: false },
        leaderboard_enabled: { type: "boolean", default: true },
        about_teacher_page: { type: "boolean", default: false },
      },
      required: ["subject","stage","grade_levels","platform_name","slug","mood","template_id"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Use Flash for speed/cost (10x cheaper than Pro, almost as smart for chat)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Flash-lite = أسرع 2x وأرخص — ممتاز للمحاورة القصيرة
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        tools: [SAVE_PLATFORM_TOOL],
        stream: true,
        temperature: 0.4,
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح. حاول بعد قليل." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "الرصيد نفد." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("rootix-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
