
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: UserRole | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(() => {
        // Optimistic initialization from localStorage
        const cachedRole = localStorage.getItem('user_role');
        return cachedRole as UserRole | null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.error('Error fetching profile:', error);
                    // Do not clear role immediately if error, maybe transient? 
                    // But if no profile found, we might need to clear.
                    // For now, if error, we stick to what we have or null? 
                    // Better to be safe.
                    // If fetching fails, we can't be sure of role. 
                    // But if we have cached role, we might keep it?
                } else if (data) {
                    const newRole = data.role as UserRole;
                    setRole(newRole);
                    localStorage.setItem('user_role', newRole);
                }
            } catch (error) {
                console.error('Unexpected error fetching profile:', error);
            }
        };

        const initializeAuth = async () => {
            try {
                // Timeout promise
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Auth timeout')), 30000);
                });

                const authPromise = async () => {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    if (error) throw error;
                    return session;
                };

                // Race
                try {
                    const session = await Promise.race([authPromise(), timeoutPromise]) as Session | null;

                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id);
                    } else {
                        setRole(null);
                        localStorage.removeItem('user_role');
                    }
                } catch (error: any) {
                    if (error.message === 'Auth timeout') {
                        console.warn('Auth initialization timed out');
                        // Assume guest if timed out to unblock UI
                        setSession(null);
                        setUser(null);
                    } else {
                        throw error;
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                setSession(null);
                setUser(null);
                setRole(null);
                localStorage.removeItem('user_role');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('Auth state changed:', _event, session?.user?.id);
            if (_event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setRole(null);
                localStorage.removeItem('user_role');
            } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        // Optimistic update - clear state immediately
        setSession(null);
        setUser(null);
        setRole(null);
        localStorage.removeItem('user_role');

        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
