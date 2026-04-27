// ROOTIX — 20 Strong Platform Templates
// Each template is a complete visual/UX recipe the AI can pick from.
// Colors are HEX (for config) — converted to HSL on apply via `applyTemplate`.

export type TemplateId =
  | "royal-gold"
  | "midnight-tech"
  | "ocean-calm"
  | "sunset-warm"
  | "neon-modern"
  | "emerald-lux"
  | "crimson-power"
  | "sakura-soft"
  | "desert-sand"
  | "arctic-ice"
  | "galaxy-deep"
  | "forest-earth"
  | "coral-reef"
  | "mono-editorial"
  | "cyber-grid"
  | "pastel-cloud"
  | "ruby-academy"
  | "sapphire-prep"
  | "amber-classic"
  | "violet-future";

export interface Template {
  id: TemplateId;
  name_ar: string;
  mood: "luxury" | "tech" | "calm" | "warm" | "modern";
  description: string;
  primary_color: string;      // HEX
  accent_color: string;       // HEX
  bg_color: string;           // HEX
  surface_color: string;      // HEX
  text_color: string;         // HEX
  muted_color: string;        // HEX
  font_heading: string;
  font_body: string;
  button_shape: "round" | "soft" | "sharp";
  animation_level: "simple" | "medium" | "advanced";
  best_for: string[];         // subjects/stages this template fits
}

