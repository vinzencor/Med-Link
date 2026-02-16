import React, { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { User } from '@/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface ProfileHealthProps {
    user: User;
}

export const ProfileHealth: React.FC<ProfileHealthProps> = ({ user }) => {
    const { user: authUser } = useAuth();
    const [verifiedDocsCount, setVerifiedDocsCount] = useState(0);
    const [totalDocsCount, setTotalDocsCount] = useState(0);

    useEffect(() => {
        fetchDocumentStats();
    }, [authUser]);

    const fetchDocumentStats = async () => {
        if (!authUser) return;

        try {
            const { data, error } = await supabase
                .from('user_documents')
                .select('status')
                .eq('user_id', authUser.id);

            if (error) throw error;

            setTotalDocsCount(data?.length || 0);
            setVerifiedDocsCount(data?.filter(doc => doc.status === 'verified').length || 0);
        } catch (error) {
            console.error('Error fetching document stats:', error);
        }
    };

    // Calculate score based on filled fields and documents
    const calculateScore = () => {
        let score = 0;

        // Basic profile fields (60%)
        if (user.name) score += 15;
        if (user.email) score += 15;
        if (user.phone) score += 10;
        if (user.bio) score += 10;
        if (user.experience) score += 10;

        // CV upload (20%)
        if (user.cvUrl) score += 20;

        // Document verification (20%)
        if (verifiedDocsCount > 0) {
            // Give points based on verified documents
            // 1 verified doc = 10 points, 2+ verified docs = 20 points
            score += Math.min(verifiedDocsCount * 10, 20);
        }

        return Math.min(score, 100);
    };

    const score = user.profileScore || calculateScore();

    const getMissingFields = () => {
        const missing = [];
        if (!user.phone) missing.push("Add Phone Number");
        if (!user.bio) missing.push("Add Bio");
        if (!user.experience) missing.push("Add Experience");
        if (!user.cvUrl) missing.push("Upload CV");
        if (totalDocsCount === 0) missing.push("Upload verification documents (License, ID)");
        if (totalDocsCount > 0 && verifiedDocsCount === 0) missing.push("Wait for document verification");
        return missing;
    };

    const missingFields = getMissingFields();

    return (
        <div className="card-elevated p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Profile Health</h3>
                <span className={`text-xl font-bold ${score === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                    {score}%
                </span>
            </div>

            <Progress value={score} className="h-3 mb-4" />

            {score < 100 ? (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-yellow-900 mb-1">Complete your profile</p>
                            <p className="text-sm text-yellow-700 mb-2">
                                A complete profile increases your chances of being hired by 40%.
                            </p>
                            <ul className="space-y-1">
                                {missingFields.map((field, index) => (
                                    <li key={index} className="text-sm text-yellow-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                        {field}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <p className="font-medium text-green-900">Your profile is looking great!</p>
                </div>
            )}
        </div>
    );
};
