import React, { useState } from 'react';
import { User, UserDocument } from '@/types';
import { Shield, ShieldAlert, ShieldCheck, FileText, Lock, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VerificationStatusProps {
    user: User;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ user }) => {
    // Mock documents if none exist (for UI demo)
    const documents: UserDocument[] = user.documents || [
        { id: '1', name: 'Nursing License.pdf', type: 'license', url: '#', uploadedAt: '2024-01-15', status: 'verified' },
        { id: '2', name: 'ID Proof.pdf', type: 'id', url: '#', uploadedAt: '2024-01-16', status: 'pending' }
    ];

    const status = user.verificationStatus || 'pending';

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'verified': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'verified': return <ShieldCheck className="w-6 h-6 text-green-600" />;
            case 'pending': return <ShieldAlert className="w-6 h-6 text-yellow-600" />;
            default: return <Shield className="w-6 h-6 text-gray-400" />;
        }
    };

    return (
        <div className="card-elevated p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status === 'verified' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {getStatusIcon(status)}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Vertex Verification Status</h3>
                        <p className="text-sm text-muted-foreground">
                            {status === 'verified' ? 'Your profile is fully verified' : 'Your documents are under review'}
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className={`px-4 py-1.5 capitalize text-sm font-medium ${getStatusColor(status)}`}>
                    {status}
                </Badge>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-lg overflow-hidden">
                <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2">
                        <Lock className="w-4 h-4 text-slate-500" />
                        Secure Document Vault
                    </h4>
                    <Button size="sm" variant="outline">
                        <Upload className="w-4 h-4 mr-2" /> Upload New
                    </Button>
                </div>

                <div className="divide-y divide-slate-100">
                    {documents.map((doc) => (
                        <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-slate-900">{doc.name}</p>
                                    <p className="text-xs text-slate-500">Uploaded on {doc.uploadedAt}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className={`capitalize ${doc.status === 'verified' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                                    {doc.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3 bg-slate-50 text-center">
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> End-to-end encrypted storage
                    </p>
                </div>
            </div>
        </div>
    );
};
