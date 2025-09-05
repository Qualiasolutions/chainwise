"use client";

import { useEffect, useRef, useCallback, useTransition, useMemo } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    MessageSquare,
    TrendingUp,
    Brain,
    DollarSign,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
    Bot,
    User,
    CreditCard,
    AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import { AIService, type AIResponse } from '@/lib/ai-service'
import { type AIPersona } from '@/lib/openai-service'
import { generateId } from '@/lib/utils'
import { useSubscription } from '@/hooks/use-subscription'
import { ChatMessage } from '@/types'

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
    persona: AIPersona;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-crypto-primary/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export function AnimatedAIChat() {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [selectedPersona, setSelectedPersona] = useState<AIPersona>('buddy');
    const [sessionId, setSessionId] = useState<string | undefined>();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 160, // Reduced for mobile
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { creditBalance, canUseFeature, refetchBalance } = useSubscription();

    // Initialize credits when component mounts
    useEffect(() => {
        const initializeCredits = async () => {
            try {
                const response = await fetch('/api/credits/initialize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.refreshed) {
                        refetchBalance(); // Refresh balance if credits were added
                    }
                }
            } catch (error) {
                console.error('Failed to initialize credits:', error);
            }
        };

        initializeCredits();
    }, [refetchBalance]);

    // Memoize command suggestions for better performance
    const commandSuggestions: CommandSuggestion[] = useMemo(() => [
        { 
            icon: <MessageSquare className="w-4 h-4" />, 
            label: "Crypto Buddy", 
            description: "Beginner-friendly crypto guidance", 
            prefix: "/buddy",
            persona: 'buddy'
        },
        { 
            icon: <Brain className="w-4 h-4" />, 
            label: "Crypto Professor", 
            description: "Deep technical analysis", 
            prefix: "/professor",
            persona: 'professor'
        },
        { 
            icon: <TrendingUp className="w-4 h-4" />, 
            label: "Crypto Trader", 
            description: "Market insights and trading tips", 
            prefix: "/trader",
            persona: 'trader'
        },
        { 
            icon: <DollarSign className="w-4 h-4" />, 
            label: "Portfolio Analysis", 
            description: "Analyze your crypto portfolio", 
            prefix: "/portfolio",
            persona: 'buddy'
        },
    ], []);

    // Memoized scroll function
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Initialize with welcome message
    useEffect(() => {
        const welcomeMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: `Welcome to ChainWise AI! 🚀 I'm your intelligent crypto companion. Choose a persona or ask me anything about cryptocurrency, blockchain, or trading. How can I help you today?`,
            timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
    }, []);

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
            
            const matchingSuggestionIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );
            
            if (matchingSuggestionIndex >= 0) {
                setActiveSuggestion(matchingSuggestionIndex);
            } else {
                setActiveSuggestion(-1);
            }
        } else {
            setShowCommandPalette(false);
        }
    }, [value, commandSuggestions]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector('[data-command-button]');
            
            if (commandPaletteRef.current && 
                !commandPaletteRef.current.contains(target) && 
                !commandButton?.contains(target)) {
                setShowCommandPalette(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    setSelectedPersona(selectedCommand.persona);
                    setValue(selectedCommand.prefix + ' ');
                    setShowCommandPalette(false);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    const handleSendMessage = async () => {
        if (!value.trim() || isTyping) return;

        // Check credits
        const personaCosts = { buddy: 1, professor: 2, trader: 2 };
        const cost = personaCosts[selectedPersona];
        
        if (!canUseFeature(`chat_${selectedPersona}`, cost)) {
            const errorMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: `⚠️ You need ${cost} credits to use this persona. Please upgrade your subscription to continue chatting.`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
            return;
        }

        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: value.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setValue('');
        adjustHeight(true);
        setIsTyping(true);

        try {
            const response = await AIService.generateResponse(
                [...messages, userMessage],
                selectedPersona,
                sessionId
            );
            
            if (response.error && response.error.includes('Insufficient credits')) {
                const errorMessage: ChatMessage = {
                    id: generateId(),
                    role: 'assistant',
                    content: `⚠️ ${response.error}`,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
                setMessages(prev => prev.slice(0, -2)); // Remove user message
                return;
            }

            // Update session ID if new
            if (response.sessionId && !sessionId) {
                setSessionId(response.sessionId);
            }

            // Refresh credit balance
            if (response.newBalance !== undefined) {
                refetchBalance();
            }
            
            const assistantMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: response.message,
                timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            
        } catch (error) {
            console.error('Error generating response:', error);
            const errorMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: 'I apologize, but I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };
    
    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        setSelectedPersona(selectedCommand.persona);
        setValue(selectedCommand.prefix + ' ');
        setShowCommandPalette(false);
    };

    // Memoize persona info for better performance
    const currentPersonaInfo = useMemo(() => AIService.getPersonaInfo(selectedPersona), [selectedPersona]);

    return (
        <div className="min-h-screen flex flex-col w-full items-center justify-start text-white p-2 sm:p-4 lg:p-6 relative overflow-hidden">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full mix-blend-normal filter blur-[180px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/15 rounded-full mix-blend-normal filter blur-[150px] animate-pulse delay-700" />
                <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-violet-500/10 rounded-full mix-blend-normal filter blur-[120px] animate-pulse delay-1000" />
                <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-pink-500/8 rounded-full mix-blend-normal filter blur-[100px] animate-pulse delay-500" />
            </div>

            {/* Enhanced Credit Balance Display */}
            <motion.div 
                className="absolute top-4 right-2 sm:top-6 sm:right-6 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-xl sm:rounded-2xl border border-purple-400/20 p-2 sm:p-4 shadow-2xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                    </div>
                    <div className="text-xs sm:text-sm">
                        <div className="text-white font-semibold text-base sm:text-lg">{creditBalance?.balance || 0}</div>
                        <div className="text-purple-200/70 text-xs hidden sm:block">Credits Available</div>
                    </div>
                </div>
            </motion.div>

            <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto relative">
                <motion.div 
                    className="relative z-10 space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Enhanced Header */}
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-block"
                        >
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 pb-2">
                                ChainWise AI
                            </h1>
                            <motion.div 
                                className="h-1 bg-gradient-to-r from-transparent via-purple-400/60 to-transparent rounded-full"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "100%", opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />
                        </motion.div>
                        <motion.div
                            className="flex items-center justify-center space-x-2 sm:space-x-3 bg-white/5 backdrop-blur-xl rounded-full px-3 py-2 sm:px-6 sm:py-3 border border-purple-300/20"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white/80 text-xs sm:text-sm font-medium">
                                Connected to <span className="text-purple-300 font-semibold">{currentPersonaInfo.name}</span>
                            </span>
                        </motion.div>
                    </div>

                    {/* Enhanced Messages Area */}
                    <motion.div 
                        className="relative backdrop-blur-3xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl sm:rounded-3xl border border-purple-300/20 shadow-2xl h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[650px] overflow-hidden"
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 scrollbar-hide">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[90%] sm:max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 sm:space-x-4`}>
                                        <motion.div 
                                            className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg ${
                                                message.role === 'user' 
                                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                                                    : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border border-purple-300/20'
                                            }`}
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            {message.role === 'user' ? (
                                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            ) : (
                                                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                                            )}
                                        </motion.div>
                                        <motion.div 
                                            className={`px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 rounded-xl sm:rounded-2xl shadow-xl ${
                                                message.role === 'user' 
                                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
                                                    : 'bg-white/10 backdrop-blur-xl text-white border border-purple-200/20'
                                            }`}
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed font-medium">{message.content}</p>
                                            <p className={`text-xs mt-2 sm:mt-3 ${message.role === 'user' ? 'text-purple-100' : 'text-purple-200/60'} font-medium`}>
                                                {message.timestamp.toLocaleTimeString()}
                                            </p>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </motion.div>

                    {/* Enhanced Chat Input */}
                    <motion.div 
                        className="relative backdrop-blur-3xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-purple-300/20 shadow-2xl"
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div 
                                    ref={commandPaletteRef}
                                    className="absolute left-2 right-2 sm:left-4 sm:right-4 bottom-full mb-3 backdrop-blur-3xl bg-gradient-to-br from-purple-900/80 to-indigo-900/80 rounded-xl sm:rounded-2xl z-50 shadow-2xl border border-purple-300/30 overflow-hidden"
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                                >
                                    <div className="py-2">
                                        {commandSuggestions.map((suggestion, index) => (
                                            <motion.div
                                                key={suggestion.prefix}
                                                className={cn(
                                                    "flex items-center gap-3 sm:gap-4 px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm transition-all cursor-pointer relative group",
                                                    activeSuggestion === index 
                                                        ? "bg-purple-500/30 text-white shadow-lg" 
                                                        : "text-white/80 hover:bg-purple-500/20 hover:text-white"
                                                )}
                                                onClick={() => selectCommandSuggestion(index)}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ x: 4 }}
                                            >
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-purple-300 bg-purple-500/20 rounded-lg sm:rounded-xl group-hover:bg-purple-500/30 transition-colors">
                                                    {suggestion.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold">{suggestion.label}</div>
                                                    <div className="text-purple-200/60 text-xs mt-1">{suggestion.description}</div>
                                                </div>
                                                <div className="text-purple-300/70 text-xs font-mono bg-purple-500/10 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg hidden sm:block">
                                                    {suggestion.prefix}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-3 sm:p-4 lg:p-6">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder="Ask ChainWise AI anything about crypto..."
                                containerClassName="w-full"
                                className={cn(
                                    "w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4",
                                    "resize-none",
                                    "bg-transparent",
                                    "border-none",
                                    "text-white text-sm sm:text-base lg:text-lg",
                                    "focus:outline-none focus:ring-0",
                                    "placeholder:text-purple-200/50 placeholder:text-sm sm:placeholder:text-base lg:placeholder:text-lg",
                                    "min-h-[60px] sm:min-h-[80px] lg:min-h-[100px]",
                                    "cursor-text"
                                )}
                                style={{
                                    overflow: "hidden",
                                }}
                                showRing={false}
                            />
                        </div>

                        <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4 border-t border-purple-300/20 flex items-center justify-between gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <motion.button
                                    type="button"
                                    data-command-button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCommandPalette(prev => !prev);
                                    }}
                                    whileTap={{ scale: 0.94 }}
                                    whileHover={{ scale: 1.05 }}
                                    className={cn(
                                        "p-2 sm:p-3 text-purple-300/60 hover:text-white rounded-lg sm:rounded-xl transition-all relative group bg-purple-500/10 hover:bg-purple-500/20",
                                        showCommandPalette && "bg-purple-500/30 text-white shadow-lg"
                                    )}
                                >
                                    <Command className="w-4 h-4 sm:w-5 sm:h-5" />
                                </motion.button>
                                <span className="text-purple-200/50 text-xs hidden sm:block">Commands</span>
                            </div>
                            
                            <motion.button
                                type="button"
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isTyping || !value.trim()}
                                className={cn(
                                    "px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all",
                                    "flex items-center gap-2 sm:gap-3",
                                    value.trim() && !isTyping
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40"
                                        : "bg-white/10 text-white/40 cursor-not-allowed"
                                )}
                            >
                                {isTyping ? (
                                    <LoaderIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                ) : (
                                    <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                                <span className="hidden sm:inline">Send Message</span>
                                <span className="sm:hidden">Send</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Enhanced Command Suggestions */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4">
                        {commandSuggestions.map((suggestion, index) => (
                            <motion.button
                                key={suggestion.prefix}
                                onClick={() => selectCommandSuggestion(index)}
                                className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 bg-white/5 hover:bg-purple-500/20 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-white/70 hover:text-white transition-all relative group border border-purple-300/10 hover:border-purple-400/40 shadow-lg backdrop-blur-xl"
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 300 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="text-purple-300 bg-purple-500/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl group-hover:bg-purple-500/30 transition-colors">
                                    {suggestion.icon}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">{suggestion.label}</span>
                                    <span className="text-xs text-purple-200/50 group-hover:text-purple-100/60 hidden sm:block">{suggestion.description}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Enhanced Typing Indicator */}
            <AnimatePresence>
                {isTyping && (
                    <motion.div 
                        className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 backdrop-blur-3xl bg-gradient-to-r from-purple-900/90 to-indigo-900/90 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-8 sm:py-4 shadow-2xl border border-purple-300/30"
                        initial={{ opacity: 0, y: 30, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        <div className="flex items-center gap-2 sm:gap-4">
                            <motion.div 
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </motion.div>
                            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white">
                                <span className="font-medium">{currentPersonaInfo.name} is thinking</span>
                                <TypingDots />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Enhanced Mouse Follow Effect */}
            {inputFocused && (
                <motion.div 
                    className="fixed w-[60rem] h-[60rem] rounded-full pointer-events-none z-0 opacity-[0.03] bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 blur-[120px]"
                    animate={{
                        x: mousePosition.x - 480,
                        y: mousePosition.y - 480,
                    }}
                    transition={{
                        type: "spring",
                        damping: 30,
                        stiffness: 120,
                        mass: 0.8,
                    }}
                />
            )}
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-2 h-2 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mx-0.5 shadow-lg"
                    initial={{ opacity: 0.4, scale: 0.8 }}
                    animate={{ 
                        opacity: [0.4, 1, 0.4],
                        scale: [0.8, 1.3, 0.8],
                        y: [0, -4, 0]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: dot * 0.2,
                        ease: "easeInOut",
                    }}
                    style={{
                        boxShadow: "0 0 8px rgba(168, 85, 247, 0.5)"
                    }}
                />
            ))}
        </div>
    );
}
