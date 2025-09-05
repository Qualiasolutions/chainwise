"use client";

import { useEffect, useRef, useCallback, useTransition } from "react";
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
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { creditBalance, canUseFeature, refetchBalance } = useSubscription();

    const commandSuggestions: CommandSuggestion[] = [
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
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
    }, [value]);

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

    const currentPersonaInfo = AIService.getPersonaInfo(selectedPersona);

    return (
        <div className="min-h-screen flex flex-col w-full items-center justify-center bg-slate-900 text-white p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-crypto-primary/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-crypto-secondary/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-crypto-accent/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
            </div>

            {/* Credit Balance Display */}
            <motion.div 
                className="absolute top-6 right-6 backdrop-blur-xl bg-white/[0.02] rounded-lg border border-white/[0.05] p-3 shadow-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-crypto-primary" />
                    <div className="text-sm">
                        <span className="text-white font-medium">{creditBalance?.balance || 0}</span>
                        <span className="text-white/60 ml-1">Credits</span>
                    </div>
                </div>
            </motion.div>

            <div className="w-full max-w-4xl mx-auto relative">
                <motion.div 
                    className="relative z-10 space-y-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-block"
                        >
                            <h1 className="text-4xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-crypto-primary to-crypto-secondary pb-1">
                                ChainWise AI Assistant
                            </h1>
                            <motion.div 
                                className="h-px bg-gradient-to-r from-transparent via-crypto-primary/50 to-transparent"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "100%", opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />
                        </motion.div>
                        <motion.p 
                            className="text-sm text-white/60"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Currently chatting with <span className="text-crypto-primary font-medium">{currentPersonaInfo.name}</span>
                        </motion.p>
                    </div>

                    {/* Messages Area */}
                    <motion.div 
                        className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl max-h-96 overflow-y-auto"
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="p-6 space-y-4">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                                        <div className={`p-2 rounded-lg ${message.role === 'user' ? 'bg-crypto-primary' : 'bg-crypto-secondary/20'}`}>
                                            {message.role === 'user' ? (
                                                <User className="w-4 h-4 text-white" />
                                            ) : (
                                                <Bot className="w-4 h-4 text-crypto-primary" />
                                            )}
                                        </div>
                                        <div className={`px-4 py-3 rounded-lg ${message.role === 'user' ? 'bg-crypto-primary text-white' : 'bg-white/[0.05] text-white'}`}>
                                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                                            <p className="text-xs mt-2 opacity-60">
                                                {message.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </motion.div>

                    {/* Chat Input */}
                    <motion.div 
                        className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div 
                                    ref={commandPaletteRef}
                                    className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-slate-800/95 rounded-lg z-50 shadow-lg border border-white/10 overflow-hidden"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="py-1">
                                        {commandSuggestions.map((suggestion, index) => (
                                            <motion.div
                                                key={suggestion.prefix}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer",
                                                    activeSuggestion === index 
                                                        ? "bg-crypto-primary/20 text-white" 
                                                        : "text-white/70 hover:bg-white/5"
                                                )}
                                                onClick={() => selectCommandSuggestion(index)}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                            >
                                                <div className="w-6 h-6 flex items-center justify-center text-crypto-primary">
                                                    {suggestion.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{suggestion.label}</div>
                                                    <div className="text-white/50 text-xs">{suggestion.description}</div>
                                                </div>
                                                <div className="text-white/40 text-xs font-mono">
                                                    {suggestion.prefix}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4">
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
                                    "w-full px-4 py-3",
                                    "resize-none",
                                    "bg-transparent",
                                    "border-none",
                                    "text-white/90 text-sm",
                                    "focus:outline-none",
                                    "placeholder:text-white/30",
                                    "min-h-[60px]"
                                )}
                                style={{
                                    overflow: "hidden",
                                }}
                                showRing={false}
                            />
                        </div>

                        <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <motion.button
                                    type="button"
                                    data-command-button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCommandPalette(prev => !prev);
                                    }}
                                    whileTap={{ scale: 0.94 }}
                                    className={cn(
                                        "p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group",
                                        showCommandPalette && "bg-white/10 text-white/90"
                                    )}
                                >
                                    <Command className="w-4 h-4" />
                                    <motion.span
                                        className="absolute inset-0 bg-white/[0.05] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        layoutId="button-highlight"
                                    />
                                </motion.button>
                            </div>
                            
                            <motion.button
                                type="button"
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isTyping || !value.trim()}
                                className={cn(
                                    "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                                    "flex items-center gap-2",
                                    value.trim() && !isTyping
                                        ? "bg-gradient-to-r from-crypto-primary to-crypto-secondary text-white shadow-lg shadow-crypto-primary/20"
                                        : "bg-white/[0.05] text-white/40"
                                )}
                            >
                                {isTyping ? (
                                    <LoaderIcon className="w-4 h-4 animate-spin" />
                                ) : (
                                    <SendIcon className="w-4 h-4" />
                                )}
                                <span>Send</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Command Suggestions */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {commandSuggestions.map((suggestion, index) => (
                            <motion.button
                                key={suggestion.prefix}
                                onClick={() => selectCommandSuggestion(index)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-sm text-white/60 hover:text-white/90 transition-all relative group border border-white/[0.05] hover:border-crypto-primary/30"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="text-crypto-primary">
                                    {suggestion.icon}
                                </div>
                                <span>{suggestion.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Typing Indicator */}
            <AnimatePresence>
                {isTyping && (
                    <motion.div 
                        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 backdrop-blur-2xl bg-white/[0.02] rounded-full px-6 py-3 shadow-lg border border-white/[0.05]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-crypto-primary to-crypto-secondary flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/70">
                                <span>{currentPersonaInfo.name} is thinking</span>
                                <TypingDots />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mouse Follow Effect */}
            {inputFocused && (
                <motion.div 
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-crypto-primary via-crypto-secondary to-crypto-accent blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
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
                    className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                    style={{
                        boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)"
                    }}
                />
            ))}
        </div>
    );
}
