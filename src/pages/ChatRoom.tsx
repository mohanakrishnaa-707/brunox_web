import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Shield, Hash } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3 } from '@/hooks/useWeb3';
import { formatDistanceToNow } from 'date-fns';

const ChatRoom = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signMessage } = useWeb3();
  const { messages, loadMessages, sendMessage, conversations } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find(c => c.id === conversationId);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || isSending) return;

    setIsSending(true);
    try {
      let blockchainHash;
      try {
        // Try to sign message for blockchain verification
        const messageToSign = `${newMessage}:${Date.now()}`;
        blockchainHash = await signMessage(messageToSign);
      } catch (error) {
        console.log('Blockchain signing skipped:', error);
      }

      await sendMessage(newMessage, blockchainHash);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getConversationTitle = () => {
    if (!conversation) return 'Chat';
    
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    }
    
    const otherParticipant = conversation.participants.find(p => p.user_id !== user?.id);
    return otherParticipant?.display_name || otherParticipant?.username || 'Direct Message';
  };

  const getConversationAvatar = () => {
    if (!conversation) return null;

    if (conversation.type === 'group') {
      return <Hash className="w-6 h-6 text-muted-foreground" />;
    }

    const otherParticipant = conversation.participants.find(p => p.user_id !== user?.id);
    return (
      <Avatar className="w-8 h-8">
        <AvatarImage src={otherParticipant?.avatar_url} />
        <AvatarFallback className="gradient-ocean text-white">
          {otherParticipant?.username?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b border-border/50 p-4 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          {getConversationAvatar()}
          
          <div className="flex-1">
            <h2 className="font-semibold">{getConversationTitle()}</h2>
            {conversation?.type === 'direct' && (
              <p className="text-xs text-muted-foreground">
                {conversation.participants.find(p => p.user_id !== user?.id)?.status || 'offline'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.id;
            const sender = message.sender || conversation?.participants.find(p => p.user_id === message.sender_id);
            
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isOwnMessage && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src={sender?.avatar_url} />
                    <AvatarFallback className="gradient-ocean text-white text-xs">
                      {sender?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {!isOwnMessage && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {sender?.display_name || sender?.username || 'Unknown'}
                      </span>
                      {message.blockchain_hash && (
                        <div title="Blockchain verified">
                          <Shield className="w-3 h-3 text-green-500" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Card className={`p-3 ${
                    isOwnMessage 
                      ? 'gradient-ocean text-white ml-auto' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </Card>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    {isOwnMessage && message.blockchain_hash && (
                      <div title="Blockchain verified">
                        <Shield className="w-3 h-3 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border/50 p-4 bg-card/50 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 transition-smooth focus:shadow-glow"
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="gradient-ocean text-white hover:shadow-glow transition-smooth"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;