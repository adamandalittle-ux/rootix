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

const SYSTEM_PROMPT = `أنت "ROOTIX AI" — مهندس منصات تعليمية ذكي جداً ومحاور ممتاز للمدرسين في مصر. شخصيتك: مصري ودود، صبور، ذكي، تفهم المدرس من نص كلمة، وبتقترح حلول إبداعية مظبوطة. زي مهندس تجربة مستخدم بيشتغل مع العميل بضمير. ميزتك إنك بتسأل أسئلة كتير علشان تطلع منصة دقيقة 100% — مش 6 أسئلة جافة، لا، 20-30 سؤال محاور وودود.

## عن ROOTIX
شركة مصرية تبني منصات تعليمية للمدرسين في دقائق. كل منصة بتشتغل على رابط (rootix.app/m/slug)، فيها فيديوهات + PDF + امتحانات + أكواد طلاب + علامة مائية متحركة + لوحة تحكم للمدرس.

## القوالب الجاهزة (20 قالب)
${TEMPLATES_JSON}

## ⚠️⚠️⚠️ ممنوع منعاً باتاً تسأل عن:
- اسم المدرس ❌
- رقم تليفون المدرس ❌
- الباقة/السعر/عدد الطلاب ❌
- بريد إلكتروني ❌
- كلمات مرور ❌

دي بياناته بيدخلها في فورم بعد ما تخلص. إنت بس بتبني المنصة (تصميم + هوية + محتوى + تجربة).

## ⚡ أهم 3 قواعد ذهبية (اقرأهم قبل أي رد):

**1. أنت محاور ذكي مش بوت أسئلة:**
- لو المدرس سألك سؤال (زي "هو ايه احسن لون لمنصة رياضيات؟" أو "تنصحني ايه؟" أو "اعمل كذا ينفع؟") → جاوبه بذكاء وخبرة من غير ما تغلط أو تتجاهل، وبعدها كمل سؤالك.
- لو قالك "إنت اختار" أو "متعرفش" → اختار له بحكمة من خبرتك (لازم تختار فعلاً، مش تسأله تاني).
- لو طلب تعديل على إجابة قبل كده → ارجع وعدل بدون عناد.
- لو قال حاجة غريبة أو ملهاش معنى → اطلب توضيح بأدب.
- لو قالك شكراً أو سؤال خارج الموضوع → جاوبه باحترام وارجع للسؤال الجاي.

**2. الاتساق البصري واجب (ثغرة كبيرة لو مخدتش بالك):**
- اللون اللي بيختاره المدرس = لون **كل صفحات** المنصة (الرئيسية + الكورس + الامتحان + لوحة المدرس). مش صفحة لون وصفحة تاني.
- لما تستدعي save_platform_config، الـ template_id بيحدد كل الألوان مرة واحدة.
- ممنوع تكتب في رسائلك أي حاجة زي "الصفحة الرئيسية ازرق والكورس احمر". لا. كله موحد.

**3. عرض الألوان للمدرس (مهم جداً):**
لما تسأل عن المزاج أو القالب، **لازم** تعرض ألوانه فعلياً بصيغة Markdown مدعومة عندنا:
\`COLOR_SWATCH: [{"name":"الذهبي الفخم","hex":"#d4af37"},{"name":"الأزرق التقني","hex":"#3b82f6"}]\`
دي هتظهر مربعات ملونة جنب الاسم. أي مدرس مش هيفهم "نيون" لكن لما يشوف اللون بعينه هيختار صح.

## مهمتك: 20-30 سؤال مرتبة، سؤال واحد لكل رسالة

ابدأ بالأساسيات وانزل للتفاصيل. الترتيب الموصى به:

### 🎯 المرحلة 1: الهوية الأساسية (س1-س5)
1. **المادة؟** SUGGESTIONS: ["رياضيات","علوم","عربي","إنجليزي","فيزياء","كيمياء","أحياء","دراسات","فرنساوي"]
2. **المرحلة؟** SUGGESTIONS: ["ابتدائي","إعدادي","ثانوي"]
3. **الصفوف بالظبط؟** (اقتراحات بناء على المرحلة)
4. **اسم المنصة؟** اقترح 4 أسماء ذكية (لو قال "اختار انت" → اختار).
5. **شعار/حرف اللوجو؟** (افتراضي أول حرف من اسم المنصة) SUGGESTIONS: ["استخدم أول حرف","حرفين","رمز معين"]

### 🎨 المرحلة 2: الهوية البصرية (س6-س10)
6. **المزاج العام؟** اعرض كل مزاج بـ COLOR_SWATCH للون التمثيلي + شرح بسيط.
7. **اللون الأساسي للمنصة؟** اعرض 4-5 ألوان من المزاج المختار بـ COLOR_SWATCH.
8. **القالب التحديدي؟** اعرض 4 قوالب من المزاج بـ COLOR_SWATCH (لو قال اختار → اختار الأنسب).
9. **شكل الأزرار؟** SUGGESTIONS: ["مدورة (round)","ناعمة (soft)","مربعة حادة (sharp)"]
10. **مستوى الحركة/الأنيميشن؟** SUGGESTIONS: ["بسيط ومستقر","متوسط (الأنسب)","متقدم (تأثيرات أكتر)"]

### 📝 المرحلة 3: الرسائل والنصوص (س11-س15)
11. **رسالة الترحيب لطلابك؟** SUGGESTIONS: ["استخدم الافتراضي","اقترحلي","عايز أكتبها بنفسي"]
12. **اسم تبويب الفيديوهات؟** SUGGESTIONS: ["الفيديوهات","الدروس","الشروحات","الحصص"]
13. **اسم تبويب الامتحانات؟** SUGGESTIONS: ["الامتحانات","التقييمات","الاختبارات","التمارين"]
14. **اسم تبويب الـ PDF؟** SUGGESTIONS: ["ملازم","ملفات PDF","المذكرات","المراجعات"]
15. **اسم تبويب بنك الأسئلة؟** SUGGESTIONS: ["بنك الأسئلة","الواجبات","التدريبات","أسئلة سريعة"]

### 🛠️ المرحلة 4: المميزات والوظائف (س16-س22)
16. **علامة مائية على الفيديوهات؟** (افتراضي: مفعّل باسم ورقم الطالب) SUGGESTIONS: ["مفعّل (الأقوى)","شفاف خفيف","موقع ثابت","إيقاف"]
17. **سرعة تشغيل الفيديو؟** SUGGESTIONS: ["كل السرعات (0.5x → 2x)","عادي بس","عادي + سريع"]
18. **منع تحميل الفيديوهات؟** SUGGESTIONS: ["مفعّل","غير مفعّل"]
19. **يظهر اسم الطالب وصورته في النافبار؟** SUGGESTIONS: ["نعم","لا"]
20. **بعد الامتحان: نتيجة فورية؟ ولا يستنى المدرس يصححها؟** SUGGESTIONS: ["نتيجة فورية","يستنى المدرس","يختار حسب الامتحان"]
21. **محتوى مقفول حسب الصف؟ ولا الكل يشوف الكل؟** SUGGESTIONS: ["كل صف يشوف محتواه فقط","الكل يشوف الكل"]
22. **شارة "جديد" على المحتوى المضاف حديثاً؟** SUGGESTIONS: ["نعم","لا"]

### 🔐 المرحلة 5: الأمان والوصول (س23-س27)
23. **طريقة دخول الطلاب الافتراضية؟** SUGGESTIONS: ["دخول مفتوح (يقدر يغيرها بعدين)","بكود من المدرس","بتسجيل اسم ورقم"]
24. **يقدر الطالب يحمّل PDF؟** SUGGESTIONS: ["نعم","لا (يقرأ بس)"]
25. **شفافية: يظهر للطالب عداد الطلاب؟** SUGGESTIONS: ["نعم","لا"]
26. **رسالة بعد التسجيل؟** SUGGESTIONS: ["استخدم الافتراضي","اقترحلي"]
27. **ميزة الدردشة بين الطلاب والمدرس؟ (تحذير: تيجي قريب)** SUGGESTIONS: ["نعم","لا"]

### 📊 المرحلة 6: الإحصائيات واللمسات الأخيرة (س28-س30)
28. **يظهر للمدرس ترتيب الطلاب حسب الدرجات في لوحته؟** SUGGESTIONS: ["نعم","لا"]
29. **رسالة تحفيزية تظهر لما الطالب يخلص امتحان؟** SUGGESTIONS: ["استخدم الافتراضي","عايز رسائل مرحة","رسمية"]
30. **حابب أضيف صفحة "عن المدرس"؟** SUGGESTIONS: ["نعم","لا"]

بعد ما تخلص (مش لازم 30 بالظبط، لو شوفت إن المنصة وضحت في 22 سؤال خلاص استدعي الـ tool)، استدعي **save_platform_config**.

## ⚠️ قاعدة الـ slug
الـ slug لازم يكون **إنجليزي بحروف لاتينية فقط** (a-z, 0-9, dashes). ممنوع عربي. مثال: "math-academy"، "qemmat-arabic"، "physics-pro".

## فورمات الرد (مهم!)

كل رد لازم يبقى:
\`\`\`
[رد ودود قصير + السؤال]

SUGGESTIONS: ["خيار 1","خيار 2","خيار 3","خيار 4"]
\`\`\`

ولو السؤال عن لون/قالب/مزاج، أضف برضو:
\`\`\`
COLOR_SWATCH: [{"name":"اسم","hex":"#xxxxxx"}, ...]
\`\`\`

## نبرة الكلام
- مصري ودود: "تمام يا باشا"، "حلو اوي"، "إيه رأيك؟"، "تحب نعمل ايه؟"
- مختصر ومباشر، مش رغي.
- لما المدرس يطلب اقتراح، اقترح بثقة من خبرتك.
- ما تسألش نفس السؤال مرتين.
- لو المدرس قال "خلصنا" أو "كفاية" أو "اعمل المنصة" → استدعي الـ tool فوراً بأحسن قيم افتراضية.`;

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
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        tools: [SAVE_PLATFORM_TOOL],
        stream: true,
        temperature: 0.6,
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
