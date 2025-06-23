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

  const fetchMessages = async () => {
    const res = await axios.get('/chat/fetch');
    setMessages(res.data.map((msg: any) => ({
      position: msg.sender === 'member' ? 'right' : 'left',
      type: 'text',
      text: msg.message,
      date: new Date(msg.created_at),
    })));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    await axios.post('/chat/send', {
      message: input,
      sender: 'member',
    });

    setInput('');
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='border-sidebar-border/70 dark:border-sidebar-border rounded-xl border' style={{padding: 20}}>
      <div className="chat-box" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div className="min-h-[75vh] overflow-auto ">
          <MessageList
            className="message-list"
            lockable
            toBottomHeight={'100%'}
            dataSource={messages}
          />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e: any) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button text="Send" onClick={sendMessage} />
        </div>
      </div>
    </div>
  );
};

export default MemberChat;
