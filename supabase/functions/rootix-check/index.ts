// ROOTIX AI Health Checker — verifies a platform is properly built and fixes simple issues.
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const VALID_TEMPLATES = [
  "royal-gold","midnight-tech","ocean-calm","sunset-warm","neon-modern",
  "emerald-lux","crimson-power","sakura-soft","desert-sand","arctic-ice",
  "galaxy-deep","forest-earth","coral-reef","mono-editorial","cyber-grid",
  "pastel-cloud","ruby-academy","sapphire-prep","amber-classic","violet-future",
];

const VALID_SUBJECTS = ["math","science","arabic","studies","english","physics","chemistry","biology","french"];
const VALID_STAGES = ["primary","prep","secondary"];

interface CheckResult {
  ok: boolean;
  issues: { code: string; severity: "error" | "warn" | "info"; msg: string; fixed?: boolean }[];
  fixes_applied: string[];
  summary: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { platform_id } = await req.json();
    if (!platform_id) {
      return new Response(JSON.stringify({ error: "platform_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: p, error } = await supabase.from("platforms").select("*").eq("id", platform_id).maybeSingle();
    if (error || !p) {
      return new Response(JSON.stringify({ error: "Platform not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result: CheckResult = { ok: true, issues: [], fixes_applied: [], summary: "" };
    const updates: Record<string, any> = {};
    const cfg = (p.config as any) || {};

    // 1) Slug must be English-only
    const slugOk = /^[a-z0-9-]+$/.test(p.slug);
    if (!slugOk) {
      result.issues.push({ code: "SLUG_INVALID", severity: "error", msg: "الرابط فيه حروف عربية أو رموز ممنوعة — هيتم إصلاحه أوتوماتيك", fixed: true });
      const AR_TO_EN: Record<string, string> = {
        "ا":"a","أ":"a","إ":"e","آ":"a","ب":"b","ت":"t","ث":"th","ج":"g","ح":"h","خ":"kh",
        "د":"d","ذ":"z","ر":"r","ز":"z","س":"s","ش":"sh","ص":"s","ض":"d","ط":"t","ظ":"z",
        "ع":"a","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ي":"y","ى":"a","ة":"a","ئ":"e","ؤ":"o"," ":"-",
      };
      let s = p.slug.toLowerCase().split("").map((c: string) => AR_TO_EN[c] ?? c).join("");
      s = s.replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      if (!s || s.length < 2) s = "platform";
      if (s.length > 25) s = s.slice(0, 25).replace(/-$/, "");
      updates.slug = s;
      result.fixes_applied.push(`الرابط اتغير لـ "${s}"`);
    }

    // 2) Template must exist
    const tplId = cfg.template_id || cfg.template?.id;
    if (!tplId || !VALID_TEMPLATES.includes(tplId)) {
      result.issues.push({ code: "TEMPLATE_MISSING", severity: "error", msg: "القالب غير صحيح — هيتم تعيين قالب افتراضي", fixed: true });
      const fallback = "midnight-tech";
      updates.config = { ...cfg, template_id: fallback };
      result.fixes_applied.push(`تم تعيين قالب "${fallback}"`);
    }

    // 3) Subject + stage validation
    if (!VALID_SUBJECTS.includes(p.subject)) {
      result.issues.push({ code: "SUBJECT_INVALID", severity: "warn", msg: `المادة "${p.subject}" غير معروفة` });
    }
    if (!VALID_STAGES.includes(p.stage)) {
      result.issues.push({ code: "STAGE_INVALID", severity: "warn", msg: `المرحلة "${p.stage}" غير معروفة` });
    }

    // 4) Grade levels not empty
    const grades = Array.isArray(p.grade_levels) ? p.grade_levels : [];
    if (grades.length === 0) {
      result.issues.push({ code: "GRADES_EMPTY", severity: "warn", msg: "لم يتم تحديد الصفوف الدراسية" });
    }

    // 5) Platform name exists
    if (!cfg.platform_name || cfg.platform_name.length < 2) {
      result.issues.push({ code: "NAME_MISSING", severity: "error", msg: "اسم المنصة فاضي — هيتم تعيين اسم افتراضي", fixed: true });
      const fallback = `منصة ${p.teacher_name || "تعليمية"}`;
      updates.config = { ...(updates.config || cfg), platform_name: fallback, logo_text: fallback.charAt(0) };
      result.fixes_applied.push(`تم تعيين الاسم "${fallback}"`);
    }

    // 6) Colors present
    if (!cfg.primary_color && !cfg.template?.primary_color) {
      result.issues.push({ code: "COLORS_MISSING", severity: "warn", msg: "ألوان المنصة غير محددة" });
    }

    // 7) Slug uniqueness (warn if duplicate exists)
    const targetSlug = updates.slug || p.slug;
    const { data: dupes } = await supabase
      .from("platforms")
      .select("id")
      .eq("slug", targetSlug)
      .neq("id", platform_id);
    if (dupes && dupes.length > 0) {
      result.issues.push({ code: "SLUG_DUPLICATE", severity: "error", msg: "الرابط مستخدم في منصة أخرى — هيتم تغييره", fixed: true });
      updates.slug = targetSlug + "-" + Math.random().toString(36).slice(2, 5);
      result.fixes_applied.push(`الرابط النهائي: "${updates.slug}"`);
    }

    // Apply fixes
    if (Object.keys(updates).length > 0) {
      const { error: upErr } = await supabase.from("platforms").update(updates).eq("id", platform_id);
      if (upErr) {
        result.issues.push({ code: "FIX_FAILED", severity: "error", msg: "فشل تطبيق الإصلاحات: " + upErr.message });
        result.ok = false;
      }
    }

    // Summary
    const errors = result.issues.filter((i) => i.severity === "error" && !i.fixed).length;
    const warnings = result.issues.filter((i) => i.severity === "warn").length;
    result.ok = errors === 0;

    if (result.issues.length === 0) {
      result.summary = "✅ كل حاجة تمام! المنصة جاهزة 100% ومفيش أي مشكلة.";
    } else if (result.ok) {
      result.summary = `✅ المنصة سليمة. تم إصلاح ${result.fixes_applied.length} مشكلة أوتوماتيك${warnings ? ` + ${warnings} تنبيه بسيط` : ""}.`;
    } else {
      result.summary = `⚠️ في ${errors} مشكلة محتاجة مراجعة يدوية.`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("rootix-check error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
