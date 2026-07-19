'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Loader2, Sparkles, Code, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  codeBlocks?: { language: string; code: string }[]
  timestamp: Date
}

interface SuggestedQuestion {
  text: string
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [tutorAvailable, setTutorAvailable] = useState<boolean | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([
    { text: 'Co je to neuronová síť?' },
    { text: 'Jak funguje backpropagation?' },
    { text: 'Jaký je rozdíl mezi supervised a unsupervised learning?' },
    { text: 'Pomoz mi pochopit attention mechanismus' },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/ai-tutor/status')
        const data = await response.json()
        setTutorAvailable(Boolean(data.available))
      } catch {
        setTutorAvailable(false)
      }
    }

    fetchStatus()
  }, [])

  const handleSend = async (text?: string) => {
    const messageText = text ?? input.trim()
    if (!messageText || loading || tutorAvailable !== true) return

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setSuggestedQuestions([])

    try {
      const res = await fetch('/api/ai-tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Chyba při komunikaci s AI tutorem')
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.data.response,
        codeBlocks: data.data.codeBlocks,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setConversationId(data.data.conversationId)

      // Update suggested questions
      if (data.data.suggestedFollowups?.length > 0) {
        setSuggestedQuestions(data.data.suggestedFollowups.map((text: string) => ({ text })))
      }
    } catch (error) {
      console.error('Error:', error)
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Něco se pokazilo. Zkus to znovu.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user'

    return (
      <motion.div
        key={message.id}
        className={cn('flex gap-3 p-4', isUser ? 'bg-gray-800/50' : 'bg-gray-900/50')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
            isUser ? 'bg-indigo-500' : 'bg-gradient-to-br from-[#846bff] to-[#6747ff]'
          )}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400 mb-1">{isUser ? 'Ty' : 'AI Tutor'}</p>
          <div className="text-white prose prose-invert prose-sm max-w-none">
            {/* Render markdown-like content */}
            {message.content.split('\n').map((line, i) => (
              <p key={i} className="mb-2 last:mb-0">
                {line}
              </p>
            ))}
          </div>

          {/* Code blocks */}
          {message.codeBlocks && message.codeBlocks.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.codeBlocks.map((block, i) => (
                <div key={i} className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1 bg-gray-800 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Code className="w-3 h-3" />
                      {block.language}
                    </span>
                  </div>
                  <pre className="p-3 text-sm text-green-400 overflow-x-auto">
                    <code>{block.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  if (tutorAvailable === false) {
    return (
      <div className="flex h-screen flex-col bg-gray-900">
        <div className="flex items-center gap-3 border-b border-gray-800 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#846bff] to-[#6747ff]">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">AI Tutor</h1>
            <p className="text-sm text-gray-400">Připravujeme pro Učebnici v2</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div className="max-w-md">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#846bff] to-[#6747ff]">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-white">AI Tutor bude brzy dostupný</h2>
            <p className="text-gray-400">
              Tuhle část ještě konfigurujeme pro ostrý provoz. Jakmile bude tutor napojený na obsah
              kurzu a stabilní model, vrátíme ho do aktivního režimu.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#846bff] to-[#6747ff] flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">AI Tutor</h1>
          <p className="text-sm text-gray-400">Tvůj osobní průvodce světem AI</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#846bff] to-[#6747ff] flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Ahoj! Jsem tvůj AI Tutor</h2>
            <p className="text-gray-400 max-w-md mb-6">
              Pomůžu ti pochopit koncepty umělé inteligence, machine learningu a programování.
              Zeptej se mě na cokoliv!
            </p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}

        {loading && (
          <div className="flex gap-3 p-4 bg-gray-900/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#846bff] to-[#6747ff] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Přemýšlím...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      <AnimatePresence>
        {suggestedQuestions.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 p-4 border-t border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.text)}
                disabled={loading || tutorAvailable !== true}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-full transition-colors disabled:opacity-50"
              >
                {q.text}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Zeptej se mě na cokoliv o AI..."
            disabled={loading || tutorAvailable !== true}
            rows={1}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading || tutorAvailable !== true}
            className="px-4 py-3 bg-[#6747ff] text-white rounded-xl hover:bg-[#846bff] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