export const TEMPLATES: Template[] = [
  {
    id: "royal-gold",
    name_ar: "الملكي الذهبي",
    mood: "luxury",
    description: "خلفية سوداء عميقة مع تدرج ذهبي فخم — مناسب لمدرسي اللغة العربية والفلسفة والثانوي.",
    primary_color: "#d4af37",
    accent_color: "#f4d03f",
    bg_color: "#0a0a0a",
    surface_color: "#1a1a1a",
    text_color: "#f5f5f5",
    muted_color: "#a3a3a3",
    font_heading: "Playfair Display, Amiri, serif",
    font_body: "Tajawal, sans-serif",
    button_shape: "soft",
    animation_level: "medium",
    best_for: ["arabic", "studies", "secondary"],
  },
  {
    id: "midnight-tech",
    name_ar: "ميدنايت تيك",
    mood: "tech",
    description: "أزرق داكن مع توهج كهربائي — مناسب لمدرسي الرياضيات والفيزياء والبرمجة.",
    primary_color: "#3b82f6",
    accent_color: "#06b6d4",
    bg_color: "#0f172a",
    surface_color: "#1e293b",
    text_color: "#f8fafc",
    muted_color: "#94a3b8",
    font_heading: "Space Grotesk, Cairo, sans-serif",
    font_body: "Inter, Cairo, sans-serif",
    button_shape: "soft",
    animation_level: "advanced",
    best_for: ["math", "physics", "science", "secondary"],
  },
  {
    id: "ocean-calm",
    name_ar: "المحيط الهادي",
    mood: "calm",
    description: "أزرق بحري هادي مع أخضر نعناعي — للغة الإنجليزية والدراسات.",
    primary_color: "#0891b2",
    accent_color: "#84a98c",
    bg_color: "#f0f9ff",
    surface_color: "#ffffff",
    text_color: "#0c4a6e",
    muted_color: "#64748b",
    font_heading: "Cairo, sans-serif",
    font_body: "Tajawal, sans-serif",
    button_shape: "round",
    animation_level: "simple",
    best_for: ["english", "studies", "prep"],
  },
  {
    id: "sunset-warm",
    name_ar: "غروب الشمس",
    mood: "warm",
    description: "برتقالي دافئ مع لمسة قرمزية — للأطفال والابتدائي.",
    primary_color: "#f97316",
    accent_color: "#dc2626",
    bg_color: "#fff8f0",
    surface_color: "#ffffff",
    text_color: "#431407",
    muted_color: "#78716c",
    font_heading: "Tajawal, sans-serif",
    font_body: "Tajawal, sans-serif",
    button_shape: "round",
    animation_level: "advanced",
    best_for: ["arabic", "math", "primary"],
  },
  {
    id: "neon-modern",
    name_ar: "نيون عصري",
    mood: "modern",
    description: "بنفسجي وزهري نيون على خلفية داكنة — لطلاب الثانوي والمراهقين.",
    primary_color: "#8b5cf6",
    accent_color: "#ec4899",
    bg_color: "#0c0a1e",
    surface_color: "#1e1b3a",
    text_color: "#f3f4f6",
    muted_color: "#a78bfa",
    font_heading: "Poppins, Cairo, sans-serif",
    font_body: "Poppins, Cairo, sans-serif",
    button_shape: "soft",
    animation_level: "advanced",
    best_for: ["english", "math", "secondary"],
  },
  {
    id: "emerald-lux",
    name_ar: "الزمرد الفاخر",
    mood: "luxury",
    description: "أخضر زمردي عميق مع ذهبي — راقي للعلوم والأحياء.",
    primary_color: "#10b981",
    accent_color: "#fbbf24",
    bg_color: "#022c22",
    surface_color: "#064e3b",
    text_color: "#ecfdf5",
    muted_color: "#6ee7b7",
    font_heading: "Playfair Display, Amiri, serif",
    font_body: "Tajawal, sans-serif",
    button_shape: "soft",
    animation_level: "medium",
    best_for: ["biology", "science", "secondary"],
  },
  {
    id: "crimson-power",
    name_ar: "القرمزي القوي",
    mood: "warm",
    description: "أحمر قرمزي جريء مع أسود — للمواد الصعبة والمدرسين الأقوياء.",
    primary_color: "#b91c1c",
    accent_color: "#fbbf24",
    bg_color: "#0f0f0f",
    surface_color: "#1c1917",
    text_color: "#fafaf9",
    muted_color: "#a8a29e",
    font_heading: "Tajawal, sans-serif",
    font_body: "Tajawal, sans-serif",
    button_shape: "sharp",
    animation_level: "medium",
    best_for: ["math", "physics", "chemistry", "secondary"],
  },
  {
    id: "sakura-soft",
    name_ar: "ساكورا الناعم",
    mood: "calm",
    description: "وردي ساكورا هادي مع أبيض — أنثوي مناسب لميس اللغات.",
    primary_color: "#ec4899",
    accent_color: "#f9a8d4",
    bg_color: "#fdf2f8",
    surface_color: "#ffffff",
    text_color: "#831843",
    muted_color: "#9ca3af",
    font_heading: "Cairo, sans-serif",
    font_body: "Tajawal, sans-serif",
    button_shape: "round",
    animation_level: "simple",
    best_for: ["arabic", "english", "french", "primary", "prep"],
  },
  {
    id: "desert-sand",
    name_ar: "رمال الصحراء",
    mood: "warm",
    description: "بيج رملي مع بني ذهبي — كلاسيكي للدراسات الاجتماعية.",
    primary_color: "#b45309",
    accent_color: "#d97706",
    bg_color: "#fef3c7",
    surface_color: "#fffbeb",
    text_color: "#451a03",
    muted_color: "#92400e",
    font_heading: "Amiri, serif",
    font_body: "Tajawal, sans-serif",
    button_shape: "soft",
    animation_level: "simple",
    best_for: ["studies", "arabic", "prep"],
  },
  {
    id: "arctic-ice",
    name_ar: "الثلج القطبي",
    mood: "tech",
    description: "أبيض جليدي مع أزرق سماوي — نظيف وعصري للعلوم.",
    primary_color: "#0ea5e9",
    accent_color: "#38bdf8",
    bg_color: "#f0f9ff",
    surface_color: "#ffffff",
    text_color: "#0c4a6e",
    muted_color: "#64748b",
    font_heading: "Inter, Cairo, sans-serif",
    font_body: "Inter, Cairo, sans-serif",
    button_shape: "soft",
    animation_level: "medium",
    best_for: ["science", "physics", "math", "prep"],
  },
  {
    id: "galaxy-deep",
    name_ar: "مجرة عميقة",
    mood: "modern",
    description: "أزرق كوني مع نجوم بنفسجية — إبداعي للثانوي.",
    primary_color: "#6366f1",
    accent_color: "#a855f7",
    bg_color: "#020617",
    surface_color: "#0f172a",
    text_color: "#e0e7ff",
    muted_color: "#818cf8",
    font_heading: "Space Grotesk, Cairo, sans-serif",
    font_body: "Inter, Cairo, sans-serif",
    button_shape: "soft",
    animation_level: "advanced",
    best_for: ["physics", "math", "secondary"],
  },
  {
    id: "forest-earth",
    name_ar: "غابة الأرض",
    mood: "calm",
    description: "أخضر غابات مع بني خشبي — طبيعي لأحياء والجغرافيا.",
    primary_color: "#15803d",
    accent_color: "#65a30d",
    bg_color: "#f7fee7",
    surface_color: "#ffffff",
    text_color: "#14532d",
    muted_color: "#65a30d",
    font_heading: "Cairo, sans-serif",
    font_body: "Tajawal, sans-serif",
    button_shape: "round",
    animation_level: "simple",
    best_for: ["biology", "science", "studies", "prep"],
  },
  {
    id: "coral-reef",
    name_ar: "الشعب المرجانية",
    mood: "warm",
    description: "برتقالي مرجاني مع فيروزي — حيوي للإعدادي.",
    primary_color: "#f43f5e",
    accent_color: "#14b8a6",
    bg_color: "#fff1f2",
    surface_color: "#ffffff",
    text_color: "#881337",
    muted_color: "#71717a",
    font_heading: "Poppins, Cairo, sans-serif",
    font_body: "Tajawal, sans-serif",
    button_shape: "round",
    animation_level: "advanced",
    best_for: ["english", "arabic", "prep"],
  },
  {
    id: "mono-editorial",
    name_ar: "الأبيض والأسود",
    mood: "modern",
    description: "أبيض وأسود مع تباين حاد — أنيق ومحترف للغة العربية.",
    primary_color: "#18181b",
    accent_color: "#71717a",
    bg_color: "#fafafa",
    surface_color: "#ffffff",
    text_color: "#09090b",
    muted_color: "#71717a",
    font_heading: "Playfair Display, Amiri, serif",
    font_body: "Inter, Cairo, sans-serif",
    button_shape: "sharp",
    animation_level: "simple",
    best_for: ["arabic", "studies", "secondary"],
  },
  {
    id: "cyber-grid",
    name_ar: "شبكة سايبر",
    mood: "tech",
    description: "أخضر سايبر على أسود — مستقبلي للبرمجة والمعلوماتية.",
    primary_color: "#22c55e",
    accent_color: "#84cc16",
    bg_color: "#030712",
    surface_color: "#111827",
    text_color: "#f0fdf4",
    muted_color: "#86efac",
    font_heading: "Space Grotesk, sans-serif",
    font_body: "Inter, Cairo, sans-serif",
    button_shape: "sharp",
    animation_level: "advanced",
    best_for: ["math", "physics", "science", "secondary"],
  },
  {
    id: "pastel-cloud",
    name_ar: "باستيل سحابي",
    mood: "calm",
    description: "ألوان باستيل ناعمة — لطيف للابتدائي.",
    primary_color: "#a78bfa",
    accent_color: "#fda4af",
    bg_color: "#faf5ff",
    surface_color: "#ffffff",
    text_color: "#4c1d95",
    muted_color: "#a1a1aa",
    font_heading: "Tajawal, sans-serif",
    font_body: "Tajawal, sans-serif",
    button_shape: "round",
    animation_level: "medium",
    best_for: ["arabic", "english", "math", "primary"],
  },
  {
    id: "ruby-academy",
    name_ar: "أكاديمية الياقوت",
    mood: "luxury",
    description: "أحمر ياقوتي مع ذهبي — فاخر للثانوي العام.",
    primary_color: "#9f1239",
    accent_color: "#fbbf24",
    bg_color: "#18181b",
    surface_color: "#27272a",
    text_color: "#fafafa",
    muted_color: "#a1a1aa",
    font_heading: "Playfair Display, Amiri, serif",
    font_body: "Tajawal, sans-serif",
    button_shape: "soft",
    animation_level: "medium",
    best_for: ["arabic", "studies", "secondary"],
  },
  {
    id: "sapphire-prep",
    name_ar: "الياقوت الأزرق",
    mood: "tech",
    description: "أزرق ياقوتي عميق — للإعدادي في مواد العلوم.",
    primary_color: "#1d4ed8",
    accent_color: "#3b82f6",
    bg_color: "#eff6ff",
    surface_color: "#ffffff",
    text_color: "#1e3a8a",
    muted_color: "#64748b",
    font_heading: "Cairo, sans-serif",
    font_body: "Inter, Cairo, sans-serif",
    button_shape: "soft",
    animation_level: "medium",
    best_for: ["science", "math", "english", "prep"],
  },
  {
    id: "amber-classic",
    name_ar: "الكهرماني الكلاسيكي",
    mood: "luxury",
    description: "كهرماني دافئ مع بني — كلاسيكي للغة العربية.",
    primary_color: "#d97706",
    accent_color: "#fbbf24",
    bg_color: "#1c1917",
    surface_color: "#292524",
    text_color: "#fef3c7",
    muted_color: "#d6d3d1",
    font_heading: "Amiri, serif",
    font_body: "Tajawal, sans-serif",
    button_shape: "soft",
    animation_level: "simple",
    best_for: ["arabic", "studies", "secondary", "prep"],
  },
  {
    id: "violet-future",
    name_ar: "البنفسجي المستقبلي",
    mood: "modern",
    description: "بنفسجي مع فيروزي نيون — مستقبلي للمتميزين.",
    primary_color: "#7c3aed",
    accent_color: "#06b6d4",
    bg_color: "#0f0520",
    surface_color: "#1e1b3a",
    text_color: "#ede9fe",
    muted_color: "#a78bfa",
    font_heading: "Space Grotesk, Cairo, sans-serif",
    font_body: "Inter, Cairo, sans-serif",
    button_shape: "soft",
    animation_level: "advanced",
    best_for: ["physics", "math", "english", "secondary"],
  },
];

export function getTemplateById(id?: string): Template {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[1]; // midnight-tech default
}

export function pickTemplateForConfig(config: {
  mood?: string;
  subject?: string;
  stage?: string;
}): Template {
  // Try to match mood + subject
  const candidates = TEMPLATES.filter((t) => {
    const moodMatch = !config.mood || t.mood === config.mood;
    const fitsSubject =
      !config.subject || t.best_for.some((b) => b === config.subject || b === config.stage);
    return moodMatch && fitsSubject;
  });
  if (candidates.length > 0) return candidates[0];
  return TEMPLATES.find((t) => t.mood === config.mood) || TEMPLATES[1];
}

// Convert HEX to HSL string "H S% L%"
export function hexToHslString(hex: string): string {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
