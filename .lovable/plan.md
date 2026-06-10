# خطة التنفيذ الكاملة

## 1. أنيميشن Rootiy السينمائي (60 ثانية)
- مكوّن `RootyScanAnimation.tsx` جديد: شاشة مظلمة + شعار Rootix يدور + 6 مراحل فحص (المحتوى، الفيديوهات، الامتحانات، الطلاب، الأسئلة، التقرير)
- شريط تقدّم + Particles + ألوان المنصة + صوت ping اختياري
- يُستدعى من زرار "فحص شامل" في لوحة المدرس

## 2. ثيم لكل منصة (Per-Platform Color)
- إضافة `theme_color` (hex) لجدول `platforms` لو مش موجود في `config`
- في `PlatformAdmin.tsx` و`PlatformPage.tsx`: قراءة اللون وتطبيقه على CSS variables `--platform-primary` ديناميكياً
- استبدال الـ hard-coded greens بالـ token الجديد

## 3. صفحة هبوط لكل منصة (قبل تسجيل الدخول)
- Route جديد: `/m/:slug` يعرض Landing أولاً ثم زرار "ادخل بكود"
- Hero: اسم المدرس + ROOTIX بلون المنصة + دوائر متحركة + عدد الطلاب + كلام تحفيزي
- عدم استخدام أي أخضر — فقط لون المنصة

## 4. تبويبات سفلية للطالب (Bottom Tabs)
- بعد تسجيل الدخول: 4 تبويبات (الرئيسية، الفيديوهات، الامتحانات، PDF/بثوث)
- responsive للموبايل
- كل tab صفحة منفصلة بتصميم احترافي

## 5. موافقة الأدمن قبل النشر
- إضافة `status='pending'` افتراضياً عند الإنشاء
- الرابط العام `/m/:slug` يرجع "قيد المراجعة" لو الحالة pending
- زرار "معاينة" في Builder يفتح `/m/:slug?preview=TOKEN` يتجاوز الفحص
- في `Admin.tsx`: زرار "قبول" يغيّر status لـ approved
- المدرس مايقدرش يضيف محتوى لحد القبول

## 6. لوحة الأدمن الكبيرة — Collapse
- كل منصة تظهر كصف مطوي + سهم
- لما يضغط السهم تتفتح بكل التفاصيل (طلاب، محتوى، مدفوعات، تحذيرات)
- accordion بشكل أنيق

## 7. صيانة قاعدة البيانات
- مراجعة الجداول، حذف غير المستخدم
- فهارس على `platforms.status` و`content.platform_id`
- migration واحدة للتعديلات

## التغييرات على الملفات
- `supabase/migrations/...sql` — `status` defaults + `theme_color` + indexes
- `src/components/RootyScanAnimation.tsx` (جديد)
- `src/components/PlatformLanding.tsx` (جديد)
- `src/components/StudentBottomTabs.tsx` (جديد)
- `src/pages/PlatformPage.tsx` — Landing + tabs + status gate
- `src/pages/PlatformAdmin.tsx` — ثيم + قفل قبل القبول + زرار فحص
- `src/pages/Admin.tsx` — Collapse rows + Approve button
- `src/pages/Builder.tsx` — توليد رابط معاينة

## الوقت المتوقع
رد واحد كبير، كل التفاصيل دفعة واحدة بجودة.

## سؤال واحد قبل البدء
هل عندك لون افتراضي للمنصات القديمة الي مفيهاش لون محفوظ؟ (لو لأ هاستخدم أزرق احترافي #2563EB كـ fallback)
