import React from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Bot, User, Briefcase } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MessageListProps {
  messages: Doc<"messages">[];
  currentUserId?: Id<"users">;
  application?: Doc<"applications"> | null;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUserId,
  application 
}) => {
  const formatMessageTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  };

  const isCurrentUser = (senderId: Id<"users">) => {
    return senderId === currentUserId;
  };

  const isAiMessage = (message: Doc<"messages">) => {
    return message.isAiResponse === true;
  };

  const formatMessageContent = (content: string) => {
    // Basic markdown-like formatting
    let formatted = content
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Improved bullet points
      .replace(/^- (.+)$/gm, '<li style="margin-left: 20px;">$1</li>') // Add margin-left for indentation
      .replace(/(\n|^)(<li.*?<\/li>)+/g, '$1<ul>$2</ul>'); // Wrap consecutive list items in ul

    // Clean up empty <ul></ul> tags that might appear if there are no list items
    formatted = formatted.replace(/<ul><\/ul>/g, '');

    return formatted;
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Start the conversation
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Send a message to begin discussing this job opportunity, or ask the AI assistant for help.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((message, index) => {
        const isUser = isCurrentUser(message.senderId);
        const isAi = isAiMessage(message);
        const showTimestamp = index === 0 || 
          (messages[index - 1] && 
           Math.abs(message._creationTime - messages[index - 1]._creationTime) > 300000); // 5 minutes

        return (
          <div key={message._id} className="group">
            {/* Timestamp separator */}
            {showTimestamp && (
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-3 py-1 rounded-full">
                  {formatMessageTime(message._creationTime)}
                </div>
              </div>
            )}

            {/* Message - AI always on left, User always on right */}
            <div className={`flex items-start gap-3 ${isUser && !isAi ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className="flex-shrink-0">
                {isAi ? (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isUser 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-purple-100 dark:bg-purple-900'
                  }`}>
                    <User className={`h-4 w-4 ${
                      isUser 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                )}
              </div>

              {/* Message content */}
              <div className={`flex-1 max-w-2xl ${isUser && !isAi ? 'text-right' : ''}`}>
                {/* Sender name */}
                <div className={`text-xs font-semibold mb-1 ${
                  isAi 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : isUser 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-purple-600 dark:text-purple-400'
                }`}>
                  {isAi ? 'AI Assistant' : isUser ? 'You' : 'Employer'}
                </div>

                {/* Message bubble */}
                <div className={`inline-block max-w-full rounded-lg px-4 py-3 ${
                  isAi
                    ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800'
                    : isUser
                      ? 'bg-green-500 dark:bg-green-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}>
                  <div 
                    className={`text-sm leading-relaxed ${
                      isUser && !isAi
                        ? 'text-white' 
                        : isAi 
                          ? 'text-gray-900 dark:text-gray-100' 
                          : 'text-gray-900 dark:text-gray-100'
                    }`}
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageContent(message.content) 
                    }} 
                  />
                </div>

                {/* Message time (shown on hover) */}
                <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isUser && !isAi ? 'text-right' : 'text-left'
                }`}>
                  {formatDistanceToNow(new Date(message._creationTime), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;