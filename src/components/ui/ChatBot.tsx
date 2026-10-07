'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Bot, MessageSquare, ChevronDown, ChevronUp, ShieldCheck, Terminal, Cpu } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
  intent?: string;
}

interface ChatBotProps {
  apiUrl?: string;
  sessionId?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

export function ChatBot({
  apiUrl = '/api/chat',
  sessionId = 'session_' + (typeof navigator !== 'undefined' ? Math.random().toString(36).slice(2, 10) : Date.now()),
  onSuggestionClick,
}: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'bot',
          content: 'Welcome to CyberLog. I can help with security architecture, blog posts, projects, and system status. Type "help" for commands.',
          timestamp: new Date().toISOString(),
          intent: 'help',
        },
      ]);
    }
  }, []);

  const sendMessage = async (content?: string) => {
    const text = (content ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok) throw new Error(`Chat error: ${res.status}`);

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'bot',
        content: data.response,
        timestamp: new Date().toISOString(),
        intent: data.intent,
      };
      setMessages((prev) => [...prev, botMsg]);
      if (data.suggestions && onSuggestionClick) {
        (window as any)._chatSuggestions = data.suggestions;
      }
    } catch (err) {
      const errMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'bot',
        content: 'Connection error. Check your network and try again.',
        timestamp: new Date().toISOString(),
        intent: 'error',
      };
      setMessages((prev) => [...prev, errMsg]);
      setError('Failed to get a response.');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = React.useMemo(() => {
    const all: string[] = [];
    for (const msg of messages) {
      if (msg.role !== 'bot') continue;
      const lines = msg.content.split(/[.;]/);
      for (const line of lines) {
        const t = line.trim();
        if (t.length > 10 && t.length < 120 && /[?]$/.test(t)) all.push(t);
      }
    }
    return [...new Set(all)].slice(0, 3);
  }, [messages]);
