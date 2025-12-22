import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Users, 
  Shield, 
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Heart,
  Building2,
  Stethoscope
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const stats = [
    { value: '10,000+', label: 'Healthcare Jobs' },
    { value: '5,000+', label: 'Nursing Professionals' },
    { value: '500+', label: 'Healthcare Facilities' },
    { value: '95%', label: 'Placement Rate' },
  ];

  const features = [
    {
      icon: Briefcase,
      title: 'Quality Job Listings',
      description: 'Access thousands of verified healthcare positions from top medical facilities nationwide.'
    },
    {
      icon: Shield,
      title: 'Verified Employers',
      description: 'All recruiters are verified to ensure legitimate and safe job opportunities.'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Find positions that match your experience level and career aspirations.'
    },
    {
      icon: Heart,
      title: 'Healthcare Focused',
      description: 'Specialized platform for nursing and healthcare professionals only.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-32">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
              #1 Healthcare Recruitment Platform
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 tracking-tight">
              Connect Healthcare <br className="hidden sm:block" />
              <span className="text-primary-foreground/80">Talent with Opportunity</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
              The leading platform connecting nursing professionals with top healthcare employers. 
              Find your dream job or hire exceptional healthcare talent.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="xl" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 w-full sm:w-auto">
                <Link to="/get-started">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm">
                <div className="text-3xl sm:text-4xl font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-sm text-primary-foreground/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Why Choose NurseHub</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Healthcare Professionals</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to find your next healthcare position or hire top nursing talent.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card-elevated p-6 hover:border-primary/30"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Sections */}
      <section className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Job Seekers CTA */}
            <div className="card-elevated p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <Badge variant="secondary">For Job Seekers</Badge>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Find Your Dream Healthcare Position</h3>
              <p className="text-muted-foreground mb-6">
                Browse thousands of nursing and healthcare jobs. Apply with your profile and CV in seconds.
              </p>
              <ul className="space-y-3 mb-8">
                {['Access verified job listings', 'One-click apply with saved CV', 'Track your applications', 'Get instant job alerts'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="w-full">
                <Link to="/get-started?role=job_seeker">
                  Start Job Search
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Recruiters CTA */}
            <div className="card-elevated p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">For Recruiters</Badge>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Hire Top Healthcare Talent</h3>
              <p className="text-muted-foreground mb-6">
                Post job listings and connect with qualified nursing professionals ready to join your team.
              </p>
              <ul className="space-y-3 mb-8">
                {['Post unlimited jobs (Enterprise)', 'Advanced applicant tracking', 'Featured job placements', 'Analytics & reporting'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild variant="accent" size="lg" className="w-full">
                <Link to="/get-started?role=recruiter">
                  Start Hiring
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">NurseHub</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 NurseHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
