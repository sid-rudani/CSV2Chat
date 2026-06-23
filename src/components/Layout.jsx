import Sidebar from './Sidebar';
import { useChatContext } from '../context/ChatContext';
import ChatView from './ChatView';

export default function Layout() {
  const { activeChatId } = useChatContext();

  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 relative flex flex-col h-full bg-transparent transition-colors duration-500">
        <ChatView />
      </main>
    </div>
  );
}
