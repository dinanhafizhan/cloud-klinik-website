import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'model',
            text: 'Halo! Saya asisten medis AI dari Klinik Pemweb. Ada yang bisa saya bantu terkait layanan klinik atau masalah kesehatan?'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');

        const newMessages = [...messages, { role: 'user', text: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            let validMessages = [...messages];
            if (validMessages.length > 0 && validMessages[0].role === 'model') {
                validMessages = validMessages.slice(1);
            }

            const history = validMessages.map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/chat`, {
                message: userMessage,
                history: history
            });

            setMessages([...newMessages, { role: 'model', text: response.data.reply }]);
        } catch (error) {
            console.error('Error saat menghubungi chatbot:', error);
            const errorMessage = error.response?.data?.error || "Maaf, terjadi kesalahan koneksi. Silakan coba lagi.";
            setMessages([...newMessages, { role: 'model', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-wrapper">
            <button className="chatbot-toggle-btn" onClick={toggleChat} aria-label="Toggle chat">
                {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <Bot size={20} />
                            <div>
                                <h4>Asisten Klinik AI</h4>
                                <p>Online • Klinik Pemweb</p>
                            </div>
                        </div>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.role}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-bubble model loading">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ketik pertanyaan medis..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !inputMessage.trim()}>
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;