import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Bookmark,
  User,
  Bell,
  Plus,
  LayoutDashboard,
  LogOut,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Header: React.FC = () => {
  const { currentUser, userRole, setCurrentUser } = useApp();
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = React.useState<any>(null);

  // Fetch user profile data
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setUserProfile(data);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  const jobSeekerNav = [
    { path: '/feed', label: 'Jobs', icon: Search },
    { path: '/saved', label: 'Saved', icon: Bookmark },
    { path: '/applications', label: 'Applications', icon: Briefcase },
  ];

  const recruiterNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/post-job', label: 'Post Job', icon: Plus },
    { path: '/applicants', label: 'Applicants', icon: User },
  ];

  const navItems = (role === 'recruiter' || userRole === 'recruiter') ? recruiterNav : jobSeekerNav;

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const displayUser = user || currentUser;
  const displayRole = role || userRole;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={displayRole ? (displayRole === 'recruiter' ? '/dashboard' : '/feed') : '/'} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">NurseHub</span>
          </Link>

          {/* Navigation */}
          {displayUser && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {displayUser ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {userProfile?.full_name ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('') : (currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('') : user?.email?.[0].toUpperCase() || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium">
                        {userProfile?.full_name?.split(' ')[0] || currentUser?.name?.split(' ')[0] || 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-medium">{userProfile?.full_name || currentUser?.name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{userProfile?.email || user?.email || currentUser?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/subscription" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        Subscription
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/pricing">Pricing</Link>
                </Button>
                <Button asChild>
                  <Link to="/get-started">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {currentUser && (
          <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
