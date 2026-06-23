import { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { parseWhatsAppChat } from '../utils/whatsappParser';

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { addChat } = useChatContext();

  const handleFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsedData = parseWhatsAppChat(text);
      
      const chatName = file.name.replace('.txt', '').replace('WhatsApp Chat with ', '').trim();
      
      addChat({
        id: Date.now().toString(),
        name: chatName || 'Unknown Chat',
        ...parsedData
      });
    };
    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
        isDragging ? 'border-primary bg-primary/10 scale-105' : 'border-foreground/20 hover:border-primary/50 hover:bg-foreground/5'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept=".txt"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <div className="flex flex-col items-center gap-4 text-foreground/70 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
          <p className="text-sm mt-1 text-foreground/60">WhatsApp exported .txt file</p>
        </div>
      </div>
    </div>
  );
}
