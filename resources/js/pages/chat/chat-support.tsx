import AppLayout from '@/layouts/app-layout'
import { useState, useEffect } from 'react';
import { BreadcrumbItem } from '@/types';
import axios from 'axios';
import dayjs from 'dayjs';
import { Send, Paperclip } from 'lucide-react';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Head } from '@inertiajs/react';
dayjs.extend(relativeTime);
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Chat Support', href: '/chat-support' },
];

export default function ChatSupport() {
    const [chatUsers, setChatUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');

    const fetchChats = async () => {
        const res = await axios.get('/chat/admin-fetch');
        setChatUsers(res.data);
        if (selectedUserId) {
            const selectedUser = res.data.find((u: any) => u.user.id === selectedUserId);
            setMessages(selectedUser?.messages || []);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || !selectedUserId) return;

        await axios.post('/chat/send', {
            message: input,
            sender: 'admin',
            receiver_id: selectedUserId,
        });

        setInput('');
        fetchChats();
    };

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 5000);
        return () => clearInterval(interval);
    }, [selectedUserId]);
    console.log(chatUsers);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chat Support" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden md:min-h-min">
                    <div className="p-4 md:p-4">
                        <div className="flex h-[90vh] rounded-xl overflow-hidden gap-4">
                            {/* Left Sidebar */}
                            <div className="w-[300px] p-4 overflow-y-auto border-sidebar-border/70 dark:border-sidebar-border rounded-xl border ">
                             
                                <div className="space-y-3">
                                    {chatUsers.map(group => (
                                        <div key={group.user.id}>
                                            {group.user.is_admin !== 3 && (
                                                <div
                                                    onClick={() => setSelectedUserId(group.user.id)}
                                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer  ${selectedUserId === group.user.id ? 'bg-gray-100 dark:bg-white/5' : ''}`}
                                                >
                                                    <div className="relative">
                                                        <img
                                                            src={`https://i.pravatar.cc/150?u=${group.user.id}`}
                                                            alt="avatar"
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-[#1A1D2E]" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{group.user.name}</span>
                                                        <span className="text-xs text-gray-400">{dayjs(group.messages.slice(-1)[0]?.created_at).fromNow()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chat Window */}
                            <div className="flex-1 flex flex-col p-4  border-sidebar-border/70 dark:border-sidebar-border rounded-xl border">
                                {/* Header */}
                                {selectedUserId && (
                                    <div className="flex items-center gap-4 border-b border-gray-100 pb-3 mb-3">
                                        <img
                                            src={`https://i.pravatar.cc/150?u=${selectedUserId}`}
                                            alt="user"
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <h2 className="font-bold text-lg">{
                                                chatUsers.find(u => u.user.id === selectedUserId)?.user.name
                                            }</h2>
                                            <p className="text-xs text-gray-400">Online</p>
                                        </div>
                                    </div>
                                )}

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto space-y-4">
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${msg.sender === 'admin'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 px-3 dark:bg-white/5'
                                                    }`}
                                            >
                                                {msg.message}
                                                <div className="text-[10px] text-right mt-1 text-gray-400">
                                                    {dayjs(msg.created_at).format('h:mm A')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Input */}
                                {selectedUserId && (
                                    <div className="flex items-center gap-3 mt-4">
                                        <button className="text-gray-400">
                                            <Paperclip size={18} />
                                        </button>
                                        <input
                                            className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 focus:outline-none"
                                            placeholder="Type your message..."
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                        />
                                        <button
                                            className="bg-blue-600 p-2 rounded-full text-white"
                                            onClick={sendMessage}
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
