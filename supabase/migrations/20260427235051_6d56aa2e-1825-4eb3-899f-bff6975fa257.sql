-- Enable realtime for platforms, content, student_codes, students, exam_results
ALTER TABLE public.platforms REPLICA IDENTITY FULL;
ALTER TABLE public.content REPLICA IDENTITY FULL;
ALTER TABLE public.student_codes REPLICA IDENTITY FULL;
ALTER TABLE public.students REPLICA IDENTITY FULL;
ALTER TABLE public.exam_results REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.platforms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.content;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_results;