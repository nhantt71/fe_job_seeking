'use client';

import { useState, useEffect, useRef } from 'react';
import { useUserContext } from '../context/usercontext';
import Link from 'next/link';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';

const ChatBox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [chatRooms, setChatRooms] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const chatEndRef = useRef(null);
    const { email, account } = useUserContext();
    const [userEmail, setUserEmail] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/auth/current-user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.username) {
                        setIsAuthenticated(true);
                        // Store email from response or context
                        const userEmailValue = data.email || email || localStorage.getItem('email');
                        setUserEmail(userEmailValue);
                        console.log('User authenticated with email:', userEmailValue);
                    } else {
                        setIsAuthenticated(false);
                    }
                } else {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [email]);

    // Listen for the openChatWithCandidate event
    useEffect(() => {
        const handleOpenChat = (event) => {
            console.log('Received openChatWithCandidate event:', event.detail);
            setIsOpen(true);
            if (event.detail) {
                setActiveChat(event.detail);
            }
        };

        window.addEventListener('openChatWithCandidate', handleOpenChat);
        
        // Check if there's a stored active chat room
        const storedChatRoom = localStorage.getItem('activeChatRoom');
        if (storedChatRoom) {
            try {
                const chatRoomData = JSON.parse(storedChatRoom);
                console.log('Found stored chat room:', chatRoomData);
                // Only set if we don't already have an active chat
                if (!activeChat) {
                    setActiveChat(chatRoomData);
                    setIsOpen(true);
                }
                // Clear the stored chat room to avoid reopening it on future page loads
                localStorage.removeItem('activeChatRoom');
            } catch (error) {
                console.error('Error parsing stored chat room:', error);
            }
        }

        return () => {
            window.removeEventListener('openChatWithCandidate', handleOpenChat);
        };
    }, [activeChat]);

    // Load chat rooms when authenticated and email is available
    useEffect(() => {
        if (isAuthenticated && (userEmail || email)) {
            loadChatRooms();
        }
    }, [isAuthenticated, userEmail, email]);

    const loadChatRooms = async () => {
        const emailToUse = userEmail || email;
        if (!emailToUse) {
            console.error('No email available to load chat rooms');
            return;
        }
        
        console.log('Loading chat rooms for email:', emailToUse);
        
        try {
            // Query chat rooms where the current user is a participant
            const chatRoomsRef = collection(db, "chatRooms");
            const q = query(
                chatRoomsRef,
                where("participants", "array-contains", emailToUse)
            );
            
            // Listen for chat room updates
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const rooms = [];
                querySnapshot.forEach((doc) => {
                    rooms.push({ id: doc.id, ...doc.data() });
                });
                console.log('Found chat rooms:', rooms.length);
                setChatRooms(rooms);
                
                // If there's an active chat, make sure it's still in the list
                if (activeChat && !rooms.find(room => room.roomId === activeChat.roomId)) {
                    setActiveChat(null);
                    setMessages([]);
                }
                
                // If we have an active chat from an event but it doesn't have all the data,
                // update it with the full data from the rooms list
                if (activeChat && activeChat.roomId) {
                    const fullRoomData = rooms.find(room => room.roomId === activeChat.roomId);
                    if (fullRoomData && fullRoomData.id !== activeChat.id) {
                        setActiveChat(fullRoomData);
                    }
                }
            }, (error) => {
                console.error('Error in chat rooms snapshot:', error);
            });
            
            return unsubscribe;
        } catch (error) {
            console.error('Error loading chat rooms:', error);
        }
    };

    // Load messages for the active chat
    useEffect(() => {
        if (!activeChat) {
            setMessages([]);
            return;
        }
        
        try {
            console.log('Loading messages for room:', activeChat.roomId);
            const messagesRef = collection(db, "messages");
            const q = query(
                messagesRef,
                where("roomId", "==", activeChat.roomId),
                orderBy("timestamp", "asc")
            );
            
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const messageList = [];
                querySnapshot.forEach((doc) => {
                    messageList.push({ id: doc.id, ...doc.data() });
                });
                console.log('Loaded messages:', messageList.length);
                setMessages(messageList);
            }, (error) => {
                console.error('Error in messages snapshot:', error);
            });
            
            return () => unsubscribe();
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }, [activeChat]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !isAuthenticated || !activeChat) return;

        const emailToUse = userEmail || email;
        if (!emailToUse) {
            console.error('No email available to send message');
            return;
        }

        try {
            await addDoc(collection(db, "messages"), {
                roomId: activeChat.roomId,
                text: newMessage,
                sender: emailToUse,
                timestamp: serverTimestamp(),
                senderName: account?.fullname || emailToUse,
                senderType: account?.role || 'user'
            });
            
                setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const selectChatRoom = (room) => {
        console.log('Selected chat room:', room);
        setActiveChat(room);
    };



    const getOtherParticipant = (room) => {
        if (!room || !room.participants) return { name: 'Unknown', email: 'unknown' };
        
        const emailToUse = userEmail || email;
        const otherParticipantId = room.participants.find(p => p !== emailToUse);
        return { 
            name: otherParticipantId || 'Unknown',
            email: otherParticipantId || 'unknown'
        };
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return null;
    }

    return (
        <div className={`fixed ${isMinimized ? 'bottom-4 right-4' : 'bottom-0 right-0 md:bottom-4 md:right-4'} z-[100] transition-all duration-300`}>
            {/* Chat Toggle Button */}
            {!isOpen && (
            <button
                onClick={() => setIsOpen(!isOpen)}
                    className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                    {chatRooms.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                            {chatRooms.length}
                        </span>
                    )}
            </button>
            )}

            {/* Chat Box */}
            {isOpen && (
                <div className={`${isMinimized ? 'h-16 overflow-hidden' : 'h-[500px]'} w-full md:w-96 bg-white rounded-t-lg md:rounded-lg shadow-2xl border border-gray-200 flex flex-col transition-all duration-300`}>
                    {/* Chat Header */}
                    <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-t-lg flex justify-between items-center cursor-pointer"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        <div className="flex items-center space-x-2">
                            {activeChat && (
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium">
                                        {getOtherParticipant(activeChat).name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <h3 className="font-semibold">
                                {activeChat 
                                    ? `Chat with ${getOtherParticipant(activeChat).name}` 
                                    : 'Messages'}
                            </h3>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMinimized(!isMinimized);
                                }}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                {isMinimized ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    setIsMinimized(false);
                                }}
                                className="text-white hover:text-gray-200 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                        {!isAuthenticated ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50">
                                    <div className="bg-indigo-100 p-4 rounded-full mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Please login to chat</h3>
                                    <p className="text-gray-500 mb-6">Sign in to start messaging with others</p>
                                <Link 
                                    href="/candidate/login" 
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-md transition-all duration-300"
                                >
                                        Login Now
                                </Link>
                                </div>
                            ) : !activeChat ? (
                                // Chat Room List
                                <div className="flex-1 overflow-y-auto bg-gray-50">
                                    {chatRooms.length === 0 ? (
                                        <div className="text-center py-10 px-4">
                                            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-800 mb-1">No conversations yet</h3>
                                            <p className="text-gray-500 text-sm">Start a new conversation with someone</p>
                                            <p className="text-xs text-gray-400 mt-4">Logged in as: {userEmail || email || 'Not available'}</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200">
                                            {chatRooms.map((room) => {
                                                const otherParticipant = getOtherParticipant(room);
                                                return (
                                                    <div 
                                                        key={room.id}
                                                        onClick={() => selectChatRoom(room)}
                                                        className="p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200 flex items-center"
                                                    >
                                                        <div className="relative">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                                                {otherParticipant.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                                                        </div>
                                                        <div className="ml-3 flex-1 min-w-0">
                                                            <div className="flex justify-between items-baseline">
                                                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                                    {otherParticipant.name}
                                                                </h4>
                                                                {room.lastMessageTime && (
                                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                                        {formatTime(room.lastMessageTime)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500 truncate">
                                                                {room.lastMessage || 'No messages yet'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Chat Messages
                                <>
                                    <div className="flex items-center p-3 border-b bg-gray-50">
                                        <button 
                                            onClick={() => setActiveChat(null)}
                                            className="mr-2 text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                                {getOtherParticipant(activeChat).name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-2">
                                                <p className="font-medium text-sm text-gray-900">{getOtherParticipant(activeChat).name}</p>
                                                <p className="text-xs text-gray-500">{getOtherParticipant(activeChat).email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                                        {messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                </svg>
                                                <h4 className="text-lg font-medium text-gray-400">No messages yet</h4>
                                                <p className="text-sm">Start the conversation with {getOtherParticipant(activeChat).name}</p>
                            </div>
                        ) : (
                                            <div className="space-y-3">
                                                {messages.map((message) => (
                                <div
                                    key={message.id}
                                                        className={`flex ${message.sender === (userEmail || email) ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                                            className={`max-w-[80%] rounded-2xl p-3 relative ${
                                                                message.sender === (userEmail || email)
                                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                                                    : 'bg-gray-200 text-gray-800'
                                        }`}
                                    >
                                        <p className="text-sm">{message.text}</p>
                                                            <p className={`text-xs mt-1 text-right ${
                                                                message.sender === (userEmail || email) 
                                                                    ? 'text-white/70' 
                                                                    : 'text-gray-500'
                                                            }`}>
                                                                {formatTime(message.timestamp)}
                                                            </p>
                                                            {message.sender === (userEmail || email) && (
                                                                <div className="absolute -bottom-1 right-0 w-3 h-3 bg-indigo-500 transform rotate-45"></div>
                                                            )}
                                                            {message.sender !== (userEmail || email) && (
                                                                <div className="absolute -bottom-1 left-0 w-3 h-3 bg-gray-200 transform rotate-45"></div>
                                                            )}
                                    </div>
                                </div>
                                                ))}
                        <div ref={chatEndRef} />
                                            </div>
                                        )}
                    </div>

                    {/* Chat Input */}
                                    <form onSubmit={handleSendMessage} className="p-3 border-t bg-white">
                                        <div className="flex space-x-2 w-full text-black">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="submit"
                                                disabled={!newMessage.trim()}
                                                className={`p-2 rounded-full ${newMessage.trim() ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-md' : 'bg-gray-200 text-gray-400'} transition-all duration-300`}
                                >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                                </svg>
                                </button>
                            </div>
                        </form>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatBox; 