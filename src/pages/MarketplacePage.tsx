import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
    ShoppingBag, GraduationCap, Award, Globe, FileText, Star, CheckCircle,
    ArrowRight, Upload, Loader2, ChevronRight, ChevronLeft, ExternalLink
} from 'lucide-react';

/** ─── Static data for the marketplace ─── */
const PARTNERS = [
    {
        id: 'linguapro',
        name: 'LinguaPro',
        tagline: 'IELTS / OET Preparation for Healthcare Professionals',
        category: 'Language Preparation',
        logo: '🌍',
        badge: 'Language Pro',
        price: 299,
        features: ['Live online classes', 'Mock exam access', 'Personalised feedback', 'Certificate on completion'],
        color: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'licensease',
        name: 'LicenseEase',
        tagline: 'Fast-Track Your Nursing Licence in the UK & Ireland',
        category: 'Licensing Support',
        logo: '📋',
        badge: 'Licence Ready',
        price: 499,
        features: ['Document checklist AI', 'NMC / NMBI application support', 'Legal advisory session', 'Certificate on approval'],
        color: 'from-purple-500 to-pink-600',
    },
    {
        id: 'nurseportfolio',
        name: 'NursePortfolio',
        tagline: 'Build a World-Class Digital Portfolio in Minutes',
        category: 'Digital Portfolio',
        logo: '💼',
        badge: 'Portfolio Pro',
        price: 149,
        features: ['Premium templates', 'Skill showcase builder', 'PDF export', 'Certificate on publish'],
        color: 'from-teal-500 to-green-600',
    },
    {
        id: 'departureready',
        name: 'DepartureReady',
        tagline: 'Complete Pre-Departure Training & Relocation Support',
        category: 'Pre-Departure',
        logo: '✈️',
        badge: 'Relocation Ready',
        price: 199,
        features: ['Visa guide workshops', 'Cultural orientation', 'Insurance advisory', 'Certificate on completion'],
        color: 'from-orange-500 to-red-500',
    },
];

const CATEGORY_ICONS: Record<string, JSX.Element> = {
    'Language Preparation': <Globe className="w-4 h-4" />,
    'Licensing Support': <FileText className="w-4 h-4" />,
    'Digital Portfolio': <Star className="w-4 h-4" />,
    'Pre-Departure': <Award className="w-4 h-4" />,
};

