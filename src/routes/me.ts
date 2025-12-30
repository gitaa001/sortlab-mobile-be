import { Router } from "express";
import { supabase } from "../supabase.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, created_at")
    .eq("id", userId)
    .single();

  if (error) return res.status(400).json({ message: error.message });

  return res.json({ profile: data });
});
