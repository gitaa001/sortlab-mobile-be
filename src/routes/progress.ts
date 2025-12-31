import { Router } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const progressRouter = Router();

progressRouter.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const { course_id, progress } = req.body ?? {};

  if (!course_id) return res.status(400).json({ message: "course_id is required" });

  const p = Math.max(0, Math.min(1, Number(progress ?? 0)));
  const status = p >= 1 ? "completed" : p > 0 ? "in_progress" : "not_started";
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("user_progress")
    .upsert({
      user_id: userId,
      course_id,
      progress: p,
      status,
      last_accessed_at: now,
      updated_at: now,
    });

  if (error) return res.status(400).json({ message: error.message });
  return res.json({ ok: true, progress: p, status });
});
