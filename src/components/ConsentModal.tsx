/**
 * GDPR / HIPAA Consent Modal
 * Shown on first login when `currentUser.consentGiven` is false/undefined.
 */
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function ConsentModal() {
    const { currentUser, updateUserProfile } = useApp();
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Only show when logged in and consent not yet given
    const show = !!currentUser && !currentUser.consentGiven;

    const allAccepted = termsAccepted && privacyAccepted && dataProcessingAccepted;

    const handleAccept = async () => {
        if (!allAccepted) return;
        setLoading(true);
        await updateUserProfile({
            consentGiven: true,
            consentDate: new Date().toISOString(),
        });
        setLoading(false);
    };

    return (
        <Dialog open={show}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <DialogTitle className="text-xl">Before you continue</DialogTitle>
                    </div>
                    <DialogDescription>
                        NurseConnect Pro is committed to protecting your privacy. Please review and accept the
                        agreements below to continue using the platform.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="terms"
                            checked={termsAccepted}
                            onCheckedChange={v => setTermsAccepted(!!v)}
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                            I agree to the{' '}
                            <a href="#" className="text-primary underline">Terms of Service</a>
                            , which govern my use of this platform including job applications, profile data, and subscription services.
                        </Label>
                    </div>

                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="privacy"
                            checked={privacyAccepted}
                            onCheckedChange={v => setPrivacyAccepted(!!v)}
                        />
                        <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
                            I have read and accept the{' '}
                            <a href="#" className="text-primary underline">Privacy Policy</a>
                            . I understand how my personal and health-related data is collected, stored, and used.
                        </Label>
                    </div>

                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="dpa"
                            checked={dataProcessingAccepted}
                            onCheckedChange={v => setDataProcessingAccepted(!!v)}
                        />
                        <Label htmlFor="dpa" className="text-sm leading-relaxed cursor-pointer">
                            I consent to the{' '}
                            <a href="#" className="text-primary underline">Data Processing Agreement</a>
                            {' '}(GDPR / HIPAA). My data may be shared with verified employers to facilitate recruitment.
                        </Label>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <strong>Your rights:</strong> You can withdraw consent, request data deletion, or export your data at any time from your Profile settings.
                </div>

                <DialogFooter>
                    <Button onClick={handleAccept} disabled={!allAccepted || loading} className="w-full">
                        {loading ? 'Saving…' : 'I Accept — Continue to Platform'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
