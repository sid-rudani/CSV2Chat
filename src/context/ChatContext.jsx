import { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]); // Array of parsed chat objects
  const [activeChatId, setActiveChatId] = useState(null);
  const [theme, setTheme] = useState('friends');
  const [userPreferences, setUserPreferences] = useState({}); // Stores DPs per user

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedChats = localStorage.getItem('chatViewer_chats');
      const storedTheme = localStorage.getItem('chatViewer_theme');
      const storedPrefs = localStorage.getItem('chatViewer_prefs');

      if (storedChats) setChats(JSON.parse(storedChats));
      if (storedTheme) setTheme(storedTheme);
      if (storedPrefs) setUserPreferences(JSON.parse(storedPrefs));
    } catch (e) {
      console.error('Error loading from local storage', e);
    }
  }, []);

  // Sync to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem('chatViewer_chats', JSON.stringify(chats));
    localStorage.setItem('chatViewer_theme', theme);
    localStorage.setItem('chatViewer_prefs', JSON.stringify(userPreferences));
  }, [chats, theme, userPreferences]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const addChat = (chatData) => {
    setChats((prev) => [...prev, chatData]);
    if (!activeChatId) setActiveChatId(chatData.id);
  };

  const removeChat = (chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) setActiveChatId(null);
  };

  const updateDP = (username, imageUrl) => {
    setUserPreferences((prev) => ({
      ...prev,
      [username]: { ...prev[username], dp: imageUrl },
    }));
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        setActiveChatId,
        activeChat,
        theme,
        setTheme,
        addChat,
        removeChat,
        userPreferences,
        updateDP,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
