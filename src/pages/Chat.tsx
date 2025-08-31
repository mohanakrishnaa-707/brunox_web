import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Hash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Conversation {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  participants: Array<{
    id: string;
    username: string;
    avatar_url?: string;
    status: string;
  }>;
}

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        type: 'direct',
        lastMessage: 'Hey! How are you doing?',
        lastMessageTime: '2 min ago',
        unreadCount: 2,
        participants: [
          {
            id: '2',
            username: 'alice_ocean',
            avatar_url: '',
            status: 'online'
          }
        ]
      },
      {
        id: '2',
        type: 'group',
        name: 'Ocean Explorers',
        lastMessage: 'Check out this amazing coral reef!',
        lastMessageTime: '1h ago',
        unreadCount: 0,
        participants: [
          {
            id: '3',
            username: 'bob_marine',
            avatar_url: '',
            status: 'online'
          },
          {
            id: '4',
            username: 'carol_deep',
            avatar_url: '',
            status: 'away'
          }
        ]
      },
      {
        id: '3',
        type: 'direct',
        lastMessage: 'The blockchain integration is working perfectly!',
        lastMessageTime: '3h ago',
        unreadCount: 1,
        participants: [
          {
            id: '5',
            username: 'dev_waves',
            avatar_url: '',
            status: 'online'
          }
        ]
      }
    ];
    setConversations(mockConversations);
  }, []);

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    }
    return conversation.participants[0]?.username || 'Direct Message';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return <Hash className="w-5 h-5 text-muted-foreground" />;
    }
    const participant = conversation.participants[0];
    return (
      <Avatar className="w-10 h-10">
        <AvatarImage src={participant?.avatar_url} />
        <AvatarFallback className="gradient-ocean text-white">
          {participant?.username?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
    );
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
                    {conversation.lastMessageTime && (
                      <span className="text-xs text-muted-foreground">
                        {conversation.lastMessageTime}
                      </span>
                    )}
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className="text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    {conversation.participants.map((participant, index) => (
                      <div key={participant.id} className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          participant.status === 'online' ? 'bg-green-500' :
                          participant.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-xs text-muted-foreground">
                          {participant.username}
                        </span>
                        {index < conversation.participants.length - 1 && (
                          <span className="text-xs text-muted-foreground">,</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {conversation.unreadCount > 0 && (
                  <Badge variant="default" className="gradient-ocean text-white">
                    {conversation.unreadCount}
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