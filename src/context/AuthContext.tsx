
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
    const [role, setRole] = useState<UserRole | null>(null);
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
                    setRole(null);
                } else if (data) {
                    setRole(data.role as UserRole);
                }
            } catch (error) {
                console.error('Unexpected error fetching profile:', error);
                setRole(null);
            }
        };

        const initializeAuth = async () => {
            try {
                setLoading(true);

                // Create a timeout promise to prevent infinite loading
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Auth initialization timed out')), 10000);
                });

                const authPromise = async () => {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    if (error) throw error;
                    return session;
                };

                // Race between auth check and timeout
                try {
                    const session = await Promise.race([authPromise(), timeoutPromise]) as Session | null;
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id);
                    } else {
                        setRole(null);
                    }
                } catch (error: any) {
                    if (error.message === 'Auth initialization timed out') {
                        console.warn('Auth initialization timed out - proceeding with null session');
                        // Don't throw, just let it finalize
                    } else {
                        throw error;
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                // Clear session on error
                setSession(null);
                setUser(null);
                setRole(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('Auth state changed:', _event, session?.user?.id);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Always fetch the profile when user logs in
                await fetchProfile(session.user.id);
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
