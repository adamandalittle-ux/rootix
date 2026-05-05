-- Scaling indexes for ROOTIX (target: 200 platforms / 100k students)
CREATE INDEX IF NOT EXISTS idx_students_platform ON public.students(platform_id);
CREATE INDEX IF NOT EXISTS idx_students_created ON public.students(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_access_code ON public.students(access_code);

CREATE INDEX IF NOT EXISTS idx_content_platform ON public.content(platform_id);
CREATE INDEX IF NOT EXISTS idx_content_grade ON public.content(platform_id, grade_level);
CREATE INDEX IF NOT EXISTS idx_content_kind ON public.content(platform_id, kind);

CREATE INDEX IF NOT EXISTS idx_exam_results_platform ON public.exam_results(platform_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON public.exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON public.exam_results(exam_id);

CREATE INDEX IF NOT EXISTS idx_payments_platform ON public.platform_payments(platform_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON public.platform_payments(paid_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_codes_platform ON public.student_codes(platform_id);
CREATE INDEX IF NOT EXISTS idx_student_codes_code ON public.student_codes(code);

CREATE INDEX IF NOT EXISTS idx_video_watch_student ON public.video_watch(student_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_platform ON public.video_watch(platform_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_content ON public.video_watch(content_id);

CREATE INDEX IF NOT EXISTS idx_platforms_status ON public.platforms(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_platforms_slug ON public.platforms(slug);
CREATE INDEX IF NOT EXISTS idx_platforms_created ON public.platforms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platforms_deleted ON public.platforms(deleted_at);

CREATE INDEX IF NOT EXISTS idx_rooty_actions_platform ON public.rooty_actions(platform_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_platform ON public.ai_feedback(platform_id, created_at DESC);