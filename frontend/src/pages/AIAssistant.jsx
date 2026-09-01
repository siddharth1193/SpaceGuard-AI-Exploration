import { useState, useRef, useEffect } from 'react'
import { chatWithAI } from '../services/api'

const SUGGESTED_QUESTIONS = [
  'Which satellites require immediate attention?',
  'What is the current space weather situation?',
  'Which satellites have stale orbital data?',
  'Explain the anomalies detected today.',
  'What should an operator check right now?',
  'Are any satellites at critical risk?',
]

export default function AIAssistant({ satellites, spaceWeather, anomalies }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m SpaceGuard AI, your space operations assistant. I have access to real-time satellite telemetry, space weather data, and anomaly reports. How can I help you today?',
      source: 'SYSTEM',
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const content = text || input.trim()
    if (!content || loading) return

    setInput('')
    const userMsg = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = [...messages, userMsg]
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }))

      const res = await chatWithAI(history, true)
      setMessages(prev => [...prev, res.data || { role: 'assistant', content: 'No response received.' }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again.',
        source: 'ERROR',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const criticalCount = satellites?.filter(s => s.health?.status === 'CRITICAL').length || 0
  const warningCount = satellites?.filter(s => s.health?.status === 'WARNING').length || 0

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] p-4 lg:p-6 gap-4">
      {/* Header info */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg">
          <span className="text-blue-400">🤖</span>
          <span>IBM Granite / Local Fallback</span>
        </div>
        {satellites?.length > 0 && (
          <div className="text-xs text-gray-400">
            Context: <span className="text-white">{satellites.length}</span> satellites,{' '}
            <span className="text-red-400">{criticalCount}</span> critical,{' '}
            <span className="text-yellow-400">{warningCount}</span> warnings,{' '}
            <span className="text-orange-400">{anomalies?.length || 0}</span> anomalies
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-none text-xs">🤖</div>
            <div className="card max-w-xl flex-1">
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-xs px-3 py-1.5 bg-gray-800 border border-gray-600 hover:border-blue-500/50 hover:text-blue-300 text-gray-300 rounded-full transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 items-end">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about satellite status, anomalies, space weather..."
          disabled={loading}
          rows={2}
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-sm text-gray-200 placeholder-gray-500
            focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="btn-primary h-12 px-5 flex-none"
        >
          Send
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Responses use platform data and IBM Granite. May not reflect real-world conditions.
      </p>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-none text-xs font-bold ${
        isUser ? 'bg-gray-600' : 'bg-blue-600'
      }`}>
        {isUser ? 'U' : '🤖'}
      </div>
      <div className={`max-w-2xl ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600/25 border border-blue-500/30 text-blue-100'
            : 'bg-gray-800 border border-gray-700/50 text-gray-200'
        }`}>
          {message.content}
        </div>
        {message.source && message.source !== 'SYSTEM' && (
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
            message.source === 'WATSONX'
              ? 'bg-blue-500/15 text-blue-400'
              : message.source === 'ERROR'
              ? 'bg-red-500/15 text-red-400'
              : 'bg-purple-500/15 text-purple-400'
          }`}>
            {message.source}
          </span>
        )}
      </div>
    </div>
  )
}
