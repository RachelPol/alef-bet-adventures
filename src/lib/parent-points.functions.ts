import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parentPointsSchema, parentCodeMatches } from "./parent-points";
export const restoreParentPoints = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => parentPointsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { verifyAccountParentCode } = await import("./parent-code.server");
    const accountMatch=await verifyAccountParentCode(context.userId,data.code);
    const permitted=accountMatch===null ? await parentCodeMatches(data.code,process.env['PARENT_POINTS_CODE']) : accountMatch;
    if (!permitted) throw new Error("קוד ההורה אינו נכון");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: points, error } = await supabaseAdmin.rpc("credit_child_points", { p_user_id: context.userId, p_points: data.points });
    if (error) throw new Error("לא הצלחנו לשחזר את הנקודות");
    return { points };
  });