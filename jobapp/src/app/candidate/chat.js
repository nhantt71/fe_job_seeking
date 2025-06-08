'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserContext } from '../context/usercontext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { PaperPlaneRight, SpinnerGap, UserCircle } from '@phosphor-icons/react';

export default function CandidateChat() {
    const searchParams = useSearchParams();
    const recruiterId = searchParams.get('recruiterId');
    const { email, account } = useUserContext();
    const [recruiterInfo, setRecruiterInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef(null);

    // Fetch recruiter info
    useEffect(() => {
        const fetchRecruiterInfo = async () => {
            if (!recruiterId) return;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/recruiter/get-recruiter-info/${recruiterId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setRecruiterInfo(data);
                } else {
                    console.error('Failed to fetch recruiter info');
                }
            } catch (error) {
                console.error('Error fetching recruiter info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecruiterInfo();
    }, [recruiterId]);

    // Set up chat room and listen for messages
    useEffect(() => {
        if (!recruiterId || !email) return;

        const chatRoomId = getChatRoomId(recruiterId, email);
        
        const setupChatRoom = async () => {
            try {
                const chatRoomsRef = collection(db, "chatRooms");
                const q = query(chatRoomsRef, where("roomId", "==", chatRoomId));
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    await addDoc(chatRoomsRef, {
                        roomId: chatRoomId,
                        participants: [recruiterId, email],
                        createdAt: serverTimestamp()
                    });
                }
            } catch (error) {
                console.error("Error setting up chat room:", error);
            }
        };
        
        setupChatRoom();
        
        const messagesRef = collection(db, "messages");
        const q = query(
            messagesRef,
            where("roomId", "==", chatRoomId),
            orderBy("timestamp", "asc")
        );
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messageList = [];
            querySnapshot.forEach((doc) => {
                messageList.push({ id: doc.id, ...doc.data() });
            });
            setMessages(messageList);
        });
        
        return () => unsubscribe();
    }, [recruiterId, email]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getChatRoomId = (recruiterId, candidateId) => {
        const ids = [recruiterId, candidateId].sort();
        return `${ids[0]}_${ids[1]}`;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !email || !recruiterId) return;

        setSending(true);
        const chatRoomId = getChatRoomId(recruiterId, email);
        
        try {
            await addDoc(collection(db, "messages"), {
                roomId: chatRoomId,
                text: newMessage,
                sender: email,
                timestamp: serverTimestamp(),
                senderName: account?.fullname || email,
                senderType: 'candidate'
            });
            
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
                    <div className="flex justify-center mb-4">
                        <SpinnerGap size={32} className="animate-spin text-blue-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Loading chat...</h2>
                    <p className="text-gray-500 mt-2">Preparing your conversation</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Chat Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto p-4 flex items-center space-x-4">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden">
                            {recruiterInfo?.avatar ? (
                                <img 
                                    src={recruiterInfo.avatar} 
                                    alt={recruiterInfo.fullname} 
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '';
                                    }}
                                />
                            ) : (
                                <UserCircle size={48} className="text-white" />
                            )}
                        </div>
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-800">{recruiterInfo?.fullname || 'Recruiter'}</h2>
                        <p className="text-sm text-gray-500">{recruiterInfo?.companyName || 'Hiring Team'}</p>
                    </div>
                </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm max-w-md w-full">
                            <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
                                <PaperPlaneRight size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">Start your conversation</h3>
                            <p className="text-gray-500 mt-2">
                                Send your first message to {recruiterInfo?.fullname || 'the recruiter'} to begin discussing opportunities
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 pb-4">
                        {messages.map((message) => (
                            <div 
                                key={message.id} 
                                className={`flex ${message.sender === email ? 'justify-end' : 'justify-start'} transition-all duration-200 ease-in-out`}
                            >
                                <div 
                                    className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 relative ${
                                        message.sender === email 
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-none' 
                                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                    }`}
                                >
                                    <p className="text-sm leading-relaxed">{message.text}</p>
                                    <div className={`text-xs mt-1 flex justify-end items-center space-x-1 ${
                                        message.sender === email ? 'text-blue-100' : 'text-gray-400'
                                    }`}>
                                        <span>
                                            {message.timestamp ? new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>
            
            {/* Message Input */}
            <div className="bg-white border-t border-gray-100 py-4 px-4">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Message ${recruiterInfo?.fullname || 'recruiter'}...`}
                            className="flex-1 border border-gray-200 rounded-full px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className={`absolute right-2 p-2 rounded-full ${newMessage.trim() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-400'} transition-colors duration-200`}
                        >
                            {sending ? (
                                <SpinnerGap size={20} className="animate-spin" />
                            ) : (
                                <PaperPlaneRight size={20} weight="fill" />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}