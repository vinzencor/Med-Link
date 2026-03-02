import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, ClipboardList, Megaphone, CheckCircle2, ShoppingCart } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { employerAddOns } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const iconMap: Record<string, React.ElementType> = {
  Bell,
  ClipboardList,
  Megaphone,
};

const EmployerAddOns: React.FC = () => {
  const { currentUser, purchaseAddOn, addNotification } = useApp();
  const { toast } = useToast();
  const [confirmAddon, setConfirmAddon] = useState<typeof employerAddOns[0] | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const activeAddOnIds = (currentUser?.addOns || []).filter(a => a.active).map(a => a.id);

  const handlePurchase = async () => {
    if (!confirmAddon) return;
    setIsPurchasing(true);
    // Simulate network delay for mock payment
    await new Promise(r => setTimeout(r, 800));
    purchaseAddOn({
      id: confirmAddon.id,
      name: confirmAddon.name,
      price: confirmAddon.price,
    });
    if (currentUser?.id) {
      addNotification({
        type: 'addon_purchased',
        title: `${confirmAddon.name} Add-On Activated`,
        message: `Your "${confirmAddon.name}" add-on ($${confirmAddon.price}/mo) is now active.`,
        read: false
      });
    }
    toast({ title: 'Add-On Activated', description: `${confirmAddon.name} is now active on your account.` });
    setConfirmAddon(null);
    setIsPurchasing(false);
  };

  return (
    <div className="card-elevated p-5 mt-6">
      <h3 className="text-base font-semibold mb-1">Employer Add-Ons</h3>
      <p className="text-xs text-muted-foreground mb-4">Enhance your recruitment with powerful extras</p>

      <div className="space-y-3">
        {employerAddOns.map(addon => {
          const Icon = iconMap[addon.icon] || Bell;
          const isActive = activeAddOnIds.includes(addon.id);

          return (
            <div
              key={addon.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isActive ? 'bg-success/5 border-success/20' : 'border-border hover:border-primary/30'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isActive ? 'bg-success/10' : 'bg-secondary'
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-success' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{addon.name}</p>
                  {isActive && (
                    <Badge className="bg-success/10 text-success border-success/20 text-xs h-4 px-1">Active</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{addon.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">${addon.price}<span className="text-xs text-muted-foreground">/mo</span></p>
                {isActive ? (
                  <CheckCircle2 className="w-4 h-4 text-success ml-auto mt-1" />
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs px-2 mt-1"
                    onClick={() => setConfirmAddon(addon)}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAddon} onOpenChange={() => setConfirmAddon(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Add-On Purchase</DialogTitle>
            <DialogDescription>
              You are adding <strong>{confirmAddon?.name}</strong> to your account for{' '}
              <strong>${confirmAddon?.price}/month</strong>. This will be billed with your next subscription renewal.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{confirmAddon?.description}</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmAddon(null)} disabled={isPurchasing}>Cancel</Button>
            <Button onClick={handlePurchase} disabled={isPurchasing}>
              {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployerAddOns;
