'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRecruiterContext } from '../context/recruitercontext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';

export default function RecruiterChat() {
    const searchParams = useSearchParams();
    const candidateId = searchParams.get('candidateId');
    const { recruiter } = useRecruiterContext();
    const [candidateInfo, setCandidateInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    // Fetch candidate info
    useEffect(() => {
        const fetchCandidateInfo = async () => {
            if (!candidateId) return;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/candidate/get-candidate-info/${candidateId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setCandidateInfo(data);
                } else {
                    console.error('Failed to fetch candidate info');
                }
            } catch (error) {
                console.error('Error fetching candidate info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidateInfo();
    }, [candidateId]);

    // Set up chat room and listen for messages
    useEffect(() => {
        if (!candidateId || !recruiter || !recruiter.email) return;

        const chatRoomId = getChatRoomId(recruiter.email, candidateId);
        
        const setupChatRoom = async () => {
            try {
                const chatRoomsRef = collection(db, "chatRooms");
                const q = query(chatRoomsRef, where("roomId", "==", chatRoomId));
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    await addDoc(chatRoomsRef, {
                        roomId: chatRoomId,
                        participants: [recruiter.email, candidateId],
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
    }, [candidateId, recruiter]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        setIsTyping(newMessage.length > 0);
    }, [newMessage]);

    const getChatRoomId = (recruiterId, candidateId) => {
        const ids = [recruiterId, candidateId].sort();
        return `${ids[0]}_${ids[1]}`;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !recruiter || !candidateId) return;

        const chatRoomId = getChatRoomId(recruiter.email, candidateId);
        
        try {
            await addDoc(collection(db, "messages"), {
                roomId: chatRoomId,
                text: newMessage,
                sender: recruiter.email,
                timestamp: serverTimestamp(),
                senderName: recruiter.fullname || recruiter.email,
                senderType: 'recruiter'
            });
            
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <p className="text-gray-600">Loading conversation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-md">
                <div className="container mx-auto flex items-center">
                    <div className="relative">
                        <img 
                            src={candidateInfo?.avatar || '/default-avatar.png'} 
                            alt={candidateInfo?.fullname || 'Candidate'} 
                            className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-avatar.png';
                            }}
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                    </div>
                    <div className="ml-4">
                        <h2 className="text-xl font-semibold">{candidateInfo?.fullname || 'Candidate'}</h2>
                        <p className="text-sm opacity-90">{candidateInfo?.title || 'Job Seeker'}</p>
                    </div>
                    <div className="ml-auto flex space-x-2">
                        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                            </svg>
                        </button>
                        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 container mx-auto">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="bg-indigo-100 p-6 rounded-full mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No messages yet</h3>
                        <p className="text-gray-500 max-w-md">Start the conversation with {candidateInfo?.fullname || 'the candidate'} about potential opportunities.</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-w-3xl mx-auto">
                        {messages.map((message) => (
                            <div 
                                key={message.id} 
                                className={`flex ${message.sender === recruiter.email ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className="flex max-w-[80%]">
                                    {message.sender !== recruiter.email && (
                                        <div className="flex-shrink-0 mr-2">
                                            <img 
                                                src={candidateInfo?.avatar || '/default-avatar.png'} 
                                                alt={candidateInfo?.fullname || 'Candidate'} 
                                                className="h-8 w-8 rounded-full"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/default-avatar.png';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div
                                        className={`rounded-2xl p-4 relative ${
                                            message.sender === recruiter.email
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                                                : 'bg-white text-gray-800 shadow-sm'
                                        }`}
                                    >
                                        <p className="text-sm">{message.text}</p>
                                        <p className={`text-xs mt-1 ${
                                            message.sender === recruiter.email 
                                                ? 'text-white/70' 
                                                : 'text-gray-500'
                                        }`}>
                                            {formatTime(message.timestamp)}
                                        </p>
                                        {message.sender === recruiter.email && (
                                            <div className="absolute -bottom-1 right-0 w-3 h-3 bg-indigo-500 transform rotate-45"></div>
                                        )}
                                        {message.sender !== recruiter.email && (
                                            <div className="absolute -bottom-1 left-0 w-3 h-3 bg-white transform rotate-45"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>
            
            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 py-4">
                <div className="container mx-auto px-4">
                    <form onSubmit={handleSendMessage} className="relative">
                        <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 shadow-inner">
                            <button type="button" className="text-gray-400 hover:text-gray-600 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className={`p-2 rounded-full transition-all duration-300 ${
                                    isTyping
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform hover:scale-105'
                                        : 'text-gray-400'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}