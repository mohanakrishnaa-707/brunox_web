import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Users, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  status: string;
}

const AddFriend = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    
    // Mock search results for demonstration
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          username: 'alice_ocean',
          display_name: 'Alice Marine',
          avatar_url: '',
          status: 'online'
        },
        {
          id: '2',
          username: 'bob_marine',
          display_name: 'Bob Explorer',
          avatar_url: '',
          status: 'away'
        },
        {
          id: '3',
          username: 'carol_deep',
          display_name: 'Carol Deep',
          avatar_url: '',
          status: 'offline'
        }
      ];
      
      // Filter results based on search term
      const filtered = mockResults.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(filtered);
      setIsSearching(false);
    }, 1000);
  };

  const handleAddFriend = async (user: SearchResult) => {
    try {
      // Mock friend request
      toast({
        title: "Friend request sent!",
        description: `Sent a friend request to ${user.username}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send friend request",
        description: "Please try again later.",
        variant: "destructive",
      });
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
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-primary" />
          Add Friends
        </h1>
        <p className="text-muted-foreground mt-2">
          Connect with others in the decentralized ocean
        </p>
      </div>

      <div className="space-y-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Users
            </CardTitle>
            <CardDescription>
              Search by username or wallet address to connect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Username or Wallet Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    type="text"
                    placeholder="alice_ocean or 0x123..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="transition-smooth focus:shadow-glow flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSearching || !searchTerm.trim()}
                    className="gradient-ocean text-white hover:shadow-glow transition-smooth"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Search Results
              </CardTitle>
              <CardDescription>
                Found {searchResults.length} user{searchResults.length === 1 ? '' : 's'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:shadow-ocean transition-smooth"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="gradient-ocean text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">{user.display_name || user.username}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {user.username}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleAddFriend(user)}
                      size="sm"
                      className="gradient-ocean text-white hover:shadow-glow transition-smooth"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Friend
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Connect Options */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Connect</CardTitle>
            <CardDescription>
              Popular ways to find and connect with friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col gap-2 transition-smooth hover:shadow-glow"
              >
                <Hash className="w-6 h-6 text-primary" />
                <div className="text-center">
                  <div className="font-semibold">Join Communities</div>
                  <div className="text-xs text-muted-foreground">
                    Discover public groups and channels
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col gap-2 transition-smooth hover:shadow-glow"
              >
                <Users className="w-6 h-6 text-primary" />
                <div className="text-center">
                  <div className="font-semibold">Invite via Link</div>
                  <div className="text-xs text-muted-foreground">
                    Share your profile link with others
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddFriend;