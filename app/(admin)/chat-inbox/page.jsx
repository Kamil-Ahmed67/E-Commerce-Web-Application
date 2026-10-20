"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiPhone, FiChevronDown, FiChevronUp, FiSend } from "react-icons/fi";
import { IoChatbubblesOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import config from "@/config";

const PENDING_POLL_MS = 25000;
const THREAD_POLL_MS = 20000;

const contentVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: {
        opacity: 1, height: "auto",
        transition: { height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.2, delay: 0.05 } },
    },
    exit: {
        opacity: 0, height: 0,
        transition: { height: { duration: 0.22, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.18 } },
    },
};

async function fetchPendingRows() {
    const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: "POST",
        headers: { "Content-Type": "application/json", TenantId: config.tenantId },
        body: JSON.stringify({
            operation: "",
            procedureName: "SP_EcomChatConversation",
            parameters: { QueryChecker: 6 },
        }),
        cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

// QC=6 now returns one row per still-unanswered flagged question, not one per customer.
// Group them here so the outer list still shows one card per customer.
function groupBySession(rows) {
    const bySession = new Map();
    rows.forEach(r => {
        if (!bySession.has(r.SessionId)) {
            bySession.set(r.SessionId, {
                SessionId: r.SessionId,
                CustomerName: r.CustomerName,
                Phone: r.Phone,
                pendingCount: 0,
                latestMessage: r.UserMessage,
                latestDate: r.EntryDate,
            });
        }
        const entry = bySession.get(r.SessionId);
        entry.pendingCount += 1;
        if (new Date(r.EntryDate) > new Date(entry.latestDate)) {
            entry.latestMessage = r.UserMessage;
            entry.latestDate = r.EntryDate;
        }
    });
    return Array.from(bySession.values()).sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate));
}

async function fetchThread(sessionId) {
    const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: "POST",
        headers: { "Content-Type": "application/json", TenantId: config.tenantId },
        body: JSON.stringify({
            operation: "",
            procedureName: "SP_EcomChatConversation",
            parameters: { QueryChecker: 7, SessionId: sessionId },
        }),
        cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

const isFlagTrue = (v) => v === true || v === 1 || v === "1";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function ChatInboxPage() {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [threads, setThreads] = useState({});
    const [replies, setReplies] = useState({});
    const [sending, setSending] = useState({});
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        fetchPendingRows()
            .then(rows => {
                const grouped = groupBySession(rows);
                if (grouped.length === 0) toast("No pending chats", { icon: "ℹ️" });
                setChats(grouped);
            })
            .finally(() => setLoading(false));
    }, []);

    // Keep the pending list fresh without a manual reload.
    useEffect(() => {
        const t = setInterval(() => {
            fetchPendingRows().then(rows => setChats(groupBySession(rows)));
        }, PENDING_POLL_MS);
        return () => clearInterval(t);
    }, []);

    // Keep the currently-open thread fresh so new customer messages / follow-up questions show up.
    useEffect(() => {
        if (!expandedId) return;
        const t = setInterval(() => {
            fetchThread(expandedId).then(thread => setThreads(prev => ({ ...prev, [expandedId]: thread })));
        }, THREAD_POLL_MS);
        return () => clearInterval(t);
    }, [expandedId]);

    const toggleExpand = async (sessionId) => {
        if (expandedId === sessionId) {
            setExpandedId(null);
            return;
        }
        setExpandedId(sessionId);
        const thread = await fetchThread(sessionId);
        setThreads(prev => ({ ...prev, [sessionId]: thread }));
    };

    const sendReply = async (row, sessionId) => {
        const reply = (replies[row.Id] || "").trim();
        if (!reply) return;
        setSending(prev => ({ ...prev, [row.Id]: true }));
        try {
            const res = await fetch("/api/chat/admin-reply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: row.Id, adminReply: reply }),
            });
            if (!res.ok) throw new Error();
            toast.success("Reply sent!");

            setThreads(prev => ({
                ...prev,
                [sessionId]: (prev[sessionId] || []).map(r =>
                    r.Id === row.Id ? { ...r, AdminReply: reply, IsResolved: 1 } : r
                ),
            }));
            setReplies(prev => {
                const next = { ...prev };
                delete next[row.Id];
                return next;
            });

            const rows = await fetchPendingRows();
            setChats(groupBySession(rows));
        } catch {
            toast.error("Failed to send reply. Please try again.");
        } finally {
            setSending(prev => ({ ...prev, [row.Id]: false }));
        }
    };

    const resolvedCount = chats.reduce((sum, c) => sum + c.pendingCount, 0);

    return (
        <div className="px-4 py-4">
            {/* Header */}
            <div className="flex bg-linear-to-r from-teal-700 to-teal-800 items-center p-3 rounded-t-md">
                <div className="flex items-center justify-center text-gray-50 text-lg bg-linear-to-r from-teal-500 to-teal-600 w-12 h-12 rounded-md shadow-md">
                    <IoChatbubblesOutline className="text-xl" />
                </div>
                <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-50">Chat Inbox</h4>
                    <p className="text-sm text-gray-100">Unanswered customer questions — reply between 10AM–10PM</p>
                </div>
                {!loading && (
                    <span className="ml-auto bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {resolvedCount} pending
                    </span>
                )}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                    <p className="mt-4">Loading chats...</p>
                </div>
            ) : chats.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-white rounded-b-md shadow-lg">
                    <IoChatbubblesOutline className="mx-auto text-5xl text-gray-300 mb-4" />
                    <p className="text-lg font-medium">All caught up!</p>
                    <p className="text-sm mt-1">No unanswered questions right now.</p>
                </div>
            ) : (
                <div className="bg-white rounded-b-md shadow-lg overflow-hidden">
                    <div className="max-h-screen overflow-y-auto border border-gray-200">
                        {chats.map((chat) => {
                            const isExpanded = expandedId === chat.SessionId;
                            const thread = threads[chat.SessionId] || [];

                            return (
                                <div key={chat.SessionId} className="border-b border-gray-200 last:border-b-0">
                                    {/* Row */}
                                    <div
                                        onClick={() => toggleExpand(chat.SessionId)}
                                        className={`px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${isExpanded ? "bg-teal-50" : ""}`}
                                    >
                                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {(chat.CustomerName || "?")[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{chat.CustomerName || "Unknown"}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <FiPhone className="w-3 h-3" />
                                                    <span>{chat.Phone || "No phone"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 px-6 min-w-0">
                                            <p className="text-sm text-gray-700 truncate">{chat.latestMessage || "(No message)"}</p>
                                        </div>
                                        <div className="flex items-center space-x-3 shrink-0">
                                            {chat.pendingCount > 1 && (
                                                <span className="bg-red-50 text-red-600 border border-red-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                                    {chat.pendingCount} questions
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(chat.latestDate)}</span>
                                            <div className="text-gray-400">{isExpanded ? <FiChevronUp /> : <FiChevronDown />}</div>
                                        </div>
                                    </div>

                                    {/* Expanded thread */}
                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                variants={contentVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="border-t border-gray-200 bg-gray-50"
                                            >
                                                <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                                                    {thread.length === 0 ? (
                                                        <p className="text-xs text-gray-400 text-center py-4">Loading conversation...</p>
                                                    ) : thread.map((msg) => {
                                                        const needsReply = isFlagTrue(msg.NeedsHumanReview) && !isFlagTrue(msg.IsResolved);
                                                        const isSending = sending[msg.Id];
                                                        return (
                                                            <React.Fragment key={msg.Id}>
                                                                {msg.UserMessage && (
                                                                    <div className="flex justify-end">
                                                                        <div className="max-w-[75%] bg-[#1e1b4b] text-white text-xs px-3 py-2 rounded-2xl rounded-br-sm">
                                                                            {msg.UserMessage}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {msg.BotResponse && (
                                                                    <div className="flex justify-start">
                                                                        <div className="max-w-[75%] bg-white text-gray-800 text-xs px-3 py-2 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100">
                                                                            {msg.BotResponse}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {msg.AdminReply && (
                                                                    <div className="flex justify-start">
                                                                        <div className="max-w-[75%] bg-amber-50 border border-amber-200 text-gray-800 text-xs px-3 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                                                                            <p className="text-[10px] font-semibold text-amber-700 mb-0.5">Your reply</p>
                                                                            {msg.AdminReply}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {needsReply && (
                                                                    <div className="ml-2 my-1 p-2.5 bg-red-50 border border-red-200 rounded-xl">
                                                                        <p className="text-[11px] font-semibold text-red-600 mb-1.5">This question needs your reply:</p>
                                                                        <div className="flex gap-2">
                                                                            <textarea
                                                                                value={replies[msg.Id] || ""}
                                                                                onChange={e => setReplies(prev => ({ ...prev, [msg.Id]: e.target.value }))}
                                                                                placeholder="Type your reply here..."
                                                                                rows={2}
                                                                                className="flex-1 resize-none text-xs text-gray-800 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-gray-400"
                                                                            />
                                                                            <button
                                                                                onClick={() => sendReply(msg, chat.SessionId)}
                                                                                disabled={isSending || !(replies[msg.Id] || "").trim()}
                                                                                className="shrink-0 self-end w-9 h-9 rounded-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center transition-colors disabled:opacity-40"
                                                                            >
                                                                                {isSending ? (
                                                                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                                                ) : (
                                                                                    <FiSend className="w-4 h-4" />
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
