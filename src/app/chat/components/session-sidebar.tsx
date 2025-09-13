'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit3,
  Calendar,
  Search,
  X,
  Menu,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ChatSession } from '../hooks/use-chat-session'
import { type AIPersona } from '@/lib/openai-service'

interface SessionSidebarProps {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  onSessionSelect: (sessionId: string) => void
  onNewSession: (persona?: AIPersona) => void
  onDeleteSession: (sessionId: string) => void
  onUpdateTitle: (sessionId: string, title: string) => void
  isOpen?: boolean
  onToggle?: () => void
  className?: string
}

export function SessionSidebar({
  sessions,
  currentSession,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  onUpdateTitle,
  isOpen = true,
  onToggle,
  className
}: SessionSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const filteredSessions = sessions.filter(session => 
    session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const groupedSessions = filteredSessions.reduce((groups: Record<string, ChatSession[]>, session) => {
    const today = new Date()
    const sessionDate = new Date(session.updatedAt)
    const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
    
    let group: string
    if (diffDays === 0) group = 'Today'
    else if (diffDays === 1) group = 'Yesterday'
    else if (diffDays <= 7) group = 'This Week'
    else if (diffDays <= 30) group = 'This Month'
    else group = 'Older'
    
    if (!groups[group]) groups[group] = []
    groups[group].push(session)
    
    return groups
  }, {})

  const handleStartEdit = (session: ChatSession) => {
    setEditingSessionId(session.id)
    setEditingTitle(session.title || 'New Chat')
  }

  const handleSaveTitle = () => {
    if (editingSessionId && editingTitle.trim()) {
      onUpdateTitle(editingSessionId, editingTitle.trim())
    }
    setEditingSessionId(null)
    setEditingTitle('')
  }

  const handleCancelEdit = () => {
    setEditingSessionId(null)
    setEditingTitle('')
  }

  const getPersonaColor = (persona: AIPersona) => {
    const colors = {
      buddy: 'text-blue-400 bg-blue-500/10',
      professor: 'text-purple-400 bg-purple-500/10',
      trader: 'text-green-400 bg-green-500/10'
    }
    return colors[persona]
  }

  const getPersonaIcon = (persona: AIPersona) => {
    const icons = {
      buddy: '👋',
      professor: '🎓', 
      trader: '📈'
    }
    return icons[persona]
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onToggle && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.div 
        className={cn(
          "fixed inset-y-0 left-0 w-80 backdrop-blur-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-r border-purple-300/20 shadow-2xl z-50 flex flex-col",
          "lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
        initial={{ x: isOpen ? 0 : -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-purple-300/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Chat Sessions</h2>
            {onToggle && (
              <button 
                onClick={onToggle}
                className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300/60" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-purple-300/20 rounded-xl px-10 py-3 text-white placeholder:text-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400/40"
            />
          </div>

          {/* New Chat Button */}
          <motion.button
            onClick={() => onNewSession()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-4 py-3 rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </motion.button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.keys(groupedSessions).length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-purple-300/50 mx-auto mb-3" />
              <p className="text-purple-200/70 text-sm">
                {searchQuery ? 'No chats found' : 'No chat sessions yet'}
              </p>
            </div>
          ) : (
            Object.entries(groupedSessions).map(([group, groupSessions]) => (
              <div key={group} className="space-y-2">
                <h3 className="text-sm font-medium text-purple-200/60 px-2 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{group}</span>
                </h3>
                
                {groupSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    layout
                    className={cn(
                      "group relative rounded-xl border transition-all cursor-pointer",
                      currentSession?.id === session.id
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/40 shadow-lg"
                        : "bg-white/5 border-purple-300/20 hover:bg-white/10 hover:border-purple-400/30"
                    )}
                    onClick={() => onSessionSelect(session.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          {editingSessionId === session.id ? (
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onBlur={handleSaveTitle}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTitle()
                                if (e.key === 'Escape') handleCancelEdit()
                              }}
                              className="w-full bg-transparent border-none outline-none text-white font-medium text-sm"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <h4 className="text-white font-medium text-sm truncate">
                              {session.title || 'New Chat'}
                            </h4>
                          )}

                          {/* Persona Badge */}
                          <div className={cn(
                            "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium mt-2",
                            getPersonaColor(session.persona)
                          )}>
                            <span>{getPersonaIcon(session.persona)}</span>
                            <span>
                              {session.persona === 'buddy' ? 'Buddy' :
                               session.persona === 'professor' ? 'Professor' : 'Trader'}
                            </span>
                          </div>

                          {/* Preview */}
                          <p className="text-purple-200/50 text-xs mt-2 line-clamp-2">
                            {session.messages[session.messages.length - 1]?.content || 'No messages yet'}
                          </p>

                          {/* Timestamp */}
                          <p className="text-purple-200/40 text-xs mt-2">
                            {new Date(session.updatedAt).toLocaleDateString()} • {session.messages.length} messages
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartEdit(session)
                              }}
                              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Rename"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteSession(session.id)
                              }}
                              className="p-1.5 text-white/60 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Indicator */}
                    {currentSession?.id === session.id && (
                      <motion.div 
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-full"
                        layoutId="activeSession"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-300/20">
          <div className="text-xs text-purple-200/50 text-center">
            <p>{sessions.length} total session{sessions.length === 1 ? '' : 's'}</p>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// Mobile Toggle Button
export function SessionSidebarToggle({ 
  isOpen, 
  onToggle 
}: { 
  isOpen: boolean
  onToggle: () => void 
}) {
  return (
    <motion.button
      onClick={onToggle}
      className="fixed top-6 left-6 z-40 lg:hidden p-3 backdrop-blur-2xl bg-gradient-to-br from-purple-900/90 to-indigo-900/90 border border-purple-300/20 rounded-2xl shadow-2xl"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className="w-5 h-5 text-white" />
        )}
      </motion.div>
    </motion.button>
  )
}