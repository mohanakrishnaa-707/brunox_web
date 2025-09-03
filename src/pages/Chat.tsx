import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Users, Hash, Search, UserPlus, Wallet, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useFriends } from '@/hooks/useFriends';
import { useWeb3 } from '@/hooks/useWeb3';
import { formatDistanceToNow } from 'date-fns';

interface SearchResult {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  status: string;
}

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations, loading, createDirectConversation } = useChat();
  const { friends, searchUsers, sendFriendRequest } = useFriends();
  const { account, balance, isConnected, connectWallet } = useWeb3();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (friendId: string) => {
    try {
      const conversationId = await createDirectConversation(friendId);
      if (conversationId) {
        navigate(`/chat/${conversationId}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="flex h-screen">
      {/* Friends Sidebar */}
      <div className="w-80 bg-card border-r border-border overflow-y-auto">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Friends & Search
            </h2>
          </div>

          {/* Blockchain Status */}
          <Card className="p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Ganache</span>
              </div>
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            {isConnected ? (
              <div className="text-xs text-muted-foreground">
                <div className="truncate mb-1">{account}</div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {parseFloat(balance).toFixed(4)} ETH
                </div>
              </div>
            ) : (
              <Button 
                onClick={connectWallet}
                size="sm"
                className="w-full gradient-ocean text-white"
              >
                Connect Wallet
              </Button>
            )}
          </Card>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="transition-smooth focus:shadow-glow"
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={isSearching || !searchTerm.trim()}
                className="gradient-ocean text-white"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Search Results</h3>
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="gradient-ocean text-white text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{user.display_name || user.username}</div>
                        <div className="text-xs text-muted-foreground">@{user.username}</div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => sendFriendRequest(user.id)}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <UserPlus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
            </div>
          )}

          {/* Friends List */}
          <div>
            <h3 className="text-sm font-medium mb-2">Friends ({friends.length})</h3>
            <div className="space-y-2">
              {friends.map((friend) => (
                <div 
                  key={friend.id}
                  onClick={() => handleStartChat(friend.friend_id)}
                  className="flex items-center gap-3 p-2 border rounded-lg hover:shadow-ocean transition-smooth cursor-pointer"
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={friend.friend_profile?.avatar_url} />
                      <AvatarFallback className="gradient-ocean text-white">
                        {friend.friend_profile?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(friend.friend_profile?.status || 'offline')}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {friend.friend_profile?.display_name || friend.friend_profile?.username}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {friend.friend_profile?.status || 'offline'}
                    </div>
                  </div>
                </div>
              ))}
              
              {friends.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No friends yet</p>
                  <p className="text-xs">Search above to add friends</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            BrunoX Chat
          </h1>
          <p className="text-muted-foreground mt-2">
            Decentralized messaging powered by blockchain
          </p>
        </div>

        {conversations.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
            <p className="text-muted-foreground">
              Click on a friend to start chatting or search for new friends!
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
    </div>
  );
};

export default Chat;