import { Router } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const coursesRouter = Router();

coursesRouter.post("/:id/open", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const courseId = req.params.id;

  const now = new Date().toISOString();

  const { error: profErr } = await supabase
    .from("profiles")
    .update({ latest_course_id: courseId, latest_course_updated_at: now })
    .eq("id", userId);

  if (profErr) return res.status(400).json({ message: profErr.message });

  const { error: upErr } = await supabase
    .from("user_progress")
    .upsert({
      user_id: userId,
      course_id: courseId,
      status: "in_progress",
      last_accessed_at: now,
      updated_at: now,
    });

  if (upErr) return res.status(400).json({ message: upErr.message });

  return res.json({ ok: true });
});