export default function MarketplacePage() {
    const { currentUser, purchaseAddOn, addNotification } = useApp();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Partner purchase modal
    const [selectedPartner, setSelectedPartner] = useState<typeof PARTNERS[0] | null>(null);
    const [purchaseLoading, setPurchaseLoading] = useState(false);

    // Certificate upload modal
    const [certModal, setCertModal] = useState(false);
    const [certPartner, setCertPartner] = useState<typeof PARTNERS[0] | null>(null);
    const [certFile, setCertFile] = useState<File | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);

    // Carousel
    const [carouselIndex, setCarouselIndex] = useState(0);

    const visibleCount = 2;
    const canPrev = carouselIndex > 0;
    const canNext = carouselIndex + visibleCount < PARTNERS.length;

    const handlePurchase = async () => {
        if (!selectedPartner) return;
        setPurchaseLoading(true);
        await new Promise(r => setTimeout(r, 900)); // mock payment
        purchaseAddOn({ id: selectedPartner.id, name: selectedPartner.name, price: selectedPartner.price });
        addNotification({
            type: 'general',
            title: `${selectedPartner.name} unlocked! 🎉`,
            message: `Your ${selectedPartner.name} course is now active. Check your email for login details.`,
            read: false,
        });
        toast({ title: 'Purchase successful!', description: `${selectedPartner.name} has been added to your profile.` });
        setPurchaseLoading(false);
        setSelectedPartner(null);
    };

    const handleCertUpload = async () => {
        if (!certFile || !certPartner || !currentUser) return;
        setUploadLoading(true);
        try {
            const path = `certificates/${currentUser.id}/${certPartner.id}/${Date.now()}_${certFile.name}`;
            const { error: uploadErr } = await supabase.storage.from('user-documents').upload(path, certFile);
            if (uploadErr) throw uploadErr;
            const { data: urlData } = supabase.storage.from('user-documents').getPublicUrl(path);

            // Insert into certificates table
            await supabase.from('certificates').insert({
                user_id: currentUser.id,
                partner_id: certPartner.id,
                file_url: urlData.publicUrl,
                issued_at: new Date().toISOString(),
            });

            addNotification({
                type: 'badge',
                title: `Badge earned: ${certPartner.badge}! 🏅`,
                message: `Your certificate from ${certPartner.name} was verified and the "${certPartner.badge}" badge has been added to your profile.`,
                read: false,
            });
            toast({ title: 'Certificate uploaded!', description: `"${certPartner.badge}" badge will appear on your profile.` });
        } catch {
            toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
        } finally {
            setUploadLoading(false);
            setCertModal(false);
            setCertFile(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary to-indigo-700 text-white px-6 py-14 text-center">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1 text-sm mb-4">
                    <ShoppingBag className="w-4 h-4" /> VAS Marketplace
                </div>
                <h1 className="text-4xl font-bold mb-3">Upgrade Your Career</h1>
                <p className="text-lg text-white/80 max-w-xl mx-auto">
                    Access premium partner services — language prep, licensing support, digital portfolios, and more.
                    Earn verified badges automatically on completion.
                </p>
                <div className="flex justify-center gap-3 mt-6">
                    <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
                        <p className="text-2xl font-bold">4</p>
                        <p className="text-xs text-white/70">Partner Services</p>
                    </div>
                    <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
                        <p className="text-2xl font-bold">4</p>
                        <p className="text-xs text-white/70">Badges Available</p>
                    </div>
                    <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-xs text-white/70">Verified Credentials</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10">
                {/* Carousel header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Partner Services</h2>
                        <p className="text-gray-500 text-sm mt-1">Showing {carouselIndex + 1}–{Math.min(carouselIndex + visibleCount, PARTNERS.length)} of {PARTNERS.length}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled={!canPrev} onClick={() => setCarouselIndex(i => i - 1)}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" disabled={!canNext} onClick={() => setCarouselIndex(i => i + 1)}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Carousel cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {PARTNERS.slice(carouselIndex, carouselIndex + visibleCount).map(partner => {
                        const owned = currentUser?.addOns?.some(a => a.id === partner.id);
                        return (
                            <div key={partner.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
                                <div className={`bg-gradient-to-r ${partner.color} p-6 text-white`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-4xl">{partner.logo}</span>
                                        <div>
                                            <p className="font-bold text-lg">{partner.name}</p>
                                            <div className="flex items-center gap-1 text-xs opacity-80">
                                                {CATEGORY_ICONS[partner.category]}
                                                {partner.category}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm opacity-90">{partner.tagline}</p>
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <ul className="space-y-2 mb-4 flex-1">
                                        {partner.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                        <div>
                                            <span className="text-2xl font-bold text-gray-900">${partner.price}</span>
                                            <span className="text-sm text-gray-500"> one-time</span>
                                        </div>
                                        {owned ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge className="bg-green-100 text-green-700">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Enrolled
                                                </Badge>
                                                <Button size="sm" variant="outline" className="text-xs"
                                                    onClick={() => { setCertPartner(partner); setCertModal(true); }}>
                                                    <Upload className="w-3 h-3 mr-1" /> Upload Certificate
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button onClick={() => setSelectedPartner(partner)}>
                                                Enroll Now <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                    {owned && (
                                        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                            <GraduationCap className="w-3 h-3" /> Upload your certificate to earn the "{partner.badge}" badge
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* All Badges Available */}
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Available Badges</h3>
                    <p className="text-sm text-gray-500 mb-5">Complete a partner course and upload your certificate to earn a verified badge on your profile.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {PARTNERS.map(p => {
                            const earned = currentUser?.badges?.some(b => b.label === p.badge);
                            return (
                                <div key={p.id} className={`rounded-xl border p-4 text-center ${earned ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="text-3xl mb-2">{p.logo}</div>
                                    <p className="font-semibold text-sm">{p.badge}</p>
                                    <p className="text-xs text-gray-500">{p.name}</p>
                                    {earned ? (
                                        <Badge className="mt-2 bg-amber-100 text-amber-700 text-xs">Earned ✓</Badge>
                                    ) : (
                                        <p className="mt-2 text-xs text-gray-400">Not yet earned</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Purchase Confirmation Dialog */}
            <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Purchase</DialogTitle>
                        <DialogDescription>
                            You're about to purchase <strong>{selectedPartner?.name}</strong> for <strong>${selectedPartner?.price}</strong>.
                            This is a one-time payment. You'll receive enrolment details via email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-gray-50 rounded-lg p-4 my-2">
                        <p className="text-sm text-gray-600 font-medium mb-1">What you'll get:</p>
                        <ul className="space-y-1">
                            {selectedPartner?.features.map((f, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        This is a mock payment — no real card is charged.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedPartner(null)}>Cancel</Button>
                        <Button onClick={handlePurchase} disabled={purchaseLoading}>
                            {purchaseLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm — ${selectedPartner?.price}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Certificate Upload Dialog */}
            <Dialog open={certModal} onOpenChange={v => { setCertModal(v); setCertFile(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Certificate — {certPartner?.name}</DialogTitle>
                        <DialogDescription>
                            Upload your completion certificate. Once verified, the <strong>"{certPartner?.badge}"</strong> badge will be added to your profile automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="cert-file">Certificate File (PDF or image)</Label>
                            <Input
                                id="cert-file"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="mt-1"
                                onChange={e => setCertFile(e.target.files?.[0] ?? null)}
                            />
                        </div>
                        {certFile && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <FileText className="w-4 h-4 text-blue-500" /> {certFile.name}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCertModal(false)}>Cancel</Button>
                        <Button onClick={handleCertUpload} disabled={!certFile || uploadLoading}>
                            {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                            Upload Certificate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
