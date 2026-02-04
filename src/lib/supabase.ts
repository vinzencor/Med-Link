import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const checkSupabaseHealth = async (timeoutMs = 2500) => {
    if (!supabaseUrl) return false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
            signal: controller.signal,
            headers: supabaseAnonKey ? { apikey: supabaseAnonKey } : undefined,
        });
        return response.ok;
    } catch {
        return false;
    } finally {
        window.clearTimeout(timeoutId);
    }
};
