import { useChatContext } from '../context/ChatContext';
import { UploadCloud, MessageSquare, Trash2, Settings, Palette, PlusCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const { chats, activeChatId, setActiveChatId, removeChat, theme, setTheme } = useChatContext();

  const themes = [
    { id: 'friends', label: 'Friends', color: 'bg-orange-400' },
    { id: 'spicy', label: 'Spicy', color: 'bg-red-500' },
    { id: 'besties', label: 'Besties', color: 'bg-purple-400' },
    { id: 'family', label: 'Family', color: 'bg-blue-400' },
  ];

  return (
    <div className="w-80 h-full bg-sidebar backdrop-blur-md text-sidebar-foreground border-r border-foreground/10 flex flex-col shrink-0 transition-colors duration-500">
      <div className="p-4 border-b border-foreground/10 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Chat Viewer
        </h1>
        <button 
          onClick={() => setActiveChatId(null)}
          className="p-1.5 rounded-full hover:bg-foreground/10 text-primary transition-colors"
          title="Add New Chat"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chats.length === 0 ? (
          <div className="text-center text-sm opacity-60 mt-10">
            No chats uploaded yet.
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={clsx(
                "p-3 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-between group",
                activeChatId === chat.id 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-foreground/5"
              )}
            >
              <div className="truncate font-medium flex-1">
                {chat.name || 'Unnamed Chat'}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeChat(chat.id);
                }}
                className={clsx(
                  "p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                  activeChatId === chat.id ? "hover:bg-black/10" : "hover:bg-foreground/10 text-red-500"
                )}
                title="Delete Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-foreground/10">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
          <Palette className="w-4 h-4" />
          Themes
        </div>
        <div className="flex justify-between gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={clsx(
                "w-8 h-8 rounded-full border-2 transition-transform duration-300",
                t.color,
                theme === t.id ? "border-foreground scale-110 shadow-lg" : "border-transparent hover:scale-105"
              )}
              title={t.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
