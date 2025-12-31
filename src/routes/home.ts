import { Router } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const homeRouter = Router();

homeRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;

  // profile
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, latest_course_id")
    .eq("id", userId)
    .single();

  if (profileErr) return res.status(400).json({ message: profileErr.message });

  // all courses (Library but also for progress mapping)
  const { data: courses, error: courseErr } = await supabase
    .from("courses")
    .select("id, slug, title, duration_minutes, thumbnail_url, sort_order")
    .order("sort_order", { ascending: true });

  if (courseErr) return res.status(400).json({ message: courseErr.message });

  // progress rows for user
  const { data: progressRows, error: progErr } = await supabase
    .from("user_progress")
    .select("course_id, progress, status, last_accessed_at")
    .eq("user_id", userId);

  if (progErr) return res.status(400).json({ message: progErr.message });

  const progressById = new Map(progressRows?.map((p) => [p.course_id, p]) ?? []);

  const coursesWithProgress = (courses ?? []).map((c) => ({
    ...c,
    progress: progressById.get(c.id)?.progress ?? 0,
    status: progressById.get(c.id)?.status ?? "not_started",
  }));

  // latest course detail
  const latestId = profile.latest_course_id;
  const latestCourse = latestId ? coursesWithProgress.find((c) => c.id === latestId) ?? null : null;

  return res.json({
    user: {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
    },
    latest_course: latestCourse,
    courses: coursesWithProgress,
  });
});
