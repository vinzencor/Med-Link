/**
 * Audit Logging Utility
 * Writes structured action records to the `audit_logs` Supabase table.
 * Falls back to console.info() when the table is not available (demo mode).
 */
import { supabase } from './supabase';

export type AuditTargetType =
    | 'user'
    | 'job'
    | 'application'
    | 'payment'
    | 'video'
    | 'document'
    | 'subscription'
    | 'add_on'
    | 'certificate'
    | 'ad'
    | 'partner';

export interface AuditEntry {
    action: string;           // e.g. 'video.approved', 'employer.suspended'
    targetType: AuditTargetType;
    targetId?: string;
    actorId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Log an auditable action.
 *
 * @example
 * await logAction({ action: 'video.approved', targetType: 'user', targetId: userId, actorId: adminId });
 */
export async function logAction(entry: AuditEntry): Promise<void> {
    const record = {
        action: entry.action,
        target_type: entry.targetType,
        target_id: entry.targetId ?? null,
        actor_id: entry.actorId ?? null,
        metadata: entry.metadata ?? {},
        created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('audit_logs').insert(record);

    if (error) {
        // Degrade gracefully — log to console in dev / demo mode
        console.info('[AUDIT]', record, error.message);
    }
}

/**
 * Convenience wrappers for common actions
 */
export const audit = {
    videoApproved: (targetId: string, actorId?: string) =>
        logAction({ action: 'video.approved', targetType: 'video', targetId, actorId }),

    videoRejected: (targetId: string, actorId?: string) =>
        logAction({ action: 'video.rejected', targetType: 'video', targetId, actorId }),

    docVerified: (targetId: string, actorId?: string) =>
        logAction({ action: 'document.verified', targetType: 'document', targetId, actorId }),

    docRejected: (targetId: string, actorId?: string) =>
        logAction({ action: 'document.rejected', targetType: 'document', targetId, actorId }),

    employerApproved: (targetId: string, actorId?: string) =>
        logAction({ action: 'employer.approved', targetType: 'user', targetId, actorId }),

    employerSuspended: (targetId: string, actorId?: string) =>
        logAction({ action: 'employer.suspended', targetType: 'user', targetId, actorId }),

    jobApproved: (targetId: string, actorId?: string) =>
        logAction({ action: 'job.approved', targetType: 'job', targetId, actorId }),

    jobRejected: (targetId: string, actorId?: string) =>
        logAction({ action: 'job.rejected', targetType: 'job', targetId, actorId }),

    paymentRecorded: (targetId: string, actorId?: string, metadata?: Record<string, unknown>) =>
        logAction({ action: 'payment.recorded', targetType: 'payment', targetId, actorId, metadata }),

    addOnPurchased: (addOnId: string, userId: string, metadata?: Record<string, unknown>) =>
        logAction({ action: 'add_on.purchased', targetType: 'add_on', targetId: addOnId, actorId: userId, metadata }),
};
