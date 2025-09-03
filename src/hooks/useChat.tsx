import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  message_type: 'text' | 'file';
  file_url?: string;
  blockchain_hash?: string;
  sender?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface Conversation {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  created_at: string;
  participants: Array<{
    user_id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    status: string;
  }>;
  last_message?: Message;
  unread_count: number;
}

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load conversations
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const messageChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations:conversation_id (
            id,
            name,
            type,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (participantError) throw participantError;

      // Get conversation details with participants and last messages
      const conversationIds = participantData?.map(p => p.conversation_id) || [];
      
      if (conversationIds.length > 0) {
        const { data: fullConversations, error: convError } = await supabase
          .from('conversations')
          .select(`
            *,
            conversation_participants (
              user_id,
              profiles!conversation_participants_user_id_fkey (
                username,
                display_name,
                avatar_url,
                status
              )
            )
          `)
          .in('id', conversationIds);

        if (convError) throw convError;

        // Transform the data to match our interface
        const transformedConversations = fullConversations?.map(conv => ({
          ...conv,
          type: (conv.type as 'direct' | 'group') || 'direct',
          participants: conv.conversation_participants?.map((cp: any) => ({
            user_id: cp.user_id,
            username: cp.profiles?.username || 'Unknown',
            display_name: cp.profiles?.display_name,
            avatar_url: cp.profiles?.avatar_url,
            status: cp.profiles?.status || 'offline'
          })) || [],
          unread_count: 0 // TODO: Calculate actual unread count
        })) || [];

        setConversations(transformedConversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error loading conversations",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setCurrentConversation(conversationId);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedMessages = data?.map(msg => {
        const profiles = msg.profiles as any;
        return {
          ...msg,
          message_type: (msg.message_type as 'text' | 'file') || 'text',
          sender: profiles ? {
            username: profiles.username || 'Unknown',
            display_name: profiles.display_name,
            avatar_url: profiles.avatar_url
          } : {
            username: 'Unknown',
            display_name: undefined,
            avatar_url: undefined
          }
        };
      }) || [];

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error loading messages",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, blockchainHash?: string) => {
    if (!user || !currentConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: user.id,
          conversation_id: currentConversation,
          message_type: 'text',
          blockchain_hash: blockchainHash
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const createDirectConversation = async (friendId: string) => {
    if (!user) return;

    try {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          created_by: user.id
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: user.id },
          { conversation_id: conversation.id, user_id: friendId }
        ]);

      if (participantError) throw participantError;

      await loadConversations();
      return conversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error creating conversation",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    conversations,
    messages,
    currentConversation,
    loading,
    loadMessages,
    sendMessage,
    createDirectConversation,
    loadConversations
  };
};