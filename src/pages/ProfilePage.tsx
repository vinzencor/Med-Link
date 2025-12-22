import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Upload, 
  CheckCircle2,
  Camera,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ProfilePage: React.FC = () => {
  const { currentUser, updateUserCV, userRole } = useApp();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
    experience: currentUser?.experience || ''
  });

  const handleSave = () => {
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been saved successfully.'
    });
    setIsEditing(false);
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file',
          variant: 'destructive'
        });
        return;
      }
      setCvFile(file);
      updateUserCV(`/uploads/${file.name}`);
      toast({
        title: 'CV Uploaded',
        description: 'Your CV has been saved and will be used for future applications.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Profile Header */}
        <div className="card-elevated p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {currentUser?.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="icon" 
                variant="secondary" 
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold">{currentUser?.name}</h2>
              <p className="text-muted-foreground">{currentUser?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge variant="secondary">
                  {userRole === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
                </Badge>
                {currentUser?.subscription && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {currentUser.subscription.plan.charAt(0).toUpperCase() + currentUser.subscription.plan.slice(1)} Plan
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </div>

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
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
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
              {userRole === 'job_seeker' && (
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

        {/* CV Section (Job Seekers Only) */}
        {userRole === 'job_seeker' && (
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
                      <p className="text-sm text-muted-foreground">
                        Your CV will be automatically attached to applications
                      </p>
                    </div>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleCVUpload}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span>Replace CV</span>
                    </Button>
                  </label>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleCVUpload}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">Upload your CV</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF format, max 5MB. Your CV will be saved for future applications.
                  </p>
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
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {currentUser.subscription.plan.charAt(0).toUpperCase() + currentUser.subscription.plan.slice(1)} Plan
                  </p>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    {currentUser.subscription.billingCycle}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {userRole === 'job_seeker'
                    ? `${currentUser.subscription.applicationsRemaining === -1 ? 'Unlimited' : currentUser.subscription.applicationsRemaining} applications remaining`
                    : `${currentUser.subscription.jobPostsRemaining === undefined ? 'Unlimited' : currentUser.subscription.jobPostsRemaining} job posts remaining`
                  }
                </p>
              </div>
              <Button variant="outline">Manage</Button>
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
