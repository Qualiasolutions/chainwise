"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bot,
  GraduationCap,
  TrendingUp,
  Plus,
  Search,
  Star,
  Archive,
  Trash2,
  MoreHorizontal,
  MessageCircle,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatSession {
  id: string
  title: string
  persona: 'buddy' | 'professor' | 'trader'
  last_message_preview?: string
  message_count: number
  is_favorite: boolean
  created_at: string
  updated_at: string
}

interface ChatSidebarProps {
  sessions: ChatSession[]
  currentSessionId?: string | null
  onSessionSelect: (sessionId: string) => void
  onNewChat: () => void
  onArchiveSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onToggleFavorite: (sessionId: string) => void
  isLoading?: boolean
}

const PERSONA_CONFIG = {
  buddy: {
    icon: Bot,
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    label: 'Buddy'
  },
  professor: {
    icon: GraduationCap,
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    label: 'Professor'
  },
  trader: {
    icon: TrendingUp,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    label: 'Trader'
  }
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onArchiveSession,
  onDeleteSession,
  onToggleFavorite,
  isLoading = false
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter sessions based on search
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions

    const query = searchQuery.toLowerCase()
    return sessions.filter(session =>
      session.title?.toLowerCase().includes(query) ||
      session.last_message_preview?.toLowerCase().includes(query)
    )
  }, [sessions, searchQuery])

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const groups: Record<string, ChatSession[]> = {
      favorites: [],
      today: [],
      yesterday: [],
      lastWeek: [],
      older: []
    }

    filteredSessions.forEach(session => {
      const sessionDate = new Date(session.updated_at)
      sessionDate.setHours(0, 0, 0, 0)

      if (session.is_favorite) {
        groups.favorites.push(session)
      } else if (sessionDate.getTime() === today.getTime()) {
        groups.today.push(session)
      } else if (sessionDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(session)
      } else if (sessionDate >= lastWeek) {
        groups.lastWeek.push(session)
      } else {
        groups.older.push(session)
      }
    })

    return groups
  }, [filteredSessions])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  const renderSession = (session: ChatSession) => {
    const personaConfig = PERSONA_CONFIG[session.persona]
    const Icon = personaConfig.icon
    const isActive = currentSessionId === session.id

    return (
      <motion.div
        key={session.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        layout
      >
        <button
          onClick={() => onSessionSelect(session.id)}
          className={cn(
            "w-full group relative flex flex-col items-start gap-2 p-3 rounded-lg transition-all duration-200",
            "hover:bg-slate-100 dark:hover:bg-slate-800/80",
            isActive && "bg-slate-100 dark:bg-slate-900 border border-violet-200 dark:border-violet-800"
          )}
        >
          <div className="flex items-center gap-2 w-full">
            <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-white flex-shrink-0", personaConfig.color)}>
              <Icon className="h-3 w-3" />
            </div>

            <span className="text-sm font-medium truncate flex-1 text-left">
              {session.title || 'New Chat'}
            </span>

            {session.is_favorite && (
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(session.id)
                }}>
                  <Star className="h-4 w-4 mr-2" />
                  {session.is_favorite ? 'Unfavorite' : 'Favorite'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  onArchiveSession(session.id)
                }}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSession(session.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {session.last_message_preview && (
            <p className="text-xs text-slate-500 truncate w-full text-left pl-8">
              {session.last_message_preview}
            </p>
          )}

          <div className="flex items-center justify-between w-full text-xs text-slate-400 pl-8">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTimestamp(session.updated_at)}</span>
            </div>
            <Badge variant="secondary" className="h-4 px-1 text-xs">
              {session.message_count}
            </Badge>
          </div>
        </button>
      </motion.div>
    )
  }

  const renderGroup = (title: string, sessions: ChatSession[]) => {
    if (sessions.length === 0) return null

    return (
      <div key={title} className="mb-4">
        <h3 className="text-xs font-semibold text-slate-500 px-3 mb-2 uppercase tracking-wide">
          {title}
        </h3>
        <div className="space-y-1">
          <AnimatePresence>
            {sessions.map(renderSession)}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-violet-600" />
            <h2 className="text-sm font-semibold">Conversations</h2>
          </div>
          <Badge variant="secondary" className="text-xs">
            {sessions.length}
          </Badge>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
                <p className="text-sm text-slate-500">Loading conversations...</p>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <MessageCircle className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-xs text-slate-500">
                {searchQuery ? 'Try a different search term' : 'Start a new chat to begin'}
              </p>
            </div>
          ) : (
            <>
              {renderGroup('Favorites', groupedSessions.favorites)}
              {renderGroup('Today', groupedSessions.today)}
              {renderGroup('Yesterday', groupedSessions.yesterday)}
              {renderGroup('Last 7 Days', groupedSessions.lastWeek)}
              {renderGroup('Older', groupedSessions.older)}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
