import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: { monthly: number; yearly: number };
  features: string[];
  recommended?: boolean;
  billingCycle: 'monthly' | 'yearly';
  onSelect: () => void;
  buttonText?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  name,
  price,
  features,
  recommended,
  billingCycle,
  onSelect,
  buttonText = 'Get Started'
}) => {
  const currentPrice = billingCycle === 'monthly' ? price.monthly : price.yearly;
  const monthlyEquivalent = billingCycle === 'yearly' ? price.yearly / 12 : price.monthly;
  const savings = billingCycle === 'yearly' ? Math.round(((price.monthly * 12) - price.yearly) / (price.monthly * 12) * 100) : 0;

  return (
    <div className={`relative rounded-2xl p-6 transition-all duration-300 ${
      recommended 
        ? 'bg-card border-2 border-primary shadow-glow scale-105' 
        : 'bg-card border border-border hover:border-primary/30 hover:shadow-lg'
    }`}>
      {recommended && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          Most Popular
        </Badge>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold">{name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold">${currentPrice.toFixed(currentPrice < 100 ? 2 : 0)}</span>
          <span className="text-muted-foreground">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
        </div>
        {billingCycle === 'yearly' && (
          <div className="mt-2 space-y-1">
            <p className="text-sm text-muted-foreground">
              ${monthlyEquivalent.toFixed(2)}/month billed annually
            </p>
            {savings > 0 && (
              <Badge variant="secondary" className="bg-success/10 text-success">
                Save {savings}%
              </Badge>
            )}
          </div>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button 
        onClick={onSelect} 
        variant={recommended ? 'default' : 'outline'}
        className="w-full"
        size="lg"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default PricingCard;
