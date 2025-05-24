"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Send,
  Building2,
  Briefcase,
  Calendar
} from "lucide-react";

// Mock data - in a real app this would come from the backend
const mockConversations = [
  {
    id: "conv1",
    name: "TechCorp",
    role: "company",
    lastMessage: "Thanks for your interest! When would you be available for an interview?",
    time: "10:30 AM",
    unread: true,
    jobTitle: "Senior Frontend Developer",
    matchPercentage: 94,
    avatar: "TC"
  },
  {
    id: "conv2",
    name: "DesignHub",
    role: "company",
    lastMessage: "We've reviewed your portfolio and we're impressed!",
    time: "Yesterday",
    unread: false,
    jobTitle: "UX/UI Designer",
    matchPercentage: 91,
    avatar: "DH"
  },
  {
    id: "conv3",
    name: "Alex Chen",
    role: "candidate",
    lastMessage: "I'm very interested in the role. Could you tell me more about the team?",
    time: "Yesterday",
    unread: true,
    jobTitle: "Senior Frontend Developer",
    matchPercentage: 92,
    avatar: "AC"
  },
  {
    id: "conv4",
    name: "Sarah Johnson",
    role: "candidate",
    lastMessage: "Thank you for considering my application!",
    time: "Apr 10",
    unread: false,
    jobTitle: "UX Designer",
    matchPercentage: 88,
    avatar: "SJ"
  },
];

const mockMessages = [
  {
    id: "msg1",
    conversationId: "conv1",
    sender: "user",
    content: "Hi, I'm very interested in the Senior Frontend Developer position at TechCorp. I noticed we matched at 94%!",
    timestamp: "2023-04-15T10:15:00Z"
  },
  {
    id: "msg2",
    conversationId: "conv1",
    sender: "other",
    content: "Hello! Thanks for reaching out. Yes, our AI matching system shows that your skills and experience are a great fit for the role.",
    timestamp: "2023-04-15T10:20:00Z"
  },
  {
    id: "msg3",
    conversationId: "conv1",
    sender: "other",
    content: "I was particularly impressed with your React and TypeScript experience. Could you tell me more about your most recent project?",
    timestamp: "2023-04-15T10:22:00Z"
  },
  {
    id: "msg4",
    conversationId: "conv1",
    sender: "user",
    content: "Of course! In my current role, I led the development of a real-time analytics dashboard using React, TypeScript, and GraphQL. The application processes millions of data points and presents them in an intuitive interface.",
    timestamp: "2023-04-15T10:25:00Z"
  },
  {
    id: "msg5",
    conversationId: "conv1",
    sender: "other",
    content: "That sounds impressive! How did you handle performance optimization with such large amounts of data?",
    timestamp: "2023-04-15T10:28:00Z"
  },
  {
    id: "msg6",
    conversationId: "conv1",
    sender: "user",
    content: "We implemented several strategies: virtualized lists for rendering long data sets, memoization to prevent unnecessary re-renders, and a custom caching layer for GraphQL queries. This reduced load times by 70%.",
    timestamp: "2023-04-15T10:29:00Z"
  },
  {
    id: "msg7",
    conversationId: "conv1",
    sender: "other",
    content: "Thanks for your interest! When would you be available for an interview?",
    timestamp: "2023-04-15T10:30:00Z"
  },
];

export default function Messages() {
  const [activeConversation, setActiveConversation] = useState(mockConversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  
  // In a real app, we would detect user type from authentication
  const [userType, setUserType] = useState<"job-seeker" | "recruiter">("job-seeker");
  
  const filteredConversations = mockConversations.filter(
    conv => (userType === "job-seeker" ? conv.role === "company" : conv.role === "candidate") && 
            conv.name.toLowerCase().includes(searchInput.toLowerCase())
  );
  
  const currentMessages = mockMessages.filter(
    msg => msg.conversationId === activeConversation.id
  );
  
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleSendMessage = () => {
    if (messageInput.trim() === "") return;
    
    // In a real app, this would send the message to the backend
    console.log("Sending message:", messageInput);
    
    // Clear input after sending
    setMessageInput("");
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>
      
      <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Conversation List */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-0.5">
              {filteredConversations.map((conversation) => (
                <div key={conversation.id}>
                  <button
                    className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                      activeConversation.id === conversation.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {conversation.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">{conversation.name}</h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {conversation.time}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mb-1">
                          {userType === "job-seeker" ? (
                            <Briefcase className="h-3 w-3 mr-1 flex-shrink-0" />
                          ) : (
                            <User className="h-3 w-3 mr-1 flex-shrink-0" />
                          )}
                          <span className="truncate">{conversation.jobTitle}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm truncate text-muted-foreground">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unread && (
                            <span className="h-2 w-2 bg-primary rounded-full flex-shrink-0 ml-2"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                  <Separator />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Message Area */}
        <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col">
          {/* Conversation Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {activeConversation.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{activeConversation.name}</h2>
                  <Badge variant="outline" className={`text-xs ${
                    activeConversation.matchPercentage >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                  }`}>
                    {activeConversation.matchPercentage}% Match
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {activeConversation.role === "company" ? (
                    <>
                      <Building2 className="h-3 w-3 mr-1" />
                      <span>{activeConversation.jobTitle}</span>
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-3 w-3 mr-1" />
                      <span>Applying for: {activeConversation.jobTitle}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
          
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Added to fix the undefined User component
const User = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);