
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
        let isInitialized = false;

        const fetchProfile = async (userId: string) => {
            try {
                console.log('🔍 Fetching profile for user:', userId);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.error('❌ Error fetching profile:', error);
                    // If profile not found, keep cached role or set to null
                    const cachedRole = localStorage.getItem('user_role') as UserRole | null;
                    if (cachedRole) {
                        console.log('📦 Using cached role:', cachedRole);
                        setRole(cachedRole);
                    } else {
                        console.log('⚠️ No cached role, setting to null');
                        setRole(null);
                    }
                } else if (data) {
                    const newRole = data.role as UserRole;
                    console.log('✅ Profile fetched, role:', newRole);
                    setRole(newRole);
                    localStorage.setItem('user_role', newRole);
                }
            } catch (error) {
                console.error('❌ Unexpected error fetching profile:', error);
                // Fallback to cached role
                const cachedRole = localStorage.getItem('user_role') as UserRole | null;
                if (cachedRole) {
                    setRole(cachedRole);
                }
            }
        };

        const initializeAuth = async () => {
            try {
                console.log('🔄 Initializing auth...');
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('❌ Error getting session:', error);
                    throw error;
                }

                console.log('✅ Session retrieved:', session?.user?.id ? 'User logged in' : 'No user');
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    console.log('👤 Fetching profile for user:', session.user.id);
                    await fetchProfile(session.user.id);
                } else {
                    setRole(null);
                    localStorage.removeItem('user_role');
                }
            } catch (error: any) {
                console.error('❌ Error initializing auth:', error);
                // Clear session on error
                setSession(null);
                setUser(null);
                setRole(null);
                localStorage.removeItem('user_role');
            } finally {
                console.log('✅ Auth initialization complete, setting loading to false');
                isInitialized = true;
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('🔔 Auth state changed:', _event, session?.user?.id, 'isInitialized:', isInitialized);

            // Skip SIGNED_IN event during initialization to avoid race condition
            if (_event === 'SIGNED_IN' && !isInitialized) {
                console.log('⏭️ Skipping SIGNED_IN during initialization');
                return;
            }

            if (_event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setRole(null);
                localStorage.removeItem('user_role');
                setLoading(false);
            } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
                setLoading(false);
            } else if (_event === 'INITIAL_SESSION') {
                // This event fires when the auth listener is first set up
                // We don't need to do anything here as initializeAuth handles it
                console.log('📍 Initial session event (handled by initializeAuth)');
            }
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
