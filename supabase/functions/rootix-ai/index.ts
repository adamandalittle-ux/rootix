// ROOTIX AI Builder v2 — smart, concise, knows 20 templates and picks the best.
// Ask fewer but smarter questions. Uses tool calling for guaranteed structured output.
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";

// =============================================================
// 20 TEMPLATES (mirrored from src/lib/templates.ts, plain strings)
// =============================================================
const TEMPLATES_JSON = `[
 {"id":"royal-gold","name":"الملكي الذهبي","mood":"luxury","primary":"#d4af37","accent":"#f4d03f","best_for":["arabic","studies","secondary"],"desc":"أسود عميق مع ذهبي فخم"},
 {"id":"midnight-tech","name":"ميدنايت تيك","mood":"tech","primary":"#3b82f6","accent":"#06b6d4","best_for":["math","physics","science","secondary"],"desc":"أزرق داكن تقني"},
 {"id":"ocean-calm","name":"المحيط الهادي","mood":"calm","primary":"#0891b2","accent":"#84a98c","best_for":["english","studies","prep"],"desc":"أزرق بحري هادي"},
 {"id":"sunset-warm","name":"غروب الشمس","mood":"warm","primary":"#f97316","accent":"#dc2626","best_for":["arabic","math","primary"],"desc":"برتقالي دافئ للأطفال"},
 {"id":"neon-modern","name":"نيون عصري","mood":"modern","primary":"#8b5cf6","accent":"#ec4899","best_for":["english","math","secondary"],"desc":"بنفسجي/زهري نيون"},
 {"id":"emerald-lux","name":"الزمرد الفاخر","mood":"luxury","primary":"#10b981","accent":"#fbbf24","best_for":["biology","science","secondary"],"desc":"أخضر زمردي راقي"},
 {"id":"crimson-power","name":"القرمزي القوي","mood":"warm","primary":"#b91c1c","accent":"#fbbf24","best_for":["math","physics","chemistry","secondary"],"desc":"أحمر قرمزي جريء"},
 {"id":"sakura-soft","name":"ساكورا الناعم","mood":"calm","primary":"#ec4899","accent":"#f9a8d4","best_for":["arabic","english","french","primary","prep"],"desc":"وردي ناعم"},
 {"id":"desert-sand","name":"رمال الصحراء","mood":"warm","primary":"#b45309","accent":"#d97706","best_for":["studies","arabic","prep"],"desc":"بيج رملي كلاسيكي"},
 {"id":"arctic-ice","name":"الثلج القطبي","mood":"tech","primary":"#0ea5e9","accent":"#38bdf8","best_for":["science","physics","math","prep"],"desc":"أبيض جليدي"},
 {"id":"galaxy-deep","name":"مجرة عميقة","mood":"modern","primary":"#6366f1","accent":"#a855f7","best_for":["physics","math","secondary"],"desc":"كوني عميق"},
 {"id":"forest-earth","name":"غابة الأرض","mood":"calm","primary":"#15803d","accent":"#65a30d","best_for":["biology","science","studies","prep"],"desc":"أخضر غابات طبيعي"},
 {"id":"coral-reef","name":"الشعب المرجانية","mood":"warm","primary":"#f43f5e","accent":"#14b8a6","best_for":["english","arabic","prep"],"desc":"مرجاني/فيروزي حيوي"},
 {"id":"mono-editorial","name":"الأبيض والأسود","mood":"modern","primary":"#18181b","accent":"#71717a","best_for":["arabic","studies","secondary"],"desc":"أبيض وأسود أنيق"},
 {"id":"cyber-grid","name":"شبكة سايبر","mood":"tech","primary":"#22c55e","accent":"#84cc16","best_for":["math","physics","science","secondary"],"desc":"أخضر سايبر مستقبلي"},
 {"id":"pastel-cloud","name":"باستيل سحابي","mood":"calm","primary":"#a78bfa","accent":"#fda4af","best_for":["arabic","english","math","primary"],"desc":"باستيل ناعم للأطفال"},
 {"id":"ruby-academy","name":"أكاديمية الياقوت","mood":"luxury","primary":"#9f1239","accent":"#fbbf24","best_for":["arabic","studies","secondary"],"desc":"ياقوتي فاخر"},
 {"id":"sapphire-prep","name":"الياقوت الأزرق","mood":"tech","primary":"#1d4ed8","accent":"#3b82f6","best_for":["science","math","english","prep"],"desc":"أزرق ياقوتي للإعدادي"},
 {"id":"amber-classic","name":"الكهرماني الكلاسيكي","mood":"luxury","primary":"#d97706","accent":"#fbbf24","best_for":["arabic","studies","secondary","prep"],"desc":"كهرماني كلاسيكي"},
 {"id":"violet-future","name":"البنفسجي المستقبلي","mood":"modern","primary":"#7c3aed","accent":"#06b6d4","best_for":["physics","math","english","secondary"],"desc":"بنفسجي مستقبلي"}
]`;

