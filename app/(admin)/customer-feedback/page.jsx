"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiMail, FiPhone, FiChevronDown, FiChevronUp } from "react-icons/fi";
import toast from "react-hot-toast";
import { FaListAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { feedbackData } from "@/lib/server/feedbackData";

const FeedbackPage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const hasFetchedRef = useRef(false);
    useEffect(() => {
        const fetchMessages = async () => {
            if (hasFetchedRef.current) return;

            hasFetchedRef.current = true;
            setLoading(true);

            const data = await feedbackData();

            if (data.length === 0) {
                toast("No messages found", { icon: "ℹ️" });
            }

            setMessages(data);
            setLoading(false);
        };

        fetchMessages();
    }, []);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const truncateText = (text, maxLength = 80) => {
        if (!text) return "";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const getContactInfo = (msg) => {
        if (msg.Email) return { icon: <FiMail className="w-4 h-4" />, text: msg.Email };
        if (msg.Phone) return { icon: <FiPhone className="w-4 h-4" />, text: msg.Phone };
        return { icon: null, text: "No contact" };
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        return isToday
            ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : date.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    // Framer Motion variants for smooth expand/collapse
    const contentVariants = {
        hidden: {
            opacity: 0,
            height: 0,
            overflow: "hidden",
        },
        visible: {
            opacity: 1,
            height: "auto",
            transition: {
                height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.2, delay: 0.05 },
            },
        },
        exit: {
            opacity: 0,
            height: 0,
            transition: {
                height: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.18 },
            },
        },
    };

    return (
        <div className="px-4 py-4">
            {/* Header */}
            <div className="flex bg-linear-to-r from-teal-700 to-teal-800 items-center p-3 rounded-t-md">
                <div className="flex items-center justify-center text-gray-50 text-lg bg-linear-to-r from-teal-500 to-teal-600 w-12 h-12 rounded-md shadow-md">
                    <FaListAlt className="text-lg" />
                </div>
                <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-50">Customers Feedback</h4>
                    <p className="text-sm text-gray-100">Manage customer messages and queries</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    <p className="mt-4">Loading messages...</p>
                </div>
            ) : messages.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-lg">No feedback messages found</p>
                </div>
            ) : (
                <div className="bg-white rounded-b-md shadow-lg overflow-hidden">
                    {/* Scrollable Table/List */}
                    <div className="max-h-screen overflow-y-auto border border-gray-200">
                        {messages.map((msg) => {
                            const contact = getContactInfo(msg);
                            const isExpanded = expandedId === msg.Id;

                            return (
                                <div key={msg.Id} className="border-b border-gray-200 last:border-b-0">
                                    {/* Compact Row */}
                                    <div
                                        onClick={() => toggleExpand(msg.Id)}
                                        className={`px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${isExpanded ? "bg-teal-50" : ""
                                            }`}
                                    >
                                        {/* Left: Contact + Name */}
                                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                                            <div className="shrink-0 text-gray-600">
                                                {contact.icon || <div className="w-4 h-4" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{msg.Name}</p>
                                                <p className="text-xs text-gray-500 truncate">{contact.text}</p>
                                            </div>
                                        </div>

                                        {/* Middle: Subject + Preview */}
                                        <div className="flex-1 px-8 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {msg.Subject || "(No subject)"}
                                            </p>
                                            <p className="text-sm text-gray-600 truncate">
                                                {truncateText(msg.Message || "(No message)")}
                                            </p>
                                        </div>

                                        {/* Right: Date + Chevron */}
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm text-gray-500 whitespace-nowrap">
                                                {formatDate(msg.EntryDate)}
                                            </span>
                                            <div className="text-gray-400">
                                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Animated Expanded Detailed Card */}
                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                variants={contentVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="border-t border-gray-200 bg-gray-50"
                                            >
                                                <div className="">
                                                    <div className="bg-white shadow-lg overflow-hidden">
                                                        {/* Top content */}
                                                        <div className="p-5">
                                                            <h2 className="text-xl font-bold text-gray-900 mb-3">{msg.Name}</h2>

                                                            {msg.Subject && (
                                                                <p className="text-md font-semibold text-teal-700 mb-4">
                                                                    Subject: {msg.Subject}
                                                                </p>
                                                            )}

                                                            <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                                                                {msg.Message}
                                                            </p>
                                                        </div>

                                                        {/* Bottom contact bar */}
                                                        <div className="bg-linear-to-r from-red-800 to-red-900 text-gray-50 text-sm">
                                                            <div className="px-6 py-2 flex flex-col gap-2">
                                                                {msg.Email && (
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="flex items-center gap-3">
                                                                            <FiMail className="w-4 h-4" />
                                                                            <span className="font-medium">{msg.Email}</span>
                                                                        </div>
                                                                        <div className="text-right text-gray-200 text-xs">
                                                                            Received: {new Date(msg.EntryDate).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {msg.Phone && (
                                                                    <div className="flex items-center gap-3">
                                                                        <FiPhone className="w-4 h-4" />
                                                                        <span className="font-medium">{msg.Phone}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
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
};

export default FeedbackPage;