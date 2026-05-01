-- Performance indexes for scaling to 100+ platforms
CREATE INDEX IF NOT EXISTS idx_exam_results_platform ON public.exam_results(platform_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON public.exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_created ON public.exam_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_codes_platform ON public.student_codes(platform_id);
CREATE INDEX IF NOT EXISTS idx_student_codes_unused ON public.student_codes(platform_id) WHERE is_used = false;
CREATE INDEX IF NOT EXISTS idx_students_created ON public.students(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_platform_kind ON public.content(platform_id, kind);
CREATE INDEX IF NOT EXISTS idx_platforms_active ON public.platforms(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_platforms_created ON public.platforms(created_at DESC);