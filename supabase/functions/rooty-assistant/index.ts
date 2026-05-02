// Rooty — مساعد المدرس الشخصي. شات مفتوح + أعمال غير محدودة.
// يستخدم Google Gemini API مباشرة (gemini-flash-latest).
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const SYSTEM_PROMPT = `أنت "Rooty" — مساعد شخصي ذكي للمدرس داخل منصته على ROOTIX.

## شخصيتك:
- مصري، ودود، عملي، مهذب.
- اسمك Rooty (ليس ROOTIX). أنت مختلف عن AI بناء المنصات.

## قواعد الذهب:
- ردك مختصر وواضح. لو محتاج تفصيل اعمله بدون رغي.
- لا تكتب أكواد برمجية للمدرس.
- لا تغير شكل المنصة أو ألوانها.

## صلاحياتك (غير محدودة):
1. إضافة سؤال لبنك الأسئلة → \`add_question\`
2. إضافة امتحان كامل → \`add_exam\`
3. إضافة فيديو (لو المدرس أعطاك رابط) → \`add_video\`
4. إضافة PDF (لو المدرس أعطاك رابط) → \`add_pdf\`

## محادثات بدون عمل (غير محدودة):
- نصائح تربوية وطرق شرح.
- اقتراح أفكار لامتحانات.
- مساعدة في صياغة أسئلة.
- شرح مفاهيم تعليمية للمدرس.

## مهم جداً:
- قبل أي عمل → اسأل عن الصف المستهدف لو مش واضح.
- لما يقول "حط 10 أسئلة" → نفذها كلها بـ \`add_exam\` واحد (مش 10 add_question).
`;

const FUNCTION_DECLS = [
  {
    name: "add_question",
    description: "أضف سؤال واحد لبنك الأسئلة في المنصة.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        grade_level: { type: "string" },
        question: { type: "string" },
        options: { type: "array", items: { type: "string" } },
        correct: { type: "number" },
      },
      required: ["title", "grade_level", "question", "options", "correct"],
    },
  },
  {
    name: "add_exam",
    description: "أضف امتحان متعدد الأسئلة.",
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
          },
        },
      },
      required: ["title", "grade_level", "questions"],
    },
  },
  {
    name: "add_video",
    description: "أضف فيديو للمنصة. يحتاج رابط.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        grade_level: { type: "string" },
        url: { type: "string" },
        lesson: { type: "string" },
      },
      required: ["title", "grade_level", "url"],
    },
  },
  {
    name: "add_pdf",
    description: "أضف ملف PDF للمنصة. يحتاج رابط.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        grade_level: { type: "string" },
        url: { type: "string" },
      },
      required: ["title", "grade_level", "url"],
    },
  },
];

const ACTION_NAMES = new Set(["add_question", "add_exam", "add_video", "add_pdf"]);

function toGeminiContents(messages: Array<{ role: string; content: string }>) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

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
    const API_KEY = Deno.env.get("ROOTY_GEMINI_API_KEY");
    if (!API_KEY) throw new Error("ROOTY_GEMINI_API_KEY missing");

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    // Platform context
    const { data: platform } = await sb
      .from("platforms")
      .select("subject,stage,grade_levels,config")
      .eq("id", platform_id)
      .maybeSingle();

    const contextMsg = `معلومات المنصة:
- المادة: ${platform?.subject || "—"}
- المرحلة: ${platform?.stage || "—"}
- الصفوف: ${JSON.stringify(platform?.grade_levels || [])}
- اسم المنصة: ${platform?.config?.platform_name || "—"}

ملاحظة: الأعمال (إضافة أسئلة/امتحانات/فيديو/PDF) غير محدودة، نفذها متى طلب المدرس.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;
    const body = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT + "\n\n" + contextMsg }] },
      contents: toGeminiContents(messages),
      tools: [{ functionDeclarations: FUNCTION_DECLS }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 1500 },
    };

    const aiResp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("Gemini error:", aiResp.status, t);
      const status = aiResp.status === 429 ? 429 : aiResp.status === 403 ? 402 : 500;
      const msg = status === 429 ? "كتير أوي. استنى دقيقة." : status === 402 ? "مفتاح API محدود." : "خطأ من Gemini.";
      return new Response(JSON.stringify({ error: msg }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const parts = aiData?.candidates?.[0]?.content?.parts || [];
    const executedActions: any[] = [];
    let textReply = "";

    for (const p of parts) {
      if (p.text) textReply += p.text;
      if (p.functionCall && ACTION_NAMES.has(p.functionCall.name)) {
        const name = p.functionCall.name;
        const args = p.functionCall.args || {};
        const title = args.title || "بدون عنوان";
        const grade_level = args.grade_level || (platform?.grade_levels?.[0] ?? "");

        let kind = "";
        let data: any = {};
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
        // Log action (no daily limit, just tracking)
        await sb.from("rooty_actions").insert({
          platform_id, action_type: name, description: title, payload: args,
        });
        executedActions.push({ name, ok: true, title });
      }
    }

    const reply = textReply || (executedActions.length ? "تمام، اتنفذ ✅" : "...");

    return new Response(JSON.stringify({
      reply,
      actions: executedActions,
      remaining_today: 999,
      used_today: 0,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("rooty error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
