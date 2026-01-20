import React from 'react';
import { Progress } from "@/components/ui/progress";
import { User } from '@/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProfileHealthProps {
    user: User;
}

export const ProfileHealth: React.FC<ProfileHealthProps> = ({ user }) => {
    // Calculate score based on filled fields
    const calculateScore = () => {
        let score = 0;
        const totalWeight = 100;

        if (user.name) score += 20;
        if (user.email) score += 20;
        if (user.phone) score += 10;
        if (user.bio) score += 10;
        if (user.experience) score += 20; // Heavier weight for job seekers
        if (user.cvUrl) score += 20;

        return Math.min(score, 100);
    };

    const score = user.profileScore || calculateScore();

    const getMissingFields = () => {
        const missing = [];
        if (!user.phone) missing.push("Add Phone Number");
        if (!user.bio) missing.push("Add Bio");
        if (!user.experience) missing.push("Add Experience");
        if (!user.cvUrl) missing.push("Upload CV");
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
