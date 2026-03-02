import React, { useState, useRef } from 'react';
import Header from '@/components/layout/Header';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User,
  FileText,
  Upload,
  CheckCircle2,
  Camera,
  Briefcase,
  Video,
  AlertCircle,
  RefreshCw,
  Star,
  Shield,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';

import { ProfileHealth } from '@/components/profile/ProfileHealth';
import { VerificationStatus } from '@/components/profile/VerificationStatus';

const ProfilePage: React.FC = () => {
  const { currentUser, updateUserCV, userRole, updateUserProfile, updateVideoUrl, updateAvatar, toggleAutoRenew, addNotification } = useApp();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const displayUser = currentUser || {
    name: user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    role: role || 'job_seeker'
  };

  const displayRole = role || userRole;

  const [formData, setFormData] = useState({
    name: displayUser?.name || '',
    email: displayUser?.email || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
    experience: currentUser?.experience || ''
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        experience: formData.experience
      });
      toast({ title: 'Profile Updated', description: 'Your profile has been saved successfully.' });
      setIsEditing(false);
    } catch {
      toast({ title: 'Save Failed', description: 'Could not save profile. Please try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF file', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'CV must be under 5MB', variant: 'destructive' });
      return;
    }
    setIsUploadingCV(true);
    try {
      const userId = user?.id || currentUser?.id;
      if (userId && /^[0-9a-f]{8}-/.test(userId)) {
        const path = `${userId}/${Date.now()}_cv.pdf`;
        const { data, error } = await supabase.storage.from('user-documents').upload(path, file, { upsert: true });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('user-documents').getPublicUrl(data.path);
        await updateUserProfile({ cvUrl: publicUrl });
        updateUserCV(publicUrl);
      } else {
        updateUserCV(`/uploads/${file.name}`);
      }
      toast({ title: 'CV Uploaded', description: 'Your CV has been saved and will be used for future applications.' });
    } catch (err: any) {
      toast({ title: 'Upload Failed', description: err.message || 'Could not upload CV', variant: 'destructive' });
    } finally {
      setIsUploadingCV(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload an MP4, MOV, or WebM video', variant: 'destructive' });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Video must be under 100MB', variant: 'destructive' });
      return;
    }
    setIsUploadingVideo(true);
    setVideoUploadProgress(10);
    try {
      const userId = user?.id || currentUser?.id;
      if (userId && /^[0-9a-f]{8}-/.test(userId)) {
        const ext = file.name.split('.').pop();
        const path = `${userId}/${Date.now()}_intro.${ext}`;
        setVideoUploadProgress(30);
        const { data, error } = await supabase.storage.from('profile-videos').upload(path, file, { upsert: true });
        setVideoUploadProgress(80);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('profile-videos').getPublicUrl(data.path);
        setVideoUploadProgress(95);
        await updateUserProfile({ videoUrl: publicUrl, videoStatus: 'pending' });
        updateVideoUrl(publicUrl, 'pending');
        addNotification({
          type: 'video_uploaded',
          title: 'Video Under Review',
          message: 'Your introduction video has been uploaded and is pending admin approval.',
          read: false
        });
      } else {
        updateVideoUrl(`/uploads/${file.name}`, 'pending');
      }
      setVideoUploadProgress(100);
      toast({ title: 'Video Uploaded', description: 'Your introduction video is pending admin approval.' });
    } catch (err: any) {
      toast({ title: 'Upload Failed', description: err.message || 'Could not upload video', variant: 'destructive' });
      setVideoUploadProgress(0);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    try {
      const userId = user?.id || currentUser?.id;
      if (userId && /^[0-9a-f]{8}-/.test(userId)) {
        const ext = file.name.split('.').pop();
        const path = `${userId}/avatar.${ext}`;
        const { data, error } = await supabase.storage.from('profile-avatars').upload(path, file, { upsert: true });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('profile-avatars').getPublicUrl(data.path);
        await updateUserProfile({ avatarUrl: publicUrl });
        updateAvatar(publicUrl);
        toast({ title: 'Avatar Updated', description: 'Your profile photo has been updated.' });
      } else {
        toast({ title: 'Demo Mode', description: 'Avatar upload requires a real account.' });
      }
    } catch (err: any) {
      toast({ title: 'Upload Failed', description: err.message || 'Could not upload avatar', variant: 'destructive' });
    }
  };

  const videoStatusColor = (status?: string) => {
    if (status === 'approved') return 'bg-success/10 text-success border-success/20';
    if (status === 'rejected') return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-warning/10 text-warning border-warning/20';
  };

  const videoStatusLabel = (status?: string) => {
    if (status === 'approved') return 'Approved â€” You can now apply to jobs';
    if (status === 'rejected') return 'Rejected â€” Please re-upload a new video';
    return 'Pending Admin Review';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>

        {/* Profile Health */}
        {displayRole === 'job_seeker' && currentUser && (
          <ProfileHealth user={currentUser} />
        )}

        {/* Mandatory Video Notice */}
        {displayRole === 'job_seeker' && !currentUser?.videoUrl && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-destructive/5 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Introduction Video Required</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload a self-introduction video before you can apply for jobs. See the "Introduction Video" section below.
              </p>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="card-elevated p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={currentUser?.avatarUrl || currentUser?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {displayUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" />
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full"
                onClick={() => avatarInputRef.current?.click()}
                title="Change photo"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold">{displayUser?.name}</h2>
              <p className="text-muted-foreground">{displayUser?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                <Badge variant="secondary">
                  {displayRole === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
                </Badge>
                {currentUser?.subscription && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {currentUser.subscription.plan.charAt(0).toUpperCase() + currentUser.subscription.plan.slice(1)} Plan
                  </Badge>
                )}
                {currentUser?.badges?.map(b => (
                  <Badge key={b.id} className="bg-amber-500/10 text-amber-600 border-amber-500/20 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {b.label}
                  </Badge>
                ))}
                {displayRole === 'job_seeker' && currentUser?.videoStatus === 'approved' && (
                  <Badge className="bg-success/10 text-success border-success/20 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Video Verified
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {/* Verification Status */}
        {displayRole === 'job_seeker' && currentUser && (
          <VerificationStatus user={currentUser} />
        )}

        {/* Personal Information */}
        <div className="card-elevated p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={formData.email} disabled className="opacity-60" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              {displayRole === 'job_seeker' && (
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g., 5 years in ER nursing"
                    disabled={!isEditing}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Introduction Video â€” Job Seekers Only */}
        {displayRole === 'job_seeker' && (
          <div className="card-elevated p-6 mb-6">
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Introduction Video
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Mandatory</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a 1â€“3 minute self-introduction video. This must be approved by our admin team before you can apply to jobs.
            </p>

            {currentUser?.videoUrl ? (
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg border ${videoStatusColor(currentUser.videoStatus)}`}>
                  <div className="flex items-center gap-2">
                    {currentUser.videoStatus === 'approved'
                      ? <CheckCircle2 className="w-4 h-4" />
                      : currentUser.videoStatus === 'rejected'
                      ? <AlertCircle className="w-4 h-4" />
                      : <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span className="text-sm font-medium">{videoStatusLabel(currentUser.videoStatus)}</span>
                  </div>
                  <label className="cursor-pointer">
                    <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideoUpload} className="hidden" />
                    <Button variant="outline" size="sm" asChild disabled={isUploadingVideo}>
                      <span>Replace Video</span>
                    </Button>
                  </label>
                </div>
                <video src={currentUser.videoUrl} controls className="w-full rounded-lg max-h-60 bg-black" />
              </div>
            ) : (
              <div className="border-2 border-dashed border-destructive/30 rounded-lg p-8 text-center">
                {isUploadingVideo ? (
                  <div className="space-y-3">
                    <Video className="w-10 h-10 mx-auto text-primary animate-pulse" />
                    <p className="font-medium">Uploading video...</p>
                    <Progress value={videoUploadProgress} className="max-w-xs mx-auto" />
                    <p className="text-sm text-muted-foreground">{videoUploadProgress}%</p>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideoUpload} className="hidden" />
                    <Video className="w-10 h-10 mx-auto text-destructive/60 mb-3" />
                    <p className="font-medium">Upload your introduction video</p>
                    <p className="text-sm text-muted-foreground mt-1">MP4, MOV, or WebM â€” max 100MB. Recommended: 1â€“3 minutes.</p>
                    <Button variant="outline" className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/5" type="button">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Video File
                    </Button>
                  </label>
                )}
              </div>
            )}
          </div>
        )}

        {/* CV Section â€” Job Seekers Only */}
        {displayRole === 'job_seeker' && (
          <div className="card-elevated p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Resume / CV
            </h3>
            {currentUser?.cvUrl ? (
              <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">CV Uploaded</p>
                      <p className="text-sm text-muted-foreground">Your CV will be automatically attached to applications</p>
                    </div>
                  </div>
                  <label className="cursor-pointer">
                    <input type="file" accept=".pdf" onChange={handleCVUpload} className="hidden" />
                    <Button variant="outline" size="sm" asChild disabled={isUploadingCV}>
                      <span>{isUploadingCV ? 'Uploading...' : 'Replace CV'}</span>
                    </Button>
                  </label>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <label className="cursor-pointer block">
                  <input type="file" accept=".pdf" onChange={handleCVUpload} className="hidden" />
                  {isUploadingCV ? (
                    <>
                      <Upload className="w-10 h-10 mx-auto text-primary animate-pulse mb-3" />
                      <p className="font-medium">Uploading CV...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                      <p className="font-medium">Upload your CV</p>
                      <p className="text-sm text-muted-foreground mt-1">PDF format, max 5MB.</p>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
        )}

        {/* Subscription Info */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Subscription
          </h3>
          {currentUser?.subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">
                      {currentUser.subscription.plan.charAt(0).toUpperCase() + currentUser.subscription.plan.slice(1)} Plan
                    </p>
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      {currentUser.subscription.billingCycle}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {displayRole === 'job_seeker'
                      ? `${currentUser.subscription.applicationsRemaining === -1 ? 'Unlimited' : currentUser.subscription.applicationsRemaining} applications remaining`
                      : currentUser.subscription.revealsTotal !== undefined
                        ? `${currentUser.subscription.revealsUsed ?? 0} / ${currentUser.subscription.revealsTotal === -1 ? 'âˆž' : currentUser.subscription.revealsTotal} reveals used`
                        : 'Plan active'
                    }
                  </p>
                  {displayRole === 'recruiter' && currentUser.subscription.revealsTotal !== undefined && currentUser.subscription.revealsTotal !== -1 && (
                    <Progress
                      value={((currentUser.subscription.revealsUsed ?? 0) / currentUser.subscription.revealsTotal) * 100}
                      className="mt-2 h-1.5 max-w-xs"
                    />
                  )}
                </div>
                <Button variant="outline">Manage</Button>
              </div>

              {/* Auto-Renew Toggle */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Auto-Renew</p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser.subscription.autoRenew ? 'Your plan renews automatically each cycle' : 'Auto-renewal is currently off'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleAutoRenew} className="flex items-center gap-1">
                  {currentUser.subscription.autoRenew
                    ? <ToggleRight className="w-7 h-7 text-success" />
                    : <ToggleLeft className="w-7 h-7 text-muted-foreground" />}
                  <span className="text-sm">{currentUser.subscription.autoRenew ? 'On' : 'Off'}</span>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground px-1">
                Plan renews on <strong>{new Date(currentUser.subscription.endDate).toLocaleDateString()}</strong>
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No active subscription</p>
              <Button>Choose a Plan</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

