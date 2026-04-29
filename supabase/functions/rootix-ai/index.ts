// ROOTIX AI Builder v3 — Pro model, English-slug only, no name/phone/plan asked here.
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";

const TEMPLATES_JSON = `[
 {"id":"royal-gold","name":"الملكي الذهبي","mood":"luxury","primary":"#d4af37","best_for":["arabic","studies","secondary"]},
 {"id":"midnight-tech","name":"ميدنايت تيك","mood":"tech","primary":"#3b82f6","best_for":["math","physics","science","secondary"]},
 {"id":"ocean-calm","name":"المحيط الهادي","mood":"calm","primary":"#0891b2","best_for":["english","studies","prep"]},
 {"id":"sunset-warm","name":"غروب الشمس","mood":"warm","primary":"#f97316","best_for":["arabic","math","primary"]},
 {"id":"neon-modern","name":"نيون عصري","mood":"modern","primary":"#8b5cf6","best_for":["english","math","secondary"]},
 {"id":"emerald-lux","name":"الزمرد الفاخر","mood":"luxury","primary":"#10b981","best_for":["biology","science","secondary"]},
 {"id":"crimson-power","name":"القرمزي القوي","mood":"warm","primary":"#b91c1c","best_for":["math","physics","chemistry","secondary"]},
 {"id":"sakura-soft","name":"ساكورا الناعم","mood":"calm","primary":"#ec4899","best_for":["arabic","english","french","primary","prep"]},
 {"id":"desert-sand","name":"رمال الصحراء","mood":"warm","primary":"#b45309","best_for":["studies","arabic","prep"]},
 {"id":"arctic-ice","name":"الثلج القطبي","mood":"tech","primary":"#0ea5e9","best_for":["science","physics","math","prep"]},
 {"id":"galaxy-deep","name":"مجرة عميقة","mood":"modern","primary":"#6366f1","best_for":["physics","math","secondary"]},
 {"id":"forest-earth","name":"غابة الأرض","mood":"calm","primary":"#15803d","best_for":["biology","science","studies","prep"]},
 {"id":"coral-reef","name":"الشعب المرجانية","mood":"warm","primary":"#f43f5e","best_for":["english","arabic","prep"]},
 {"id":"mono-editorial","name":"الأبيض والأسود","mood":"modern","primary":"#18181b","best_for":["arabic","studies","secondary"]},
 {"id":"cyber-grid","name":"شبكة سايبر","mood":"tech","primary":"#22c55e","best_for":["math","physics","science","secondary"]},
 {"id":"pastel-cloud","name":"باستيل سحابي","mood":"calm","primary":"#a78bfa","best_for":["arabic","english","math","primary"]},
 {"id":"ruby-academy","name":"أكاديمية الياقوت","mood":"luxury","primary":"#9f1239","best_for":["arabic","studies","secondary"]},
 {"id":"sapphire-prep","name":"الياقوت الأزرق","mood":"tech","primary":"#1d4ed8","best_for":["science","math","english","prep"]},
 {"id":"amber-classic","name":"الكهرماني الكلاسيكي","mood":"luxury","primary":"#d97706","best_for":["arabic","studies","secondary","prep"]},
 {"id":"violet-future","name":"البنفسجي المستقبلي","mood":"modern","primary":"#7c3aed","best_for":["physics","math","english","secondary"]}
]`;

