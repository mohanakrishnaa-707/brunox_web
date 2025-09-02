import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Hash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations, loading } = useChat();

  const getConversationTitle = (conversation: any) => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    }
    const otherParticipant = conversation.participants?.find((p: any) => p.user_id !== user?.id);
    return otherParticipant?.display_name || otherParticipant?.username || 'Direct Message';
  };

  const getConversationAvatar = (conversation: any) => {
    if (conversation.type === 'group') {
      return <Hash className="w-5 h-5 text-muted-foreground" />;
    }
    const participant = conversation.participants?.find((p: any) => p.user_id !== user?.id);
    return (
      <Avatar className="w-10 h-10">
        <AvatarImage src={participant?.avatar_url} />
        <AvatarFallback className="gradient-ocean text-white">
          {participant?.username?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
    );
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-primary" />
          Conversations
        </h1>
        <p className="text-muted-foreground mt-2">
          Your real-time decentralized messages
        </p>
      </div>

      {conversations.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
          <p className="text-muted-foreground">
            Start by adding friends or joining communities to begin chatting!
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="p-4 hover:shadow-ocean transition-smooth cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
              onClick={() => handleConversationClick(conversation.id)}
            >
              <div className="flex items-center gap-4">
                {getConversationAvatar(conversation)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {getConversationTitle(conversation)}
                      {conversation.type === 'group' && (
                        <Users className="w-4 h-4 text-muted-foreground" />
                      )}
                    </h3>
                    {conversation.last_message && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  
                  {conversation.last_message && (
                    <p className="text-muted-foreground truncate">
                      {conversation.last_message.content}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    {conversation.participants?.slice(0, 3).map((participant: any, index: number) => (
                      <div key={participant.user_id} className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          participant.status === 'online' ? 'bg-green-500' :
                          participant.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-xs text-muted-foreground">
                          {participant.username}
                        </span>
                        {index < Math.min(conversation.participants.length - 1, 2) && (
                          <span className="text-xs text-muted-foreground">,</span>
                        )}
                      </div>
                    ))}
                    {conversation.participants?.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{conversation.participants.length - 3} more</span>
                    )}
                  </div>
                </div>

                {conversation.unread_count > 0 && (
                  <Badge variant="default" className="gradient-ocean text-white">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chat;