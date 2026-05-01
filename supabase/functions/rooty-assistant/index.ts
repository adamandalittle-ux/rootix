// Rooty — مساعد المدرس الشخصي. شات مفتوح + 5 أعمال تنفيذية في اليوم.
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const SYSTEM_PROMPT = `أنت "Rooty" — مساعد شخصي ذكي للمدرس داخل منصته على ROOTIX.

## شخصيتك:
- مصري، ودود، مختصر، عملي.
- اسمك Rooty (ليس ROOTIX). أنت مختلف عن AI بناء المنصات.
- تتكلم باللهجة المصرية بأسلوب مهذب.

## قواعد الذهب:
- ردك ≤ 250 حرف (إلا لو المدرس طلب تفصيل).
- جواب مباشر، بدون رغي.
- لا تكتب أكواد برمجية. لا تتكلم عن الكود الداخلي.
- لا تغير شكل المنصة أو ألوانها (هذه مش صلاحياتك).

## صلاحياتك (5 أعمال يومياً فقط):
1. إضافة سؤال لبنك الأسئلة → \`add_question\`
2. إضافة امتحان كامل → \`add_exam\`
3. إضافة فيديو (لو المدرس أعطاك رابط) → \`add_video\`
4. إضافة PDF (لو المدرس أعطاك رابط) → \`add_pdf\`

## محادثات بدون عمل (غير محدودة):
- نصائح تربوية وطرق شرح.
- اقتراح أفكار لامتحانات.
- مساعدة في صياغة أسئلة.
- شرح مفاهيم تعليمية للمدرس.
- الرد على أي استفسار.

## مهم جداً:
- قبل أي عمل (add_question / add_exam / add_video / add_pdf) → اسأل المدرس عن الصف المستهدف.
- لما المدرس يطلب "حط 10 أسئلة" → نفذها كلها بـ \`add_exam\` واحد (مش 10 add_question).
- لو خلصت 5 أعمال → قول له: "خلصت أعمال النهارده. نكمل بكره ✋ بس نقدر نتكلم نصايح عادي."
`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "add_question",
      description: "أضف سؤال واحد لبنك الأسئلة في المنصة. يستهلك 1 من 5 أعمال يومية.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "عنوان السؤال" },
          grade_level: { type: "string", description: "الصف المستهدف" },
          question: { type: "string" },
          options: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
          correct: { type: "number", description: "index الإجابة الصحيحة (0-based)" },
        },
        required: ["title", "grade_level", "question", "options", "correct"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_exam",
      description: "أضف امتحان متعدد الأسئلة. يستهلك 1 من 5 أعمال يومية.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          grade_level: { type: "string" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correct: { type: "number" },
              },
              required: ["question", "options", "correct"],
              additionalProperties: false,
            },
          },
        },
        required: ["title", "grade_level", "questions"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_video",
      description: "أضف فيديو للمنصة. يحتاج رابط من المدرس.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          grade_level: { type: "string" },
          url: { type: "string" },
          lesson: { type: "string" },
        },
        required: ["title", "grade_level", "url"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_pdf",
      description: "أضف ملف PDF للمنصة. يحتاج رابط من المدرس.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          grade_level: { type: "string" },
          url: { type: "string" },
        },
        required: ["title", "grade_level", "url"],
        additionalProperties: false,
      },
    },
  },
];

const ACTION_NAMES = new Set(["add_question", "add_exam", "add_video", "add_pdf"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { platform_id, messages } = await req.json();
    if (!platform_id) {
      return new Response(JSON.stringify({ error: "platform_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    // Count today's actions
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const { count: usedToday } = await sb
      .from("rooty_actions")
      .select("*", { count: "exact", head: true })
      .eq("platform_id", platform_id)
      .gte("created_at", start.toISOString());

    const remaining = Math.max(0, 5 - (usedToday || 0));

    // Get platform context (grades, subject)
    const { data: platform } = await sb.from("platforms").select("subject,stage,grade_levels,config").eq("id", platform_id).maybeSingle();

    const contextMsg = `معلومات المنصة:
- المادة: ${platform?.subject || "—"}
- المرحلة: ${platform?.stage || "—"}
- الصفوف المتاحة: ${JSON.stringify(platform?.grade_levels || [])}
- اسم المنصة: ${platform?.config?.platform_name || "—"}
- الأعمال المتبقية اليوم: ${remaining} من 5

${remaining === 0 ? "⚠️ المدرس استهلك أعمال اليوم. تكلم معاه عادي بس متعملش أي action." : ""}`;

    // Call AI Gateway (non-stream, so we can intercept tool calls and execute them)
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: contextMsg },
          ...messages,
        ],
        tools: remaining > 0 ? TOOLS : undefined,
        temperature: 0.5,
        max_tokens: 800,
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "كتير أوي. استنى دقيقة وحاول تاني." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "الرصيد نفد." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const choice = aiData.choices?.[0];
    const toolCalls = choice?.message?.tool_calls || [];
    const executedActions: any[] = [];
    let actionsUsed = 0;

    for (const tc of toolCalls) {
      if (actionsUsed + (usedToday || 0) >= 5) break; // safety
      const name = tc.function?.name;
      if (!ACTION_NAMES.has(name)) continue;
      let args: any = {};
      try { args = JSON.parse(tc.function.arguments || "{}"); } catch { continue; }

      let kind = "";
      let data: any = {};
      let title = args.title || "بدون عنوان";
      const grade_level = args.grade_level || (platform?.grade_levels?.[0] ?? "");

      if (name === "add_question") {
        kind = "question";
        data = { questions: [{ question: args.question, options: args.options, correct: args.correct }] };
      } else if (name === "add_exam") {
        kind = "exam";
        data = { questions: args.questions };
      } else if (name === "add_video") {
        kind = "video";
        data = { url: args.url };
      } else if (name === "add_pdf") {
        kind = "pdf";
        data = { url: args.url };
      }

      const { error: cErr } = await sb.from("content").insert({
        platform_id, kind, title, grade_level, lesson: args.lesson || null, data,
      });
      if (cErr) {
        executedActions.push({ name, ok: false, error: cErr.message });
        continue;
      }
      await sb.from("rooty_actions").insert({
        platform_id, action_type: name, description: title, payload: args,
      });
      actionsUsed++;
      executedActions.push({ name, ok: true, title });
    }

    const reply = choice?.message?.content || (executedActions.length ? "تمام، تنفذ ✅" : "...");

    return new Response(JSON.stringify({
      reply,
      actions: executedActions,
      remaining_today: Math.max(0, 5 - ((usedToday || 0) + actionsUsed)),
      used_today: (usedToday || 0) + actionsUsed,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("rooty error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
