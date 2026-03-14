import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Job, SavedJob, JobApplication, UserRole, Notification, VideoStatus, AddOn } from '@/types';
import { mockJobs, mockUser, mockRecruiter, mockSavedJobs, mockApplications } from '@/data/mockData';
import { checkSupabaseHealth, supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface AppContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  jobs: Job[];
  jobsLoading: boolean;
  savedJobs: SavedJob[];
  applications: JobApplication[];
  notifications: Notification[];
  unreadNotificationCount: number;
  setUserRole: (role: UserRole) => void;
  setCurrentUser: (user: User | null) => void;
  addJob: (job: Job) => void;
  toggleSaveJob: (jobId: string) => void;
  applyToJob: (application: JobApplication) => void;
  isJobSaved: (jobId: string) => boolean;
  hasApplied: (jobId: string) => boolean;
  updateUserCV: (cvUrl: string) => void;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  updateVideoUrl: (videoUrl: string, status?: VideoStatus) => void;
  updateAvatar: (avatarUrl: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'userId'>) => void;
  purchaseAddOn: (addOn: Pick<AddOn, 'id' | 'name' | 'price'>) => void;
  toggleAutoRenew: () => void;
  plans: { jobSeeker: any[], recruiter: any[] };
  plansLoading: boolean;
  revealCandidate: (seekerId: string) => Promise<boolean>;
  checkRevealed: (seekerId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(mockSavedJobs);
  const [applications, setApplications] = useState<JobApplication[]>(mockApplications);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [plans, setPlans] = useState<{ jobSeeker: any[], recruiter: any[] }>({ jobSeeker: [], recruiter: [] });
  const [plansLoading, setPlansLoading] = useState(true);

  // Sync AuthContext user to AppContext currentUser
  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        // Fetch profile to get name and other details
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const mappedUser: User = {
          id: user.id,
          name: profile?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: (role || profile?.role || 'job_seeker') as UserRole,
          avatar: profile?.avatar_url,
          avatarUrl: profile?.avatar_url,
          phone: profile?.phone,
          bio: profile?.bio,
          experience: profile?.experience,
          cvUrl: profile?.cv_url,
          videoUrl: profile?.video_url,
          videoStatus: profile?.video_status,
          videoRejectionReason: profile?.video_rejection_reason,
          consentGiven: profile?.consent_given,
          consentDate: profile?.consent_date,
          // Add other fields as needed, potentially merging with mock data if needed for demo
        };

        setCurrentUser(mappedUser);
        setUserRole(mappedUser.role);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
    };

    syncUser();
  }, [user, role]);

  // Helper to check if ID is UUID
  const isUUID = (str: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(str);
  };

  // Fetch saved jobs from Supabase
  useEffect(() => {
    const fetchSavedJobs = async () => {
      // If no user or if user is mock (not UUID), use mock data
      if (!currentUser?.id || !isUUID(currentUser.id)) {
        if (!currentUser?.id) {
          setSavedJobs(mockSavedJobs);
        }
        return;
      }

      const isHealthy = await checkSupabaseHealth();
      if (!isHealthy) {
        console.warn('⚠️ Supabase unreachable: using cached saved jobs');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('saved_jobs')
          .select('*')
          .eq('user_id', currentUser.id);

        if (error) {
          console.error('Error fetching saved jobs:', error);
          return;
        }

        if (data) {
          const mappedSavedJobs: SavedJob[] = data.map(item => ({
            id: item.id,
            jobId: item.job_id,
            userId: item.user_id,
            savedAt: item.created_at
          }));
          setSavedJobs(mappedSavedJobs);
        }
      } catch (error) {
        console.error('Unexpected error fetching saved jobs:', error);
      }
    };

    fetchSavedJobs();
  }, [currentUser?.id]);

  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser?.id || !isUUID(currentUser.id)) return;

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        if (data) {
          const mappedNotifications: Notification[] = data.map(n => ({
            id: n.id,
            userId: n.user_id,
            type: n.type,
            title: n.title,
            message: n.message,
            read: n.read,
            createdAt: n.created_at,
            metadata: n.metadata
          }));
          setNotifications(mappedNotifications);
        }
      } catch (error) {
        console.error('Unexpected error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${currentUser?.id}` 
      }, (payload) => {
        const newN = payload.new as any;
        setNotifications(prev => [{
          id: newN.id,
          userId: newN.user_id,
          type: newN.type,
          title: newN.title,
          message: newN.message,
          read: newN.read,
          createdAt: newN.created_at,
          metadata: newN.metadata
        }, ...prev]);
        
        // Push notification via browser if possible or just toast
        // We'll let the Header component handle the unread count
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  useEffect(() => {
    const fetchJobs = async () => {
      let isMounted = true;
      try {
        setJobsLoading(true);

        const isHealthy = await checkSupabaseHealth();
        if (!isHealthy) {
          console.warn('⚠️ Supabase unreachable: using mock jobs');
          if (isMounted) {
            setJobs(mockJobs);
          }
          return;
        }

        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error fetching jobs:', error);
        }

        if (isMounted) {
          if (data && data.length > 0) {
            const transformedJobs = data.map((job: any) => ({
              ...job,
              company: job.company_name,
              type: job.job_type || 'full-time',
              postedAt: job.created_at,
              salary: job.salary_range ? {
                min: 50000,
                max: 80000,
                period: 'yearly' as const
              } : {
                min: 50000,
                max: 80000,
                period: 'yearly' as const
              },
              requirements: job.requirements || [],
              benefits: job.benefits || [],
              applicationsCount: 0,
              isActive: true
            }));
            setJobs(transformedJobs);
          } else {
            // No jobs in DB
            setJobs([]);
          }
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        if (isMounted) {
          setJobs([]);
        }
      } finally {
        if (isMounted) {
          setJobsLoading(false);
        }
      }
      return () => { isMounted = false; };
    };

    fetchJobs();
  }, [currentUser]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*');

        if (error) throw error;

        if (data) {
          const transformed = {
            jobSeeker: data.filter(p => p.user_type === 'job_seeker').map(p => ({
              ...p,
              applicationsPerMonth: p.applications_limit,
              revealsPerMonth: p.reveals_limit
            })),
            recruiter: data.filter(p => p.user_type === 'recruiter').map(p => ({
              ...p,
              applicationsPerMonth: p.applications_limit,
              revealsPerMonth: p.reveals_limit
            }))
          };
          setPlans(transformed);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        // Fallback to mock data if DB fails
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSetUserRole = (role: UserRole) => {
    setUserRole(role);
    setCurrentUser(role === 'recruiter' ? mockRecruiter : mockUser);
  };

  const addJob = (job: Job) => {
    setJobs(prev => [job, ...prev]);
  };

  const toggleSaveJob = async (jobId: string) => {
    if (!currentUser?.id) return;

    // Check local state first
    const existingSave = savedJobs.find(s => s.jobId === jobId && s.userId === currentUser?.id);

    if (existingSave) {
      // Remove from local state
      setSavedJobs(prev => prev.filter(s => s.id !== existingSave.id));

      // Attempt to remove from Supabase ONLY if real user
      if (isUUID(currentUser.id)) {
        try {
          await supabase
            .from('saved_jobs')
            .delete()
            .eq('job_id', jobId)
            .eq('user_id', currentUser.id);
        } catch (e) {
          // Ignore
        }
      }
    } else {
      // Add to local state
      const newSave: SavedJob = {
        id: `s${Date.now()}`,
        jobId,
        userId: currentUser?.id,
        savedAt: new Date().toISOString().split('T')[0]
      };
      setSavedJobs(prev => [...prev, newSave]);

      // Attempt to add to Supabase ONLY if real user
      if (isUUID(currentUser.id)) {
        try {
          await supabase
            .from('saved_jobs')
            .insert({
              job_id: jobId,
              user_id: currentUser.id
            });
        } catch (e) {
          // Ignore if table doesn't exist
        }
      }
    }
  };

  const applyToJob = (application: JobApplication) => {
    setApplications(prev => [...prev, application]);
  };

  const isJobSaved = (jobId: string) => {
    return savedJobs.some(s => s.jobId === jobId && s.userId === currentUser?.id);
  };

  const hasApplied = (jobId: string) => {
    return applications.some(a => a.jobId === jobId && a.applicantId === currentUser?.id);
  };

  const updateUserCV = (cvUrl: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, cvUrl });
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.full_name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.experience !== undefined) dbUpdates.experience = updates.experience;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl;
    if (updates.videoStatus !== undefined) dbUpdates.video_status = updates.videoStatus;
    if (updates.cvUrl !== undefined) dbUpdates.cv_url = updates.cvUrl;
    if (updates.consentGiven !== undefined) dbUpdates.consent_given = updates.consentGiven;
    if (updates.consentDate !== undefined) dbUpdates.consent_date = updates.consentDate;

    const isRealUser = /^[0-9a-f]{8}-[0-9a-f]{4}/.test(currentUser.id);
    if (isRealUser && Object.keys(dbUpdates).length > 0) {
      try {
        await supabase.from('profiles').update(dbUpdates).eq('id', currentUser.id);
      } catch (e) {
        console.error('Profile update error:', e);
      }
    }
    setCurrentUser({ ...currentUser, ...updates });
  };

  const updateVideoUrl = (videoUrl: string, status: VideoStatus = 'pending') => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, videoUrl, videoStatus: status });
    }
  };

  const updateAvatar = (avatarUrl: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, avatarUrl });
    }
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (currentUser?.id && isUUID(currentUser.id)) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (currentUser?.id && isUUID(currentUser.id)) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('user_id', currentUser.id);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  const addNotification = async (n: Omit<Notification, 'id' | 'createdAt' | 'userId'>) => {
    const newN: Notification = {
      ...n,
      userId: currentUser?.id ?? 'anon',
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newN, ...prev]);

    if (currentUser?.id && isUUID(currentUser.id)) {
      try {
        await supabase.from('notifications').insert({
          user_id: currentUser.id,
          type: n.type,
          title: n.title,
          message: n.message,
          metadata: n.metadata
        });
      } catch (error) {
        console.error('Error adding notification to database:', error);
      }
    }
  };

  const purchaseAddOn = (addOn: Pick<AddOn, 'id' | 'name' | 'price'>) => {
    if (!currentUser) return;
    const existing = (currentUser.addOns || []).find(a => a.id === addOn.id);
    const newAddOn: AddOn = { ...addOn, active: true, purchasedAt: new Date().toISOString() };
    const updatedAddOns = existing
      ? (currentUser.addOns || []).map(a => a.id === addOn.id ? newAddOn : a)
      : [...(currentUser.addOns || []), newAddOn];
    setCurrentUser({ ...currentUser, addOns: updatedAddOns });
  };

  const toggleAutoRenew = () => {
    if (!currentUser?.subscription) return;
    setCurrentUser({
      ...currentUser,
      subscription: { ...currentUser.subscription, autoRenew: !currentUser.subscription.autoRenew }
    });
  };

  const checkRevealed = async (seekerId: string) => {
    if (!currentUser?.id || currentUser.role !== 'recruiter') return false;
    try {
      const { data, error } = await supabase
        .from('profile_reveals')
        .select('*')
        .eq('recruiter_id', currentUser.id)
        .eq('seeker_id', seekerId)
        .single();
      
      return !!data;
    } catch {
      return false;
    }
  };

  const revealCandidate = async (seekerId: string) => {
    if (!currentUser?.id || currentUser.role !== 'recruiter') return false;
    
    // Check if already revealed
    const isRevealed = await checkRevealed(seekerId);
    if (isRevealed) return true;

    try {
      // In a real app, check quotas here
      const { error } = await supabase
        .from('profile_reveals')
        .insert({
          recruiter_id: currentUser.id,
          seeker_id: seekerId
        });

      if (error) throw error;
      
      // Update local state if needed
      return true;
    } catch (error) {
      console.error('Error revealing candidate:', error);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      userRole,
      jobs,
      jobsLoading,
      savedJobs,
      applications,
      notifications,
      unreadNotificationCount,
      setUserRole: handleSetUserRole,
      setCurrentUser,
      addJob,
      toggleSaveJob,
      applyToJob,
      isJobSaved,
      hasApplied,
      updateUserCV,
      updateUserProfile,
      updateVideoUrl,
      updateAvatar,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      purchaseAddOn,
      toggleAutoRenew,
      plans,
      plansLoading,
      revealCandidate,
      checkRevealed
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
