import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Message {
    id: string;
    job_id: string;
    sender_id: string;
    message: string;
    created_at: string;
    read: boolean;
    sender?: {
        full_name: string;
        email: string;
        role: string;
    };
}

interface JobChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobId: string;
    jobTitle: string;
    recruiterName: string;
    recruiterEmail: string;
}

export const JobChatDialog = ({ open, onOpenChange, jobId, jobTitle, recruiterName, recruiterEmail }: JobChatDialogProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open && jobId) {
            fetchMessages();
            subscribeToMessages();
        }
    }, [open, jobId]);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);

            // Fetch messages
            const { data: messagesData, error: messagesError } = await supabase
                .from('job_chats')
                .select('*')
                .eq('job_id', jobId)
                .order('created_at', { ascending: true });

            if (messagesError) throw messagesError;

            // Fetch sender profiles separately
            const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, email, role')
                .in('id', senderIds);

            if (profilesError) throw profilesError;

            // Create a map of profiles
            const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

            // Combine messages with sender info
            const messagesWithSender = (messagesData || []).map(msg => ({
                ...msg,
                sender: profilesMap.get(msg.sender_id)
            }));

            setMessages(messagesWithSender);

            // Mark messages as read
            await supabase
                .from('job_chats')
                .update({ read: true })
                .eq('job_id', jobId)
                .neq('sender_id', user?.id);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast({
                title: 'Error',
                description: 'Failed to load messages',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const subscribeToMessages = () => {
        const channel = supabase
            .channel(`job_chat_${jobId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'job_chats',
                    filter: `job_id=eq.${jobId}`
                },
                (payload) => {
                    fetchMessages(); // Refetch to get sender info
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user) return;

        try {
            setSending(true);
            const { error } = await supabase
                .from('job_chats')
                .insert({
                    job_id: jobId,
                    sender_id: user.id,
                    message: newMessage.trim(),
                    read: false
                });

            if (error) throw error;

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: 'Error',
                description: 'Failed to send message',
                variant: 'destructive'
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chat about: {jobTitle}</DialogTitle>
                    <DialogDescription>
                        Discussing with {recruiterName} ({recruiterEmail})
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        <div className="space-y-4 pb-4">
                            {messages.map((msg) => {
                                const isOwnMessage = msg.sender_id === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-3`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold">
                                                    {isOwnMessage ? 'You' : msg.sender?.full_name || 'Unknown'}
                                                </span>
                                                <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm">{msg.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <div className="flex gap-2 pt-4 border-t">
                    <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={sending}
                    />
                    <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

