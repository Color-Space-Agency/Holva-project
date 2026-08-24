import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT" | "IMPORT"

interface AuditLogParams {
  action: AuditAction
  tableName: string
  recordId?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("factory_id")
      .eq("id", user.id)
      .single()

    await supabase.from("audit_logs").insert({
      factory_id: profile?.factory_id ?? null,
      user_id: user.id,
      action: params.action,
      table_name: params.tableName,
      record_id: params.recordId ?? null,
      old_values: params.oldValues ?? null,
      new_values: params.newValues ?? null,
    })
  } catch (err) {
    // Audit log errors should not break the main flow
    console.error("Audit log error:", err)
  }
}
