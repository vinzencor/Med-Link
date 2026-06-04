import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import { TestimonialsColumn, type TestimonialItem } from '@/components/ui/testimonials-columns-1';
import {
  Briefcase,
  Shield,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Heart,
  Building2,
  Stethoscope
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [profiles, setProfiles] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, role, bio, avatar_url, created_at')
          .in('role', ['student', 'job_seeker', 'recruiter'])
          .order('created_at', { ascending: false })
          .limit(20);
        setProfiles(data || []);
      } catch (error) {
        console.error('Failed to load profile scroller:', error);
      }
    };

    fetchProfiles();
  }, []);

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

  const fallbackImages = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=80&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=80&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80',
  ];

  const testimonials: TestimonialItem[] = profiles.map((profile, index) => ({
    text: profile.bio || 'Active member of Medlink community.',
    image: profile.avatar_url || fallbackImages[index % fallbackImages.length],
    name: profile.full_name || 'Community Member',
    role: profile.role === 'job_seeker' ? 'Professional' : profile.role === 'student' ? 'Student' : 'Recruiter',
  }));

  const safeTestimonials = testimonials.length >= 9
    ? testimonials.slice(0, 9)
    : [
        ...testimonials,
        ...new Array(Math.max(0, 9 - testimonials.length)).fill(0).map((_, i) => ({
          text: 'Building a trusted healthcare hiring network with verified profiles.',
          image: fallbackImages[i % fallbackImages.length],
          name: `Medlink Member ${i + 1}`,
          role: i % 2 === 0 ? 'Professional' : 'Student',
        }))
      ];

  const firstColumn = safeTestimonials.slice(0, 3);
  const secondColumn = safeTestimonials.slice(3, 6);
  const thirdColumn = safeTestimonials.slice(6, 9);

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
              <Button asChild variant="outline" size="xl" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild variant="ghost" size="xl" className="text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto">
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
            <Badge variant="secondary" className="mb-4">Why Choose Medlink</Badge>
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

      {/* Community Profiles */}
      <section className="bg-background my-20 relative border-t border-border pt-14">
        <div className="container z-10 mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
          >
            <div className="flex justify-center">
              <div className="border py-1 px-4 rounded-lg">Community Profiles</div>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5">
              Meet our healthcare community
            </h2>
            <p className="text-center mt-5 opacity-75">
              Students, professionals, and recruiters who are actively using Medlink.
            </p>
          </motion.div>

          <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn} duration={15} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
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
              <span className="font-bold text-lg">Medlink</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 Medlink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