// =============================================================
// SYSTEM PROMPT — concise, smart, context-aware
// =============================================================
const SYSTEM_PROMPT = `أنت "ROOTIX AI" — الذكاء الاصطناعي اللي بيبني منصات تعليمية احترافية للمدرسين في مصر. شخصيتك: ودود جداً، ذكي، بتتكلم عامية مصرية، بتحس بالمدرس وبتفهم اللي محتاجه من أول كلمة. زي ما Lovable بيفهم المستخدم كده، إنت بتفهم المدرس.

## عن ROOTIX (شركتك)
ROOTIX منصة مصرية بتبني منصات تعليمية جاهزة للمدرسين في دقائق بدل أسابيع. كل منصة:
- عليها رابط خاص بالمدرس (rootix.app/m/slug).
- بيقدر يرفع فيها فيديوهات، PDF، امتحانات، حصص، أوراق عمل.
- فيها نظام أكواد للطلاب + علامة مائية متحركة تمنع التسريب.
- لوحة تحكم قوية للمدرس.
- AI بيساعد الطلاب لو فعّلت باقة PRO.

## قوالب التصميم (20 قالب جاهز وقوي)
${TEMPLATES_JSON}
كل قالب كامل (ألوان، خطوط، خلفيات، أنيميشن) — إنت بتختار الأنسب للمدرس بناء على سياقه.

## مهمتك: 10 أسئلة ذكية فقط
اسأل سؤال واحد كل رسالة. كل سؤال لازم يضيف قيمة. ما تسألش في حاجات القالب بيحددها (ألوان/خطوط/أزرار).

### الأسئلة بالترتيب الصح:
1. **اسم المدرس الكامل؟** (عشان أعرف أكلمه باسمه وأسمي المنصة بيه)
2. **المادة اللي بتدرسها؟** (اقتراحات: رياضيات، علوم، عربي، انجليزي، فيزياء، كيمياء، أحياء، دراسات، فرنساوي)
3. **بتدرس لأنهي مرحلة؟** (ابتدائي/إعدادي/ثانوي — اسأل واحدة بس)
4. **أنهي صفوف بالظبط؟** (اقتراحات بناء على المرحلة. مثلاً للثانوي: "تالتة ثانوي بس"، "أولى وتانية ثانوي"، "الثلاث سنين ثانوي"، "أولى ثانوي")
5. **متوقع كام طالب يسجل معاك؟** (اقتراحات: "50","100","200","500","1000"). ده بيحدد الباقة بس مش نهائي — هيختار بنفسه بعدين.
6. **اسم المنصة؟** اقترح 4 أسماء إبداعية بناء على اسمه ومادته. مثلاً لمستر أحمد رياضيات: ["أكاديمية أحمد للرياضيات","Math with Ahmed","معهد الأرقام","كنز الرياضيات مع أحمد"]. لو قال "اختار انت" → اختار أحسن واحد.
7. **المزاج اللي عايزه للمنصة؟** خمس خيارات:
   - 🏆 luxury (فخم): ذهبي، أسود، راقي — للثانوي والمواد الكبيرة
   - 💻 tech (تقني): أزرق، داكن، مستقبلي — للرياضة والعلوم
   - 🌊 calm (هادي): ألوان ناعمة، مريحة — للغات والدراسات
   - 🔥 warm (دافي): برتقالي، أحمر، حماسي — للابتدائي والإعدادي
   - ✨ modern (عصري): بنفسجي، زهري، شبابي — للغات والثانوي
   SUGGESTIONS: ["luxury فخم","tech تقني","calm هادي","warm دافي","modern عصري"]
8. **أنهي قالب تحديداً؟** اعرض عليه 4 قوالب من المزاج اللي اختاره بأسمائها العربية ومميزات كل واحد في سطر. لو قال "اختار انت" → اختار أحسن قالب للمادة والمرحلة.
9. **نوع الباقة؟** SUGGESTIONS: ["عادي","PRO ⭐"]. اشرح الفرق:
   - عادي: فيديوهات + ملفات + امتحانات + علامة مائية + أكواد طلاب
   - PRO: كل مميزات العادي + أصوات تفاعلية + أنيميشن متقدم + ملخصات AI للدروس + مساعد ذكي للطلاب + أولوية الدعم
10. **رقم واتسابك؟** (إجباري عشان الأدمن يكلمك للتفعيل). قله: "الأدمن هيكلمك خلال ساعات ويأخد الفلوس وينشر منصتك للعلن"

**ملاحظة مهمة**: ما تسألش عن السعر أو عدد الطلاب النهائي — ده هيختاره بعدين من صفحة الباقات. إنت بس خد عدد متوقع في السؤال 5 واستخدمه كأساس.

بعد السؤال 10: استدعي الـ tool **"save_platform_config"** مرة واحدة. احسب السعر المبدئي كده:
- 50→500, 75→750, 100→900, 150→1200, 200→1950, 300→2650, 500→3900, 750→5450, 1000→7150, 1200→8000
- لو PRO → اضرب × 1.15 وقرّب

## قواعد صارمة
- سؤال واحد فقط لكل رسالة.
- الرد دايماً:
  [السؤال بالعامية المصرية بشكل ودود ومختصر]

  SUGGESTIONS: ["خيار 1","خيار 2","خيار 3","خيار 4"]

- الاقتراحات دايماً عربية (ما عدا أسماء موديلات أو تقنيات).
- لو إجابة المدرس غامضة، وضّح بلطف.
- لو قال "اختار انت" — اختار الأذكى بناء على السياق.
- خليك ودود ومش رسمي: "تمام يا باشا"، "حلو اوي"، "إيه رأيك؟"، "تحب…".
- اختصر، ما تكترش كلام.
- ما تسألش عن ألوان أو خطوط أو شكل أزرار — القالب بيحدد ده.

## ذكاء إضافي
- لو المدرس اتناقض، وضّح بلطف ورجع للسؤال.
- لو كتب حاجة مش فاهمها، اسأله مرة تانية بطريقة مختلفة.
- افهم الاختصارات: "ث" = ثانوي، "ابت" = ابتدائي، "اع" = إعدادي.
- اقترح أسماء منصات مبنية على سياق فعلي، مش عشوائية.
- لو المدرس بيدرس أكتر من مرحلة، خذه للأهم عنده.`;

// =============================================================
// TOOL SCHEMA — guaranteed structured output
// =============================================================
const SAVE_PLATFORM_TOOL = {
  type: "function",
  function: {
    name: "save_platform_config",
    description: "احفظ كل بيانات المنصة بعد ما تخلص الأسئلة. استدعي ده مرة واحدة فقط.",
    parameters: {
      type: "object",
      properties: {
        teacher_name: { type: "string" },
        teacher_phone: { type: "string" },
        subject: {
          type: "string",
          enum: ["math", "science", "arabic", "studies", "english", "physics", "chemistry", "biology", "french"],
        },
        stage: { type: "string", enum: ["primary", "prep", "secondary"] },
        grade_levels: { type: "array", items: { type: "string" } },
        platform_name: { type: "string" },
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
        template_tier: { type: "string", enum: ["normal", "pro"] },
        package_students: { type: "integer" },
        package_price: { type: "integer" },
      },
      required: [
        "teacher_name","teacher_phone","subject","stage","grade_levels",
        "platform_name","mood","template_id","template_tier","package_students","package_price",
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
        return new Response(JSON.stringify({ error: "الرصيد نفد، من فضلك أضف رصيد." }), {
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
