// Rooty — مساعد المدرس الشخصي. شات مفتوح + أعمال + إصلاح أخطاء غير محدودة.
// يستخدم Google Gemini API مباشرة (gemini-flash-latest).
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const SYSTEM_PROMPT = `أنت "Rooty" — مساعد شخصي ذكي للمدرس داخل منصته على ROOTIX.

## شخصيتك:
- مصري، ودود، عملي، مهذب، شارح بتفاصيل لما يلزم.
- اسمك Rooty (ليس ROOTIX). أنت مختلف عن AI بناء المنصات.

## ⛔ قاعدة صارمة جداً (نطاق المنصة):
- المنصة دي مخصصة لمادة محددة وصفوف محددة (هتلاقيها في معلومات المنصة تحت).
- ❌ ممنوع منعاً باتاً تكتب أي سؤال أو امتحان أو فيديو أو محتوى من **مادة تانية غير مادة المنصة**.
   مثال: لو المنصة "لغة عربية" → ممنوع رياضيات/علوم/إنجليزي. لو المدرس طلب، اعتذر بلطف وقوله: "المنصة دي مخصصة للغة العربية بس، مينفعش أضيف رياضيات".
- ❌ ممنوع تضيف محتوى لصف **مش موجود في صفوف المنصة**. لو المدرس قال صف غير مدرج، اسأله يختار من الصفوف المتاحة.
- ✅ التزم 100% بمادة المنصة وصفوفها في كل عمل.

## قواعد الذهب:
- ردك واضح ومفيد. لو محتاج تشرح، اشرح. لو السؤال بسيط، رد مختصر.
- لا تكتب أكواد برمجية للمدرس.
- لا تغير شكل المنصة أو ألوانها.

## صلاحياتك (غير محدودة، استخدمها بحرية داخل نطاق المنصة):
1. \`add_question\` — إضافة سؤال لبنك الأسئلة (في مادة المنصة فقط).
2. \`add_exam\` — إضافة امتحان كامل (في مادة المنصة فقط).
3. \`add_video\` — إضافة فيديو.
4. \`add_pdf\` — إضافة ملف PDF.
5. \`fix_platform\` — إصلاح المنصة تلقائياً.
6. \`delete_content\` — حذف محتوى محدد بالاسم.

## مهم:
- "حط 10 أسئلة" → \`add_exam\` واحد فيه 10 أسئلة (مش 10 add_question).
- "صلح الأخطاء" → \`fix_platform\`.
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
    description: "أضف فيديو للمنصة. يدعم يوتيوب وروابط مباشرة.",
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
  {
    name: "fix_platform",
    description: "إصلاح أخطاء المنصة: مسح المحتوى المكسور (بدون عنوان أو بدون صف)، توحيد البيانات.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "delete_content",
    description: "حذف محتوى بناءً على عنوان جزئي. استخدمها فقط لو المدرس طلب صراحة.",
    parameters: {
      type: "object",
      properties: { title_contains: { type: "string" } },
      required: ["title_contains"],
    },
  },
];

const ACTION_NAMES = new Set(["add_question", "add_exam", "add_video", "add_pdf", "fix_platform", "delete_content"]);

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

كل أعمالك (إضافة محتوى/إصلاح/حذف) غير محدودة.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;
    const body = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT + "\n\n" + contextMsg }] },
      contents: toGeminiContents(messages),
      tools: [{ functionDeclarations: FUNCTION_DECLS }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 2000 },
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

        if (name === "fix_platform") {
          // Delete broken content (empty title or no grade)
          const { data: items } = await sb.from("content").select("id,title,grade_level,kind,data").eq("platform_id", platform_id);
          const broken = (items || []).filter((i: any) =>
            !i.title || !i.title.trim() || !i.grade_level ||
            ((i.kind === "video" || i.kind === "pdf") && !i.data?.url) ||
            ((i.kind === "exam" || i.kind === "question") && !(i.data?.questions?.length))
          );
          if (broken.length) {
            await sb.from("content").delete().in("id", broken.map((b: any) => b.id));
          }
          executedActions.push({ name, ok: true, title: `تم تنظيف ${broken.length} عنصر مكسور` });
          await sb.from("rooty_actions").insert({ platform_id, action_type: name, description: `cleaned ${broken.length}`, payload: {} });
          continue;
        }

        if (name === "delete_content") {
          const q = String(args.title_contains || "").trim();
          if (!q) { executedActions.push({ name, ok: false, error: "no query" }); continue; }
          const { data: items } = await sb.from("content").select("id,title").eq("platform_id", platform_id).ilike("title", `%${q}%`);
          if (items?.length) {
            await sb.from("content").delete().in("id", items.map((i: any) => i.id));
          }
          executedActions.push({ name, ok: true, title: `حذف ${items?.length || 0} عنصر يحتوي "${q}"` });
          await sb.from("rooty_actions").insert({ platform_id, action_type: name, description: q, payload: args });
          continue;
        }

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
