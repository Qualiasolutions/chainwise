"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, Star, Trash2, MoreHorizontal, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { AI_PERSONAS } from "./ChatHeader"

interface ChatSession {
  id: string
  title: string
  persona: keyof typeof AI_PERSONAS
  last_message_preview?: string
  message_count: number
  is_favorite: boolean
  updated_at: string
}

interface ChatSidebarProps {
  sessions: ChatSession[]
  currentSessionId?: string | null
  onSessionSelect: (sessionId: string) => void
  onNewChat: () => void
  onDeleteSession: (sessionId: string) => void
  onToggleFavorite: (sessionId: string) => void
  isLoading?: boolean
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  onToggleFavorite,
  isLoading = false
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter and sort sessions (favorites first, then by date)
  const filteredSessions = useMemo(() => {
    let filtered = sessions

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = sessions.filter(session =>
        session.title?.toLowerCase().includes(query) ||
        session.last_message_preview?.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) {
        return a.is_favorite ? -1 : 1
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [sessions, searchQuery])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-sm text-gray-500">
                {searchQuery ? 'No results' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredSessions.map((session) => {
                const persona = AI_PERSONAS[session.persona]
                const Icon = persona.icon
                const isActive = currentSessionId === session.id

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                  >
                    <button
                      onClick={() => onSessionSelect(session.id)}
                      className={cn(
                        "w-full group relative flex items-start gap-3 p-3 rounded-lg transition-all",
                        "hover:bg-gray-50 dark:hover:bg-gray-900",
                        isActive && "bg-gray-50 dark:bg-gray-900 border border-violet-200 dark:border-violet-800"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-r",
                        persona.color
                      )}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">
                            {session.title || 'New Chat'}
                          </span>
                          {session.is_favorite && (
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        {session.last_message_preview && (
                          <p className="text-xs text-gray-500 truncate">
                            {session.last_message_preview}
                          </p>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite(session.id)
                          }}>
                            <Star className="h-4 w-4 mr-2" />
                            {session.is_favorite ? 'Unfavorite' : 'Favorite'}
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
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
