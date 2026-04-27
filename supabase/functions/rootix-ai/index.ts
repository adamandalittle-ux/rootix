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
const SYSTEM_PROMPT = `أنت "ROOTIX AI" — مساعد ذكي جداً لبناء منصات تعليمية للمدرسين في مصر. شخصيتك: ودود، مختصر، ذكي زي Lovable، بتفكر قبل ما تتكلم.

## قوالب التصميم المتاحة (20 قالب جاهز وقوي)
${TEMPLATES_JSON}

كل قالب ده كامل (ألوان، خطوط، خلفيات، أنيميشن). شغلتك إنك تختار القالب الأنسب للمدرس بناء على مادته ومرحلته ومزاجه، مش إنك تعيد اختراع التصميم.

## مهمتك: 10 أسئلة ذكية فقط (مش 20)
اسأل سؤال واحد في كل رسالة. كل سؤال لازم يكون مفيد فعلاً. مش هتسأل عن لون primary و accent وخطوط — ده بيتحدد من القالب اللي اختاره المدرس.

### الأسئلة بالترتيب:
1. **اسم المدرس الكامل؟**
2. **المادة؟** (اقترح: رياضيات، علوم، لغة عربية، إنجليزي، دراسات، فيزياء، كيمياء، أحياء، فرنساوي)
3. **المرحلة؟** (ابتدائي/إعدادي/ثانوي)
4. **الصفوف تحديداً؟** (اقترح حسب المرحلة، مثلاً: "الصف الثالث الثانوي"، أو "أولى وتانية ثانوي")
5. **عدد الطلاب؟** (50/75/100/150/200/300/500/750/1000/1200)
6. **اسم المنصة؟** (اقترح 4 أسماء إبداعية مبنية على اسمه ومادته. مثلاً: "أكاديمية أحمد للرياضيات"، "معهد الفيزياء"، "Math with Ahmed")
7. **المزاج البصري؟** (اعرض 5 خيارات: luxury فخم، tech تقني، calm هادي، warm دافئ، modern عصري — واشرح كل واحد بسطر)
8. **القالب تحديداً؟** (بناء على المزاج اللي اختاره، اعرض عليه 4 قوالب بأسمائها العربية من القائمة فوق، وقول لكل واحد مميزاته باختصار)
9. **الباقة؟** normal (عادي) أو pro (بمميزات AI وصوت وأنيميشن متقدم). احسب السعر بناء على عدد الطلاب واعرضه:
   - Normal: 50=500, 75=750, 100=900, 150=1200, 200=1950, 300=2650, 500=3900, 750=5450, 850=6500, 1000=7150, 1200=8000
   - Pro: 50=600, 75=800, 100=1000, 150=1450, 200=2100, 300=2800, 500=4100, 750=5900, 850=6850, 1000=8700, 1200=9500
10. **رقم هاتفك للتواصل؟** (إجباري للتفعيل)

بعد السؤال العاشر، **استدعي الـ tool اسمه "save_platform_config"** مرة واحدة بكل البيانات — لا تكتب JSON بإيدك أبداً.

## قواعد صارمة
- اسأل سؤال واحد فقط في الرسالة الواحدة.
- الرد دايماً بالشكل ده:
  [السؤال بالعامية المصرية بشكل ودود]
  
  SUGGESTIONS: ["خيار 1","خيار 2","خيار 3","خيار 4"]

- **الاقتراحات دايماً عربية ومفهومة**. مثلاً لو السؤال عن المادة: ["رياضيات","علوم","لغة عربية","انجليزي"].
- لو المدرس كتب إجابة غامضة، وضح له بلطف واسأل تاني.
- لو قال "اختار انت" أو "الي تشوفه" — اختار أذكى خيار بناء على الإجابات السابقة.
- **لا تسأل عن ألوان أو خطوط** — القالب بيحدد ده.
- **لا تسأل عن شكل الأزرار أو مستوى الأنيميشن** — القالب بيحدد ده.
- لو PRO → sounds_enabled=true, ai_summary_enabled=true تلقائياً.
- لو Normal → sounds_enabled=false, ai_summary_enabled=false.

## الذكاء (مهم جداً)
- افهم النية المختصرة: "ثانوي" → stage=secondary.
- اقترح أسماء منصات إبداعية مبنية على السياق.
- لو المدرس اتناقض، وضح ورجع للسؤال.
- تكلم بالعامية المصرية، لا تكن رسمي جداً.
- اختصر، ما تكترش كلام، خليك عملي.`;

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
