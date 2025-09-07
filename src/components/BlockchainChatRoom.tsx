import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft, Shield, Zap, Clock } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useGanache } from '@/hooks/useGanache';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface BlockchainChatRoomProps {
  conversationId: string;
  onBack: () => void;
}

export const BlockchainChatRoom = ({ conversationId, onBack }: BlockchainChatRoomProps) => {
  const { user } = useAuth();
  const { messages, sendMessage, loadMessages } = useChat();
  const { isConnected, sendMessage: sendBlockchainMessage } = useGanache();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      let blockchainHash;
      
      // Try to send to blockchain first if connected
      if (isConnected) {
        try {
          const recipientAddress = '0x0000000000000000000000000000000000000000'; // Mock recipient
          blockchainHash = await sendBlockchainMessage(recipientAddress, newMessage);
          console.log('Message sent to blockchain:', blockchainHash);
        } catch (error) {
          console.warn('Blockchain send failed, continuing with regular message:', error);
        }
      }

      // Send to Supabase database
      await sendMessage(newMessage, blockchainHash);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getMessageStatus = (message: any) => {
    if (message.blockchain_verified && message.blockchain_hash) {
      return (
        <div title="Blockchain Verified">
          <Shield className="w-3 h-3 text-green-500" />
        </div>
      );
    } else if (message.blockchain_hash) {
      return (
        <div title="Blockchain Pending">
          <Zap className="w-3 h-3 text-yellow-500" />
        </div>
      );
    }
    return (
      <div title="Database Only">
        <Clock className="w-3 h-3 text-gray-400" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="p-2 md:p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-base md:text-lg font-semibold">Blockchain Chat</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isConnected ? (
                  <Badge variant="default" className="text-xs gradient-ocean text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    Blockchain Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Database Only
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === user?.id;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                {!isOwnMessage && (
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={message.sender?.avatar_url} />
                      <AvatarFallback className="gradient-ocean text-white text-xs">
                        {message.sender?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">
                      {message.sender?.display_name || message.sender?.username}
                    </span>
                  </div>
                )}
                
                <Card className={`p-3 ${
                  isOwnMessage 
                    ? 'bg-primary text-primary-foreground gradient-ocean text-white' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm break-words">{message.content}</p>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
                    <div className="flex items-center gap-2">
                      {getMessageStatus(message)}
                      <span className="text-xs opacity-70">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {message.blockchain_hash && (
                      <Badge 
                        variant="outline" 
                        className="text-xs border-white/30 text-current"
                        title={`Blockchain Hash: ${message.blockchain_hash}`}
                      >
                        Verified
                      </Badge>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <Card className="p-2 md:p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder={isConnected ? "Send a blockchain-verified message..." : "Send a message..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 transition-smooth focus:shadow-glow"
            disabled={isSending}
          />
          <Button 
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="gradient-ocean text-white"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        
        {isConnected && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3 text-green-500" />
            Messages are being stored on the blockchain for maximum security
          </div>
        )}
      </Card>
    </div>
  );
};