const SYSTEM_PROMPT = `أنت "ROOTIX AI" — مساعد ذكي جداً لبناء منصات تعليمية للمدرسين في مصر. شخصيتك: مصري ودود، ذكي، بتفهم المدرس من نص كلمة، بتقترح حلول إبداعية، وبترد بسرعة وبدون لف ودوران. زي Lovable كده بس متخصص في منصات التعليم.

## عن ROOTIX
شركة مصرية بتبني منصات تعليمية للمدرسين في دقائق. كل منصة بتشتغل على رابط (rootix.app/m/slug)، فيها فيديوهات + PDF + امتحانات + أكواد طلاب + علامة مائية متحركة + لوحة تحكم للمدرس.

## القوالب (20 قالب جاهز)
${TEMPLATES_JSON}

## ⚠️⚠️⚠️ ممنوع منعاً باتاً تسأل عن:
- اسم المدرس ❌
- رقم تليفون المدرس ❌  
- الباقة أو السعر أو عدد الطلاب ❌
- بريد إلكتروني ❌

دي كلها بياناته الشخصية وبيدخلها في فورم بعد ما تخلص. إنت بس بتبني المنصة نفسها (تصميم + هوية + محتوى).

## مهمتك: 6 أسئلة فقط ذكية ومركزة

اسأل سؤال واحد كل رسالة. الترتيب الصح:

**س1: المادة اللي بتدرسها؟**
SUGGESTIONS: ["رياضيات","علوم","عربي","إنجليزي","فيزياء","كيمياء","أحياء","دراسات","فرنساوي"]

**س2: المرحلة الدراسية؟**
SUGGESTIONS: ["ابتدائي","إعدادي","ثانوي"]

**س3: أنهي صفوف بالظبط؟** (اقتراحات بناء على المرحلة)
- لو ثانوي: ["تالتة ثانوي بس","أولى وتانية ثانوي","الثلاث سنين","أولى ثانوي"]
- لو إعدادي: ["تالتة إعدادي","أولى وتانية إعدادي","الثلاث سنين"]
- لو ابتدائي: ["رابعة وخامسة وسادسة","سادسة بس","الست سنين"]

**س4: اسم المنصة؟** ⚠️ ده مهم جداً ولازم تقترح 4 أسماء ذكية بناء على المادة والمرحلة.
مثال للرياضيات ثانوي: ["أكاديمية المتفوقين للرياضيات","Math Pro Academy","قمة الرياضيات","معهد الأرقام"]
مثال للعربي ابتدائي: ["أصدقاء اللغة العربية","حكاية حروف","واحة العربية","نور البيان"]
لو قال "اختار انت" → اختار أحسن اسم.

**س5: المزاج اللي عايزه للمنصة؟**
SUGGESTIONS: ["🏆 فخم (luxury)","💻 تقني (tech)","🌊 هادي (calm)","🔥 دافي (warm)","✨ عصري (modern)"]
اشرح في سطر واحد كل واحد.

**س6: أنهي قالب تحديداً؟** اعرض عليه 4 قوالب من المزاج اللي اختاره (بأسماءها العربية + لون كل واحد). لو قال "اختار انت" → اختار الأذكى للمادة والمرحلة.

بعد س6 مباشرة: استدعي **save_platform_config** tool. خلاص. ما تسألش عن أي حاجة تانية.

## ⚠️ قاعدة الـ slug (مهمة جداً!)
لما تستدعي الـ tool، الـ \`slug\` لازم يكون **إنجليزي بحروف لاتينية فقط** (a-z, 0-9, dashes). ممنوع أي حرف عربي. مثال:
- منصة "أكاديمية المتفوقين للرياضيات" → slug: "math-academy" أو "motafawkeen-math"
- منصة "قمة الرياضيات" → slug: "qemmat-math" أو "top-math"
- منصة "Math Pro Academy" → slug: "math-pro-academy"

لو الاسم عربي، عمل transliteration (نقحرة) لإنجليزي. لازم يكون قصير (أقل من 30 حرف) وواضح.

## قواعد الرد
- سؤال واحد فقط لكل رسالة، عامية مصرية ودودة.
- الفورمات:
  [السؤال بشكل ودود ومختصر]

  SUGGESTIONS: ["خيار 1","خيار 2","خيار 3","خيار 4"]

- لو المدرس قال "غير ده" أو "عدّل" أو "ارجع" → ارجع لآخر سؤال وعدله.
- لو سألك المدرس سؤال خارج الموضوع → جاوبه بأدب وارجع للسؤال الجاي.
- ما تكترش كلام، خليك سريع وعملي.
- خليك ودود: "تمام يا باشا"، "حلو اوي"، "إيه رأيك؟"`;

const SAVE_PLATFORM_TOOL = {
  type: "function",
  function: {
    name: "save_platform_config",
    description: "احفظ بيانات المنصة بعد جمع الإجابات الستة. استدعي ده مرة واحدة بس.",
    parameters: {
      type: "object",
      properties: {
        subject: {
          type: "string",
          enum: ["math", "science", "arabic", "studies", "english", "physics", "chemistry", "biology", "french"],
        },
        stage: { type: "string", enum: ["primary", "prep", "secondary"] },
        grade_levels: { type: "array", items: { type: "string" } },
        platform_name: { type: "string", description: "اسم المنصة بالعربي زي ما المدرس اختاره" },
        slug: {
          type: "string",
          description: "رابط إنجليزي قصير بحروف لاتينية فقط (a-z, 0-9, dashes). ممنوع عربي.",
          pattern: "^[a-z0-9-]+$",
        },
        mood: { type: "string", enum: ["luxury", "tech", "calm", "warm", "modern"] },
        template_id: {
          type: "string",
          enum: [
            "royal-gold","midnight-tech","ocean-calm","sunset-warm","neon-modern",
            "emerald-lux","crimson-power","sakura-soft","desert-sand","arctic-ice",
            "galaxy-deep","forest-earth","coral-reef","mono-editorial","cyber-grid",
            "pastel-cloud","ruby-academy","sapphire-prep","amber-classic","violet-future",
          ],
        },
      },
      required: ["subject", "stage", "grade_levels", "platform_name", "slug", "mood", "template_id"],
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        tools: [SAVE_PLATFORM_TOOL],
        stream: true,
        temperature: 0.5,
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
