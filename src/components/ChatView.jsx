import { useState, useRef, useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';
import FileUpload from './FileUpload';
import ChatMessage from './ChatMessage';

export default function ChatView() {
  const { activeChatId, activeChat, userPreferences, updateDP } = useChatContext();
  const [myName, setMyName] = useState('');
  const messagesEndRef = useRef(null);

  // Default "my name" to the second user in the list (heuristic)
  useEffect(() => {
    if (activeChat?.users?.length > 1 && !myName) {
      setMyName(activeChat.users[1]);
    } else if (activeChat?.users?.length === 1 && !myName) {
      setMyName(activeChat.users[0]);
    }
  }, [activeChat, myName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

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
          {activeChat?.name?.[0] || '#'}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-lg leading-tight">{activeChat?.name}</h2>
          <p className="text-xs text-foreground/60">{activeChat?.messages?.length || 0} messages</p>
        </div>
        
        {/* Simple selector for "Who are you?" to determine right-side bubbles */}
        <select 
          className="text-xs bg-foreground/5 border border-foreground/20 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-primary"
          value={myName}
          onChange={(e) => setMyName(e.target.value)}
          title="Select who you are to align bubbles to the right"
        >
          <option value="">Select You...</option>
          {activeChat?.users?.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 pb-20">
        {activeChat?.messages?.map((msg, idx) => {
          // Show date separator if date changed
          const showDate = idx === 0 || msg.date !== activeChat.messages[idx - 1].date;
          
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
