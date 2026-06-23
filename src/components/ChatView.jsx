import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useChatContext } from '../context/ChatContext';
import FileUpload from './FileUpload';
import ChatMessage from './ChatMessage';
import { Ghost } from 'lucide-react';
import clsx from 'clsx';

export default function ChatView() {
  const { activeChatId, activeChat, userPreferences, updateDP, isGhostMode, setIsGhostMode } = useChatContext();
  const [myName, setMyName] = useState('');
  const [visibleCount, setVisibleCount] = useState(100);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const isLoadingMoreRef = useRef(false);

  // Default "my name" to the second user in the list (heuristic)
  useEffect(() => {
    if (activeChat?.users?.length > 1 && !myName) {
      setMyName(activeChat.users[1]);
    } else if (activeChat?.users?.length === 1 && !myName) {
      setMyName(activeChat.users[0]);
    }
  }, [activeChat, myName]);

  // Reset visible messages when switching chats
  useEffect(() => {
    setVisibleCount(100);
  }, [activeChatId]);

  // Only scroll to bottom when the chat first loads or a new message arrives,
  // not when we load older messages
  useEffect(() => {
    if (visibleCount === 100) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages, visibleCount]);

  const loadMoreMessages = () => {
    if (activeChat?.messages && visibleCount < activeChat.messages.length) {
      if (scrollContainerRef.current) {
        previousScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
      }
      isLoadingMoreRef.current = true;
      setVisibleCount(prev => Math.min(prev + 100, activeChat.messages.length));
    }
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop < 50 && !isLoadingMoreRef.current) {
      loadMoreMessages();
    }
  };

  useLayoutEffect(() => {
    if (isLoadingMoreRef.current && scrollContainerRef.current) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      const heightDifference = newScrollHeight - previousScrollHeightRef.current;
      scrollContainerRef.current.scrollTop += heightDifference;
      isLoadingMoreRef.current = false;
    }
  }, [visibleCount, activeChat?.messages]);

  const visibleMessages = activeChat?.messages?.slice(-visibleCount) || [];

  const getGhostName = (originalName) => {
    if (!isGhostMode) return originalName;
    const idx = activeChat?.users?.indexOf(originalName);
    return `Ghost ${idx !== -1 ? idx + 1 : ''}`.trim();
  };

  if (!activeChatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <span className="text-4xl">💬</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Welcome to Chat Viewer</h2>
          <p className="text-foreground/70">
            Upload your WhatsApp chat export (.txt file) to view it in a beautiful, themable interface.
          </p>
          <FileUpload />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-foreground/5 backdrop-blur-3xl relative">
      {/* Header */}
      <div className="h-16 px-6 flex items-center gap-4 bg-background/80 backdrop-blur-md border-b border-foreground/10 shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md">
          {isGhostMode ? 'G' : (activeChat?.name?.[0] || '#')}
        </div>
        <div className="flex-1 flex items-center gap-3">
          <div>
            <h2 className="font-semibold text-lg leading-tight">{isGhostMode ? 'Ghost' : activeChat?.name}</h2>
            <p className="text-xs text-foreground/60">{activeChat?.messages?.length || 0} messages</p>
          </div>
          <button 
            onClick={() => setIsGhostMode(!isGhostMode)}
            className={clsx("p-1.5 rounded-full transition-colors", isGhostMode ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-foreground/10 text-foreground/50")}
            title="Toggle Ghost Mode"
          >
            <Ghost className="w-4 h-4" />
          </button>
        </div>
        
        {/* Simple selector for "Who are you?" to determine right-side bubbles */}
        <select 
          className="text-xs bg-foreground/5 border border-foreground/20 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-primary max-w-[120px] md:max-w-none"
          value={myName}
          onChange={(e) => setMyName(e.target.value)}
          title="Select who you are to align bubbles to the right"
        >
          <option value="">Select You...</option>
          {activeChat?.users?.map(u => (
            <option key={u} value={u}>{getGhostName(u)}</option>
          ))}
        </select>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 pb-20"
        onScroll={handleScroll}
      >
        {activeChat?.messages && visibleCount < activeChat.messages.length && (
          <div className="flex justify-center my-4">
            <button 
              onClick={loadMoreMessages}
              className="text-xs font-medium bg-foreground/10 hover:bg-foreground/20 text-foreground/70 px-4 py-1.5 rounded-full transition-colors backdrop-blur-sm"
            >
              Load previous messages...
            </button>
          </div>
        )}
        {visibleMessages.map((msg, idx) => {
          // Show date separator if date changed
          const showDate = idx === 0 || msg.date !== visibleMessages[idx - 1].date;
          
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-6">
                  <div className="bg-foreground/5 backdrop-blur-sm text-foreground/60 text-xs px-3 py-1 rounded-md font-medium shadow-sm">
                    {msg.date}
                  </div>
                </div>
              )}
              <ChatMessage 
                msg={msg} 
                displayName={getGhostName(msg.author)}
                isSender={msg.author === myName} 
                dp={userPreferences[msg.author]?.dp} 
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Settings / DP Upload Floating Action Button could go here */}
    </div>
  );
}
