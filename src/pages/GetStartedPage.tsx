import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Briefcase, Users, ArrowLeft } from 'lucide-react';
import { subscriptionPlans } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import PricingCard from '@/components/subscription/PricingCard';
import { Link } from 'react-router-dom';

const GetStartedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') as 'job_seeker' | 'recruiter' || 'job_seeker';
  const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'recruiter'>(initialRole);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const { setUserRole } = useApp();
  const navigate = useNavigate();

  const plans = selectedRole === 'recruiter' ? subscriptionPlans.recruiter : subscriptionPlans.jobSeeker;

  const handleSelectPlan = (planId: string) => {
    setUserRole(selectedRole);
    // In a real app, this would go to a payment page
    if (selectedRole === 'recruiter') {
      navigate('/dashboard');
    } else {
      navigate('/feed');
    }
  };

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
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">
            Select your role and pick the plan that fits your needs
          </p>
        </div>

        {/* Role Selection */}
        <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as 'job_seeker' | 'recruiter')} className="mb-10">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-auto p-1">
            <TabsTrigger value="job_seeker" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
              Job Seeker
            </TabsTrigger>
            <TabsTrigger value="recruiter" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Briefcase className="w-4 h-4" />
              Recruiter
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <Label htmlFor="billing" className={billingCycle === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>
            Monthly
          </Label>
          <Switch
            id="billing"
            checked={billingCycle === 'yearly'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <Label htmlFor="billing" className={billingCycle === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}>
            Yearly
          </Label>
          {billingCycle === 'yearly' && (
            <Badge variant="secondary" className="bg-success/10 text-success">Save up to 20%</Badge>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              features={plan.features}
              recommended={plan.recommended}
              billingCycle={billingCycle}
              onSelect={() => handleSelectPlan(plan.id)}
              buttonText={plan.recommended ? 'Get Started' : 'Select Plan'}
            />
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day free trial. Cancel anytime. <br />
            Need a custom enterprise solution?{' '}
            <Link to="/contact" className="text-primary hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GetStartedPage;
