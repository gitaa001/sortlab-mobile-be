import { Router } from "express";
import { z } from "zod";
import { supabase } from "../supabase.js";

export const authRouter = Router();

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid body", errors: parsed.error.flatten() });

  const { firstName, lastName, email, password } = parsed.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName }
    }
  });

  if (error) {
    // Handle specific error messages
    if (error.message.toLowerCase().includes("already registered") || 
        error.message.toLowerCase().includes("already been registered") ||
        error.message.toLowerCase().includes("user already exists")) {
      return res.status(409).json({ message: "Email is already registered. Please use a different email or login." });
    }
    return res.status(400).json({ message: error.message });
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return res.status(409).json({ message: "Email is already registered. Please use a different email or login." });
  }

  // Jika email confirmation ON, session bisa null
  return res.status(201).json({
    message: "Registered",
    session: data.session,
    user: data.user
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid body", errors: parsed.error.flatten() });

  const { email, password } = parsed.data;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    // Handle specific error messages
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return res.status(401).json({ 
        message: "Please verify your email first. Check your inbox for the confirmation link." 
      });
    }
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return res.status(401).json({ 
        message: "Invalid email or password." 
      });
    }
    return res.status(401).json({ message: error.message });
  }

  return res.json({
    access_token: data.session?.access_token,
    refresh_token: data.session?.refresh_token,
    user: data.user
  });
});
