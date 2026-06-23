import clsx from 'clsx';
import { useRef } from 'react';
import { useChatContext } from '../context/ChatContext';

export default function ChatMessage({ msg, isSender, dp }) {
  const { updateDP } = useChatContext();
  const fileInputRef = useRef(null);

  const handleDPClick = () => {
    if (!isSender) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateDP(msg.author, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (msg.isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-foreground/10 text-foreground/70 text-xs px-3 py-1 rounded-full shadow-sm">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("flex w-full mb-4", isSender ? "justify-end" : "justify-start")}>
      {!isSender && (
        <div 
          onClick={handleDPClick}
          className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mr-2 shadow-sm font-bold overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all relative group"
          title={`Upload DP for ${msg.author}`}
        >
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          {dp ? <img src={dp} alt={msg.author} className="w-full h-full object-cover" /> : msg.author[0]?.toUpperCase()}
          <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-[10px] text-white">
            DP
          </div>
        </div>
      )}
      
      <div className={clsx(
        "max-w-[75%] md:max-w-[60%] flex flex-col rounded-2xl px-4 py-2 shadow-md relative group",
        isSender 
          ? "bg-bubble-sender text-bubble-text rounded-tr-sm" 
          : "bg-bubble-receiver text-bubble-text rounded-tl-sm"
      )}>
        {!isSender && (
          <span className="text-xs font-bold text-foreground/60 mb-1">
            {msg.author}
          </span>
        )}
        
        <span className="text-sm md:text-base leading-relaxed whitespace-pre-wrap word-break">
          {msg.content}
        </span>
        
        <span className="text-[10px] opacity-60 self-end mt-1 font-medium">
          {msg.time}
        </span>
      </div>
    </div>
  );
}
