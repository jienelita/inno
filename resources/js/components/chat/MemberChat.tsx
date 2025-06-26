import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MessageList,
  Button
} from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import { Input } from 'antd';

const MemberChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true); // 👈

  const fetchMessages = async () => {
    const res = await axios.get('/chat/fetch');
    setMessages(res.data.map((msg: any) => ({
      position: msg.sender === 'member' ? 'right' : 'left',
      type: 'text',
      text: msg.message,
      date: new Date(msg.created_at),
    })));
  };

  const sendMessage = async (msgText?: string) => {
    const messageToSend = msgText || input.trim();
    if (!messageToSend) return;

    await axios.post('/chat/send', {
      message: messageToSend,
      sender: 'member',
    });

    setInput('');
    setShowQuickReplies(false); // 👈 Hide after sending
    fetchMessages();
  };

  const handlePredefinedMessage = (text: string) => {
    sendMessage(text);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='border-sidebar-border/70 dark:border-sidebar-border rounded-xl border' style={{ padding: 20 }}>
      <div className="chat-box" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div className="min-h-[75vh] overflow-auto space-y-4">
          {/* 👇 Quick Replies Section */}
          <MessageList
            className="message-list"
            lockable
            toBottomHeight={'100%'}
            dataSource={messages}
          />
          {showQuickReplies && (
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                'What are your loan requirements?',
                'How can I update my contact info?',
                'Where can I check my balance?',
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePredefinedMessage(q)}
                  className="bg-gray-200 text-sm text-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-300"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          
        </div>

        {/* Input Box */}
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e: any) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button text="Send" onClick={() => sendMessage()} />
        </div>
      </div>
    </div>
  );
};

export default MemberChat;
