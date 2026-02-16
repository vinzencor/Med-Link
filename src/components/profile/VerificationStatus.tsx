import React, { useState, useEffect } from 'react';
import { User, UserDocument } from '@/types';
import { Shield, ShieldAlert, ShieldCheck, FileText, Lock, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface VerificationStatusProps {
    user: User;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ user }) => {
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();
    const { user: authUser } = useAuth();

    const status = user.verificationStatus || 'pending';

    // Fetch documents from Supabase
    useEffect(() => {
        fetchDocuments();
    }, [authUser]);

    const fetchDocuments = async () => {
        if (!authUser) return;

        try {
            const { data, error } = await supabase
                .from('user_documents')
                .select('*')
                .eq('user_id', authUser.id)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            // Transform to match UserDocument interface
            const transformedDocs: UserDocument[] = (data || []).map(doc => ({
                id: doc.id,
                name: doc.name,
                type: doc.type,
                url: doc.url,
                uploadedAt: new Date(doc.uploaded_at).toISOString().split('T')[0],
                status: doc.status as 'pending' | 'verified' | 'rejected'
            }));

            setDocuments(transformedDocs);
        } catch (error: any) {
            console.error('Error fetching documents:', error);
            toast({
                title: "Error",
                description: "Failed to load documents",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !authUser) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            toast({
                title: "Invalid file type",
                description: "Please upload a PDF file",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload a file smaller than 5MB",
                variant: "destructive",
            });
            return;
        }

        setUploading(true);

        try {
            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${authUser.id}/${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('user-documents')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('user-documents')
                .getPublicUrl(fileName);

            // Insert document record
            const { error: insertError } = await supabase
                .from('user_documents')
                .insert({
                    user_id: authUser.id,
                    name: file.name,
                    type: file.name.toLowerCase().includes('license') ? 'license' :
                          file.name.toLowerCase().includes('id') ? 'id' : 'other',
                    url: publicUrl,
                    status: 'pending'
                });

            if (insertError) throw insertError;

            toast({
                title: "Document uploaded",
                description: "Your document has been uploaded and is pending verification",
            });

            // Refresh documents list
            fetchDocuments();
        } catch (error: any) {
            console.error('Error uploading document:', error);
            toast({
                title: "Upload failed",
                description: error.message || "Failed to upload document",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

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
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                        <Button size="sm" variant="outline" disabled={uploading} asChild>
                            <span>
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" /> Upload New
                                    </>
                                )}
                            </span>
                        </Button>
                    </label>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                        <p className="text-sm text-slate-500 mt-2">Loading documents...</p>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="p-8 text-center">
                        <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-sm text-slate-600 font-medium mb-1">No documents uploaded yet</p>
                        <p className="text-xs text-slate-500">Upload your nursing license, ID proof, or other documents to get verified</p>
                    </div>
                ) : (
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
                                    <Badge variant="secondary" className={`capitalize ${
                                        doc.status === 'verified' ? 'text-green-600 bg-green-50' :
                                        doc.status === 'rejected' ? 'text-red-600 bg-red-50' :
                                        'text-yellow-600 bg-yellow-50'
                                    }`}>
                                        {doc.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="p-3 bg-slate-50 text-center">
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> End-to-end encrypted storage
                    </p>
                </div>
            </div>
        </div>
    );
};
