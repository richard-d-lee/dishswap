import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { format } from "date-fns";
import { UserLink } from "@/components/UserLink";

export default function Messages() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: conversations, isLoading: loadingConversations } =
    trpc.messages.getConversations.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  const { data: messages, refetch: refetchMessages } = trpc.messages.getConversation.useQuery(
    { otherUserId: selectedConversation || 0 },
    { enabled: !!selectedConversation }
  );

  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      toast.success("Message sent!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to view messages</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    sendMutation.mutate({
      receiverId: selectedConversation,
      messageText: messageText.trim(),
      sessionId: 0,
    });
  };

  const selectedConversationData = conversations?.find(
    (c: any) => c.partnerId === selectedConversation
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with hosts and dishwashers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingConversations ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading conversations...
                </div>
              ) : !conversations || conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  {conversations.map((conv: any) => {
                    const isSelected = selectedConversation === conv.partnerId;
                    return (
                      <div key={conv.partnerId}>
                        <button
                          onClick={() => setSelectedConversation(conv.partnerId)}
                          className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${isSelected ? "bg-muted" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {conv.sender?.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {conv.sender?.name || "User"}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {conv.lastMessage?.messageText || "No messages"}
                              </p>
                            </div>
                          </div>
                        </button>
                        <Separator />
                      </div>
                    );
                  })}
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedConversationData?.sender?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <UserLink 
                      userId={selectedConversation} 
                      name={selectedConversationData?.sender?.name || "User"}
                      className="text-xl"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4 mb-4">
                    {!messages || messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg: any) => {
                          const isOwn = msg.message.senderId === user?.id;
                          const justifyClass = isOwn ? "justify-end" : "justify-start";
                          const bgClass = isOwn ? "bg-primary text-primary-foreground" : "bg-muted";
                          const timeClass = isOwn ? "text-primary-foreground/70" : "text-muted-foreground";
                          
                          return (
                            <div
                              key={msg.message.id}
                              className={`flex ${justifyClass}`}
                            >
                              <div className={`max-w-[70%] rounded-lg p-3 ${bgClass}`}>
                                <p className="text-sm">{msg.message.messageText}</p>
                                <p className={`text-xs mt-1 ${timeClass}`}>
                                  {format(new Date(msg.message.createdAt), "p")}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      disabled={sendMutation.isPending}
                    />
                    <Button
                      type="submit"
                      disabled={!messageText.trim() || sendMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <CardContent className="h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a conversation to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
