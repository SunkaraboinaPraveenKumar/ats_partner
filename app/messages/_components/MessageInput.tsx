import React, { useState, useRef, useEffect } from "react";
// import { useMutation } from "convex/react"; // No longer needed
// import { api } from "@/convex/_generated/api"; // No longer needed
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile } from "lucide-react";
// import { Id, Doc } from '@/convex/_generated/dataModel'; // No longer needed

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState("");
  // const [isSending, setIsSending] = useState(false); // No longer needed
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // const sendMessage = useMutation(api.messages.sendMessage); // No longer needed

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return; // Use isLoading from props

    const messageToSend = message.trim();
    setMessage("");
    // setIsSending(true); // No longer needed

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      // setIsSending(false); // No longer needed
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="space-y-2">
      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2">
        {[
          "Tell me more about this role",
          "What\'s the company culture like?",
          "What are the growth opportunities?",
          "Can you explain the benefits?"
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              setMessage(suggestion);
            }}
            className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* Attachment button */}
        <button
          type="button"
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Message textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full resize-none border-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none min-h-[24px] max-h-[120px]"
            rows={1}
            disabled={isLoading} // Use isLoading from props
          />
          
          {/* Character count */}
          {message.length > 0 && (
            <div className="absolute -bottom-5 right-0 text-xs text-gray-400">
              {message.length}/2000
            </div>
          )}
        </div>

        {/* Emoji button */}
        <button
          type="button"
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Add emoji"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading} // Use isLoading from props
          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-4 py-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Typing indicator area */}
      <div className="text-xs text-gray-500 dark:text-gray-400 h-4">
        {/* You might show a typing indicator here based on isSending or parent state */}
      </div>
    </div>
  );
};

export default MessageInput;