import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { childLoginSchema } from "./child-login";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const enterChildAccount = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => childLoginSchema.parse(input))
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { authenticateChild } = await import("./child-login.server");
    return authenticateChild(data, false, process.env['CHILD_PIN_SECRET'], process.env['SUPABASE_URL'], process.env['SUPABASE_PUBLISHABLE_KEY']);
  });

export const createChildAccount = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => childLoginSchema.parse(input))
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { authenticateChild } = await import("./child-login.server");
    return authenticateChild(data, true, process.env['CHILD_PIN_SECRET'], process.env['SUPABASE_URL'], process.env['SUPABASE_PUBLISHABLE_KEY']);
  });

export const setChildCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => childLoginSchema.parse(input))
  .handler(async ({ data, context }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { saveChildCode } = await import("./child-login.server");
    return saveChildCode(context.userId, data, process.env['CHILD_PIN_SECRET']);
  });