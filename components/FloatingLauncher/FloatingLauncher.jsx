'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/provider/AuthProvider';
import toast from 'react-hot-toast';
import { trackEvent } from '@/lib/trackEvent';

const BOT_NAME = 'Mehedi';
const LAST_SEEN_REPLY_KEY = 'mingle_chat_seen_reply_ids';
const isFlagTrue = (v) => v === true || v === 1 || v === '1';
const WHATSAPP_NUMBER = '8801302815322';
const WHATSAPP_MESSAGE = 'Hello! I found you on Mingle Fashion and would like to know more.';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const MESSENGER_URL = 'https://m.me/mingleinstyle';

/* ── tiny sub-components ─────────────────────────────────────── */

const TypingDots = () => (
    <div className="flex items-center gap-1 py-1">
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '160ms' }} />
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '320ms' }} />
    </div>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

/* ── main component ──────────────────────────────────────────── */

export default function FloatingLauncher() {
    const { loginData } = useAuth();
    const pathname = usePathname();

    // launcher state
    const [menuOpen, setMenuOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    // chat state
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hi! I'm ${BOT_NAME}, your Mingle Fashion assistant. How can I help you today?` }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [showInfoPrompt, setShowInfoPrompt] = useState(false);
    const [infoName, setInfoName] = useState('');
    const [infoPhone, setInfoPhone] = useState('');
    const [customerInfo, setCustomerInfo] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [hasPendingReview, setHasPendingReview] = useState(false);
    const [unseenReplyCount, setUnseenReplyCount] = useState(0);

    const inputRef = useRef(null);
    const nameInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const streamActiveRef = useRef(false);
    const infoCollectedRef = useRef(false);
    const historyLoadedRef = useRef(false);
    const seenAdminReplyIdsRef = useRef(new Set());
    const viewedAdminReplyIdsRef = useRef(new Set());
    const chatOpenRef = useRef(false);
    const chatInitiatedRef = useRef(false);

    const persistViewedIds = () => {
        try {
            localStorage.setItem(LAST_SEEN_REPLY_KEY, JSON.stringify(Array.from(viewedAdminReplyIdsRef.current)));
        } catch { }
    };

    useEffect(() => {
        chatOpenRef.current = chatOpen;
    }, [chatOpen]);

    /* ── auth / session restore ───────────────────────────────── */
    useEffect(() => {
        try {
            if (loginData?.Name) {
                const existingSid = localStorage.getItem('mingle_chat_session');
                const sid = existingSid || crypto.randomUUID();
                if (!existingSid) localStorage.setItem('mingle_chat_session', sid);
                setSessionId(sid);
                setCustomerInfo({ name: loginData.Name || '', phone: loginData.Phone || '', email: loginData.Email || '' });
                infoCollectedRef.current = true;
                setShowInfoPrompt(false);
            } else {
                const savedSession = localStorage.getItem('mingle_chat_session');
                if (savedSession) setSessionId(savedSession);
                const savedName = localStorage.getItem('mingle_chat_name');
                const savedPhone = localStorage.getItem('mingle_chat_phone');
                if (savedName && savedPhone) {
                    setCustomerInfo({ name: savedName, phone: savedPhone, email: '' });
                    infoCollectedRef.current = true;
                } else {
                    setCustomerInfo(null);
                    infoCollectedRef.current = false;
                    setShowInfoPrompt(false);
                }
            }
        } catch { }
    }, [loginData]);

    /* ── restore saved conversation history ──────────────────── */
    useEffect(() => {
        if (!sessionId || historyLoadedRef.current) return;
        historyLoadedRef.current = true;
        try {
            const savedIds = JSON.parse(localStorage.getItem(LAST_SEEN_REPLY_KEY) || '[]');
            viewedAdminReplyIdsRef.current = new Set(savedIds);
        } catch { }
        fetch(`/api/chat/history?sessionId=${sessionId}`)
            .then(r => r.json())
            .then(data => {
                const rows = Array.isArray(data?.messages) ? data.messages : [];
                if (rows.length === 0) return;
                const restored = [];
                let pending = false;
                let unseenCount = 0;
                rows.forEach(row => {
                    if (row.UserMessage) restored.push({ role: 'user', content: row.UserMessage });
                    if (row.BotResponse) restored.push({ role: 'assistant', content: row.BotResponse });
                    if (row.AdminReply) {
                        restored.push({ role: 'assistant', content: row.AdminReply, isAdmin: true });
                        if (row.Id != null) {
                            seenAdminReplyIdsRef.current.add(row.Id);
                            if (!viewedAdminReplyIdsRef.current.has(row.Id)) unseenCount++;
                        }
                    }
                    if (isFlagTrue(row.NeedsHumanReview) && !isFlagTrue(row.IsResolved)) pending = true;
                });
                if (restored.length) {
                    setMessages(prev => [prev[0], ...restored]);
                    infoCollectedRef.current = true;
                }
                setHasPendingReview(pending);
                setUnseenReplyCount(unseenCount);
            })
            .catch(() => {});
    }, [sessionId]);

    /* ── poll for admin replies while a question is flagged ──── */
    useEffect(() => {
        if (!hasPendingReview || !sessionId) return;
        const poll = () => {
            fetch(`/api/chat/history?sessionId=${sessionId}`)
                .then(r => r.json())
                .then(data => {
                    const rows = Array.isArray(data?.messages) ? data.messages : [];
                    let stillPending = false;
                    let newlyUnseen = 0;
                    const newBubbles = [];
                    rows.forEach(row => {
                        if (row.AdminReply && row.Id != null && !seenAdminReplyIdsRef.current.has(row.Id)) {
                            seenAdminReplyIdsRef.current.add(row.Id);
                            newBubbles.push({ role: 'assistant', content: row.AdminReply, isAdmin: true });

                            if (chatOpenRef.current) {
                                viewedAdminReplyIdsRef.current.add(row.Id);
                                persistViewedIds();
                            } else if (!viewedAdminReplyIdsRef.current.has(row.Id)) {
                                newlyUnseen++;
                                const preview = row.AdminReply.length > 60 ? `${row.AdminReply.slice(0, 60)}...` : row.AdminReply;
                                toast(`Support replied: ${preview}`, { icon: '💬' });
                            }
                        }
                        if (isFlagTrue(row.NeedsHumanReview) && !isFlagTrue(row.IsResolved)) stillPending = true;
                    });
                    if (newBubbles.length) setMessages(prev => [...prev, ...newBubbles]);
                    if (newlyUnseen > 0) setUnseenReplyCount(prev => prev + newlyUnseen);
                    setHasPendingReview(stillPending);
                })
                .catch(() => {});
        };
        const t = setInterval(poll, 18000);
        return () => clearInterval(t);
    }, [hasPendingReview, sessionId]);

    /* ── scroll / focus ──────────────────────────────────────── */
    useEffect(() => {
        if (!chatOpen) return;
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, chatOpen, showInfoPrompt]);

    useEffect(() => {
        if (chatOpen && !showInfoPrompt) {
            const t = setTimeout(() => inputRef.current?.focus(), 80);
            return () => clearTimeout(t);
        }
    }, [chatOpen, showInfoPrompt]);

    useEffect(() => {
        if (showInfoPrompt) {
            const t = setTimeout(() => nameInputRef.current?.focus(), 80);
            return () => clearTimeout(t);
        }
    }, [showInfoPrompt]);

    useEffect(() => () => { streamActiveRef.current = false; }, []);

    /* ── chat logic ───────────────────────────────────────────── */
    const resetTextareaHeight = () => {
        if (inputRef.current) inputRef.current.style.height = 'auto';
    };

    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        let sid = sessionId;
        if (!sid) {
            sid = crypto.randomUUID();
            localStorage.setItem('mingle_chat_session', sid);
            setSessionId(sid);
        }

        const userMessage = { role: 'user', content: text };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        resetTextareaHeight();
        setIsLoading(true);
        streamActiveRef.current = true;
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        let fullText = '';
        let needsHumanReview = false;
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: updatedMessages.slice(1), pageContext: pathname }),
            });
            if (!res.ok || !res.body) throw new Error('Failed');
            needsHumanReview = res.headers.get('X-Needs-Human-Review') === 'true';
            if (needsHumanReview) setHasPendingReview(true);
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            while (streamActiveRef.current) {
                const { done, value } = await reader.read();
                if (done) break;
                fullText += decoder.decode(value, { stream: true });
                setMessages(prev => {
                    const u = [...prev];
                    u[u.length - 1] = { role: 'assistant', content: fullText };
                    return u;
                });
            }
        } catch {
            fullText = "Sorry, I'm having trouble connecting. Please try again or contact info@minglefashionbd.com.";
            setMessages(prev => {
                const u = [...prev];
                u[u.length - 1] = { role: 'assistant', content: fullText };
                return u;
            });
        } finally {
            streamActiveRef.current = false;
            setIsLoading(false);
        }

        fetch('/api/chat/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: sid,
                name: customerInfo?.name || null,
                phone: customerInfo?.phone || null,
                email: customerInfo?.email || null,
                userMessage: text,
                botResponse: fullText,
                pageContext: pathname,
                needsHumanReview,
            }),
        }).catch(() => { });

        if (!infoCollectedRef.current) {
            infoCollectedRef.current = true;
            setShowInfoPrompt(true);
        }
    }, [input, isLoading, messages, customerInfo, pathname, sessionId]);

    const handleInfoSubmit = () => {
        const name = infoName.trim();
        const phone = infoPhone.trim();
        if (!name || !phone) return;
        const info = { name, phone, email: '' };
        localStorage.setItem('mingle_chat_name', name);
        localStorage.setItem('mingle_chat_phone', phone);
        setCustomerInfo(info);
        setShowInfoPrompt(false);
        const sid = localStorage.getItem('mingle_chat_session');
        if (sid) {
            fetch('/api/chat/update-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: sid, name, phone, email: '' }),
            }).catch(() => { });
        }
        trackEvent('generate_lead', { name, phone });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const handleInput = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 60) + 'px';
    };

    const openChat = () => {
        setChatOpen(true);
        setMenuOpen(false);
        seenAdminReplyIdsRef.current.forEach(id => viewedAdminReplyIdsRef.current.add(id));
        persistViewedIds();
        setUnseenReplyCount(0);
        if (!chatInitiatedRef.current) {
            chatInitiatedRef.current = true;
            trackEvent('chat_initiated', { chatPlatform: 'Website Chatbot' });
        }
    };

    /* ── render ───────────────────────────────────────────────── */
    return (
        <div className="fixed bottom-6 right-5 z-[9998] flex flex-col items-end gap-0">

            {/* ── Chat panel ─────────────────────────────────── */}
            {chatOpen && (
                <div
                    className="mb-4 flex flex-col bg-white rounded-2xl overflow-hidden"
                    style={{
                        width: 'min(calc(100vw - 2.5rem), 340px)',
                        height: 'min(440px, calc(100vh - 240px))',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
                    }}
                >
                    {/* Header */}
                    <div className="shrink-0 bg-[#0f0e2a] px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#43C6AC] to-[#191654] flex items-center justify-center text-white font-bold text-sm">M</div>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0f0e2a] rounded-full" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm leading-tight">{BOT_NAME}</p>
                                    <p className="text-emerald-400 text-[10px] font-medium">Online · Mingle Fashion</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setChatOpen(false)}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ background: '#f6f7fb' }}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 mb-0.5 ${msg.isAdmin ? 'bg-amber-500' : 'bg-gradient-to-br from-[#43C6AC] to-[#191654]'}`}>
                                        {msg.isAdmin ? '★' : 'M'}
                                    </div>
                                )}
                                <div className={`max-w-[78%] px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${msg.role === 'user'
                                    ? 'bg-[#1e1b4b] text-white rounded-2xl rounded-br-sm'
                                    : msg.isAdmin
                                        ? 'bg-amber-50 border border-amber-200 text-gray-800 rounded-2xl rounded-bl-sm shadow-sm'
                                        : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm'
                                    }`}>
                                    {msg.isAdmin && <p className="text-[10px] font-semibold text-amber-700 mb-0.5">Mingle Support Team</p>}
                                    {msg.content}
                                    {msg.role === 'assistant' && isLoading && i === messages.length - 1 && msg.content === '' && <TypingDots />}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Info prompt */}
                    {showInfoPrompt ? (
                        <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-4">
                            <p className="text-[11px] text-gray-500 font-medium mb-3 leading-snug">
                                Just one step — share your name and number to continue.
                            </p>
                            <input ref={nameInputRef} type="text" placeholder="Your name" value={infoName}
                                onChange={e => setInfoName(e.target.value)}
                                className="w-full text-[13px] text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all mb-2 placeholder:text-gray-400"
                            />
                            <input type="tel" placeholder="Phone number" value={infoPhone}
                                onChange={e => setInfoPhone(e.target.value.replace(/\D/g, ''))}
                                onKeyDown={e => e.key === 'Enter' && handleInfoSubmit()}
                                className="w-full text-[13px] text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all mb-3 placeholder:text-gray-400"
                            />
                            <button onClick={handleInfoSubmit} disabled={!infoName.trim() || !infoPhone.trim()}
                                className="w-full py-2 rounded-xl bg-[#0f0e2a] hover:bg-[#1e1b4b] text-white text-[13px] font-semibold transition-colors disabled:opacity-40">
                                Continue chatting →
                            </button>
                        </div>
                    ) : (
                        <div className="shrink-0 bg-white border-t border-gray-100 px-3 py-3">
                            <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown} onInput={handleInput} placeholder="Ask me anything..."
                                    rows={1} disabled={isLoading}
                                    className="flex-1 resize-none text-[13px] text-gray-800 bg-transparent outline-none placeholder:text-gray-400 disabled:opacity-60 leading-relaxed"
                                    style={{ maxHeight: '60px' }}
                                />
                                <button onClick={sendMessage} disabled={isLoading || !input.trim()}
                                    className="w-7 h-7 rounded-full bg-[#0f0e2a] hover:bg-[#1e1b4b] text-white flex items-center justify-center transition-colors disabled:opacity-30 shrink-0 mb-0.5"
                                    aria-label="Send">
                                    <SendIcon />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Speed dial items (visible when menuOpen) ───── */}
            <div
                className="flex flex-col items-end gap-3 mb-3"
                style={{ pointerEvents: menuOpen ? 'auto' : 'none' }}
            >
                {/* Messenger */}
                <div
                    className="flex items-center gap-3 transition-all duration-300"
                    style={{
                        opacity: menuOpen ? 1 : 0,
                        transform: menuOpen ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.85)',
                        pointerEvents: menuOpen ? 'auto' : 'none',
                        transitionDelay: menuOpen ? '90ms' : '0ms',
                    }}
                >
                    <span className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md whitespace-nowrap">
                        Messenger
                    </span>
                    <a
                        href={MESSENGER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('click_to_messenger', { chatPlatform: 'Messenger' })}
                        aria-label="Chat on Messenger"
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #00B2FF, #006AFF, #A033FF, #FF5280)' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                            <path d="M12 2C6.477 2 2 6.145 2 11.25c0 2.905 1.446 5.496 3.71 7.19V22l3.386-1.86c.905.25 1.865.386 2.86.386 5.523 0 10-4.145 10-9.25S17.523 2 12 2Zm.98 12.457-2.55-2.72-4.977 2.72 5.475-5.815 2.613 2.72 4.914-2.72-5.475 5.815Z" />
                        </svg>
                    </a>
                </div>

                {/* WhatsApp */}
                <div
                    className="flex items-center gap-3 transition-all duration-300"
                    style={{
                        opacity: menuOpen ? 1 : 0,
                        transform: menuOpen ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.85)',
                        pointerEvents: menuOpen ? 'auto' : 'none',
                        transitionDelay: menuOpen ? '60ms' : '0ms',
                    }}
                >
                    <span className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md whitespace-nowrap">
                        WhatsApp
                    </span>
                    <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('click_to_whatsapp', { chatPlatform: 'WhatsApp' })}
                        aria-label="Chat on WhatsApp"
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                        style={{ background: '#25D366' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-6 h-6 fill-white">
                            <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.364.634 4.676 1.838 6.698L2.667 29.333l6.82-1.79A13.29 13.29 0 0016.003 29.333C23.369 29.333 29.333 23.363 29.333 16S23.369 2.667 16.003 2.667zm0 24.267a11.01 11.01 0 01-5.618-1.537l-.403-.24-4.048 1.062 1.08-3.94-.263-.416A10.977 10.977 0 015.003 16c0-6.065 4.935-11 11-11s11 4.935 11 11-4.935 11-11 11zm6.04-8.224c-.332-.166-1.963-.968-2.267-1.08-.304-.11-.525-.166-.747.166-.22.33-.858 1.08-1.051 1.3-.194.22-.387.247-.72.082-.33-.166-1.397-.515-2.661-1.641-.984-.877-1.648-1.96-1.842-2.292-.193-.332-.021-.511.145-.677.15-.149.332-.387.498-.58.166-.193.22-.33.33-.55.11-.22.055-.413-.028-.58-.082-.165-.747-1.8-1.023-2.466-.27-.648-.544-.56-.747-.57l-.636-.011c-.22 0-.58.082-.883.413-.304.33-1.16 1.134-1.16 2.766s1.188 3.208 1.354 3.43c.165.22 2.34 3.573 5.671 5.01.793.342 1.412.546 1.893.7.795.252 1.52.216 2.093.131.638-.095 1.963-.803 2.24-1.578.275-.776.275-1.44.192-1.578-.082-.138-.303-.22-.636-.387z" />
                        </svg>
                    </a>
                </div>

                {/* AI Chat */}
                <div
                    className="flex items-center gap-3 transition-all duration-300"
                    style={{
                        opacity: menuOpen ? 1 : 0,
                        transform: menuOpen ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.85)',
                        pointerEvents: menuOpen ? 'auto' : 'none',
                        transitionDelay: menuOpen ? '0ms' : '30ms',
                    }}
                >
                    <span className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md whitespace-nowrap">
                        Chat with AI
                    </span>
                    <button
                        onClick={openChat}
                        aria-label="Open AI chat"
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #0f0e2a, #2d2b6b)' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                            <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Main launcher button ───────────────────────── */}
            <button
                onClick={() => { setMenuOpen(prev => !prev); if (chatOpen) setChatOpen(false); }}
                aria-label={menuOpen ? 'Close menu' : 'Open contact options'}
                className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #0f0e2a 0%, #1e3a5f 60%, #43C6AC 100%)' }}
            >
                <span
                    className="transition-transform duration-300"
                    style={{ transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)', display: 'flex' }}
                >
                    {menuOpen ? (
                        /* X icon */
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        /* Message / chat bubble icon */
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                            <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                        </svg>
                    )}
                </span>

                {/* Pulse ring when closed */}
                {!menuOpen && (
                    <span className="absolute w-14 h-14 rounded-full animate-ping opacity-20 pointer-events-none"
                        style={{ background: '#43C6AC' }} />
                )}

                {/* Unseen admin reply badge */}
                {unseenReplyCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                        {unseenReplyCount > 9 ? '9+' : unseenReplyCount}
                    </span>
                )}
            </button>
        </div>
    );
}
