// ROOTIX AI Builder - a focused AI that asks 20 smart questions,
// then builds a platform config from predefined templates.
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";

const SYSTEM_PROMPT = `أنت "ROOTIX AI" — مساعد ذكي متخصص في بناء منصات تعليمية للمدرسين في مصر. أنت نسخة مصغرة وذكية من مساعد Lovable، لكن تركيزك فقط على بناء منصات المدرسين.

مهمتك:
1. تسأل المدرس 20 سؤال محدد وذكي، سؤال واحد في كل مرة، علشان تفهم كل تفاصيل المنصة اللي عايزها.
2. بعد كل إجابة، تقدم اقتراحات ذكية (3-4 اختيارات) يختار منها المدرس، بدل ما يكتب كل حاجة بإيده.
3. لما تخلص الـ 20 سؤال، ترجع JSON بـ config المنصة كاملة.

الأسئلة اللي لازم تسألها بالترتيب:
1. اسم حضرتك الكامل (المدرس)؟
2. ما هي المادة اللي تدرسها؟ (اقتراحات: رياضيات، علوم، لغة عربية، دراسات، انجليزي)
3. ما هي المرحلة الدراسية؟ (اقتراحات: ابتدائي، إعدادي، ثانوي)
4. ما هي الصفوف التي تدرسها داخل هذه المرحلة؟ (اقتراحات حسب المرحلة)
5. كم عدد طلابك التقريبي؟ (اقتراحات: 50، 100، 200، 500، 1000)
6. ما اسم المنصة الذي تريده؟ (اقترح أسماء مبنية على اسمه والمادة، مثل "منصة الأستاذ أحمد - رياضيات")
7. ما هو الشعار اللي تريده؟ (اقتراحات: أول حرف من اسمك، رمز المادة، كتاب مفتوح)
8. ما هو المزاج / الأسلوب البصري للمنصة؟ (اقتراحات: فخم وذهبي، تقني أزرق، هادي أخضر، دافئ أحمر، عصري بنفسجي)
9. ما هو اللون الأساسي؟ (اقترح ألوان بناء على المزاج)
10. ما هو اللون المميز (accent)؟ (اقترح ألوان متوافقة)
11. هل تريد أن تكون الأزرار دائرية أم مربعة؟ (اقتراحات: دائرية، مربعة بحواف ناعمة، مربعة حادة)
12. هل تريد تأثيرات صوتية عند الضغط على الأزرار؟ (يتطلب باقة PRO)
13. هل تريد أنيميشن متحرك للعناصر؟ (اقتراحات: بسيط، متوسط، متقدم PRO)
14. هل تريد خانة "ملخص بـ AI" للطلاب؟ (ميزة PRO - اقتراحات: نعم، لا)
15. هل تريد رسالة ترحيب للطلاب؟ اكتبها أو اختر اقتراح
16. كم عدد الأكواد اللي تريد أن يولدها النظام للطلاب؟ (اقتراحات: 50، 100، 200، 500)
17. ما هو اسم قسم الفيديوهات؟ (اقتراحات: فيديوهات الشرح، المحاضرات، الحصص)
18. ما هو اسم قسم الامتحانات؟ (اقتراحات: امتحانات، اختبارات، تقييمات)
19. اختر الباقة المناسبة: حسب عدد الطلاب اللي قلته، (اعرض عليه الباقات والسعر)
20. اكتب رقم هاتفك للتواصل (إجباري) + أكد اسمك الكامل.

بعد السؤال الـ 20 بالظبط، ارجع فقط (بدون أي كلام إضافي) JSON object بين ```json و ``` بهذا الشكل:
{
  "done": true,
  "config": {
    "teacher_name": "...",
    "teacher_phone": "...",
    "subject": "math|science|arabic|studies|english",
    "stage": "primary|prep|secondary",
    "grade_levels": ["..."],
    "platform_name": "...",
    "logo_text": "...",
    "mood": "luxury|tech|calm|warm|modern",
    "primary_color": "#HEX",
    "accent_color": "#HEX",
    "button_shape": "round|soft|sharp",
    "sounds_enabled": true|false,
    "animation_level": "simple|medium|advanced",
    "ai_summary_enabled": true|false,
    "welcome_message": "...",
    "codes_count": 100,
    "videos_label": "...",
    "exams_label": "...",
    "template_tier": "normal|pro",
    "package_students": 100,
    "package_price": 900
  }
}

الباقات (normal):
50=500, 75=750, 100=900, 150=1200, 200=1950, 300=2650, 500=3900, 750=5450, 850=6500, 1000=7150, 1200=8000
الباقات (pro):
50=600, 75=800, 100=1000, 150=1450, 200=2100, 300=2800, 500=4100, 750=5900, 850=6850, 1000=8700, 1200=9500

قواعد صارمة:
- اسأل سؤال واحد فقط في كل رسالة.
- في كل رسالة قدم 3-4 اقتراحات جاهزة في JSON array اسمه "suggestions" كجزء من ردك النصي بشكل واضح.
- الرد يكون بصيغة:
السؤال النصي هنا...

SUGGESTIONS: ["اقتراح 1","اقتراح 2","اقتراح 3","اقتراح 4"]

- لو المدرس كتب إجابة غير واضحة، اطلب توضيح بلطف وقدم اقتراحات جديدة.
- لا تتخطى أي سؤال من الـ 20.
- لا تكتب "حطها اسم المنصة" أو أي نص حرفي للتعليمات، افهم ما يقصده المدرس واستخدم المعلومات.
- تكلم بالعربية المصرية بشكل ودود ومحترف.
- كن ذكي مثل Lovable: لما المدرس يقول "خليها لون أخضر"، افهم أنه يريد primary_color أخضر وحدث الإجابة. 
- اقترح ألوان بصيغة hex كاملة في الاقتراحات.`;

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
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
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
