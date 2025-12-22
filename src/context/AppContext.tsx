import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Job, SavedJob, JobApplication, UserRole } from '@/types';
import { mockJobs, mockUser, mockRecruiter, mockSavedJobs, mockApplications } from '@/data/mockData';

interface AppContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  jobs: Job[];
  savedJobs: SavedJob[];
  applications: JobApplication[];
  setUserRole: (role: UserRole) => void;
  setCurrentUser: (user: User | null) => void;
  addJob: (job: Job) => void;
  toggleSaveJob: (jobId: string) => void;
  applyToJob: (application: JobApplication) => void;
  isJobSaved: (jobId: string) => boolean;
  hasApplied: (jobId: string) => boolean;
  updateUserCV: (cvUrl: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(mockSavedJobs);
  const [applications, setApplications] = useState<JobApplication[]>(mockApplications);

  const handleSetUserRole = (role: UserRole) => {
    setUserRole(role);
    setCurrentUser(role === 'recruiter' ? mockRecruiter : mockUser);
  };

  const addJob = (job: Job) => {
    setJobs(prev => [job, ...prev]);
  };

  const toggleSaveJob = (jobId: string) => {
    const existingSave = savedJobs.find(s => s.jobId === jobId && s.userId === currentUser?.id);
    if (existingSave) {
      setSavedJobs(prev => prev.filter(s => s.id !== existingSave.id));
    } else {
      const newSave: SavedJob = {
        id: `s${Date.now()}`,
        jobId,
        userId: currentUser?.id || '',
        savedAt: new Date().toISOString().split('T')[0]
      };
      setSavedJobs(prev => [...prev, newSave]);
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

  return (
    <AppContext.Provider value={{
      currentUser,
      userRole,
      jobs,
      savedJobs,
      applications,
      setUserRole: handleSetUserRole,
      setCurrentUser,
      addJob,
      toggleSaveJob,
      applyToJob,
      isJobSaved,
      hasApplied,
      updateUserCV
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
