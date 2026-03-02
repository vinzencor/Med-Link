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
          // Add other fields as needed, potentially merging with mock data if needed for demo
          ...profile
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

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (n: Omit<Notification, 'id' | 'createdAt' | 'userId'>) => {
    const newN: Notification = {
      ...n,
      userId: currentUser?.id ?? 'anon',
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newN, ...prev]);
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
      toggleAutoRenew
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
