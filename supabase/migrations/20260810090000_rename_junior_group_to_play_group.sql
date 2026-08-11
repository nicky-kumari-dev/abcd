-- Requirement 1: rename "Junior Group" to "Play Group" everywhere.
--
-- ALTER TYPE ... RENAME VALUE relabels the enum value in place, which
-- transparently updates every row that currently stores it (students.class,
-- homework.class, todays_learning.class, lecture_links.class) without a
-- manual UPDATE per table and without any data loss. No existing rows,
-- students, or foreign keys are touched or recreated.
ALTER TYPE public.school_class RENAME VALUE 'Junior Group' TO 'Play Group';
