import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Users, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import PricingCard from '@/components/subscription/PricingCard';
import { Loader2 } from 'lucide-react';

const PricingPage: React.FC = () => {
  const { plans, plansLoading } = useApp();
  const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'recruiter'>('job_seeker');
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  const currentPlans = selectedRole === 'recruiter' ? plans.recruiter : plans.jobSeeker;

  const getDisplayPrice = (price: number) => {
    if (isYearly) return Math.round(price * 10);
    return price;
  };

  const handleSelectPlan = () => {
    navigate('/get-started');
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">NurseHub</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </Button>
              <Button asChild>
                <Link to="/get-started">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include a 7-day free trial.
          </p>
        </div>

        {/* Role Selection */}
        <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as 'job_seeker' | 'recruiter')} className="mb-10">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-auto p-1">
            <TabsTrigger value="job_seeker" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
              Job Seekers
            </TabsTrigger>
            <TabsTrigger value="recruiter" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Briefcase className="w-4 h-4" />
              Recruiters
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <span className="ml-2 text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-semibold">Save 2 months</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {currentPlans.map((plan: any) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              price={getDisplayPrice(plan.price)}
              billingCycle={isYearly ? 'yearly' : 'monthly'}
              features={plan.features}
              recommended={plan.recommended}
              onSelect={handleSelectPlan}
              revealsPerMonth={'revealsPerMonth' in plan ? plan.revealsPerMonth : undefined}
            />
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-6">All plans include:</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              '7-day free trial',
              'No credit card required',
              'Cancel anytime',
              '24/7 support'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-success" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
