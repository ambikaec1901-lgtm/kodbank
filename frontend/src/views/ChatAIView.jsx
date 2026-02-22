import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

// ─── BANKING AI WELCOME SUGGESTIONS ───────────────────────────────────────────
const SUGGESTIONS = [
    { icon: '💰', text: 'How can I save more money each month?' },
    { icon: '📊', text: 'Explain my account balance and how interest works' },
    { icon: '🔒', text: 'How do I keep my bank account secure?' },
    { icon: '💳', text: 'What are the best practices for credit card usage?' },
    { icon: '📈', text: 'Give me tips for investing my savings wisely' },
    { icon: '🏠', text: 'How do I budget for a large purchase like a house?' },
]

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────
function TypingBubble() {
    return (
        <div className="chat-msg chat-msg-ai">
            <div className="chat-avatar-ai">
                <span>🤖</span>
            </div>
            <div className="chat-bubble chat-bubble-ai chat-typing">
                <span className="chat-dot" />
                <span className="chat-dot" />
                <span className="chat-dot" />
            </div>
        </div>
    )
}

// ─── SINGLE MESSAGE ───────────────────────────────────────────────────────────
function Message({ msg }) {
    const isUser = msg.role === 'user'
    const lines = msg.content.split('\n')

    return (
        <div className={`chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-ai'}`}>
            {!isUser && (
                <div className="chat-avatar-ai">
                    <span>🤖</span>
                </div>
            )}
            <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                {lines.map((line, i) => {
                    // Bold text **...**
                    const parts = line.split(/\*\*(.*?)\*\*/g)
                    return (
                        <p key={i} style={{ margin: i === 0 ? 0 : '6px 0 0' }}>
                            {parts.map((part, j) =>
                                j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                            )}
                        </p>
                    )
                })}
                <div className="chat-time">
                    {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            {isUser && (
                <div className="chat-avatar-user">
                    <span>👤</span>
                </div>
            )}
        </div>
    )
}

// ─── MAIN CHAT VIEW ───────────────────────────────────────────────────────────
export default function ChatAIView({ profile }) {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const bottomRef = useRef(null)
    const textareaRef = useRef(null)

    // Auto scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    // Auto-resize textarea
    const adjustTextarea = () => {
        const ta = textareaRef.current
        if (!ta) return
        ta.style.height = 'auto'
        ta.style.height = Math.min(ta.scrollHeight, 150) + 'px'
    }

    const sendMessage = async (text) => {
        const content = (text || input).trim()
        if (!content || loading) return

        const userMsg = { role: 'user', content, timestamp: Date.now() }
        const history = [...messages, userMsg]
        setMessages(history)
        setInput('')
        setError('')
        setLoading(true)

        // Reset textarea height
        if (textareaRef.current) textareaRef.current.style.height = 'auto'

        try {
            const res = await axios.post(
                'http://localhost:5000/api/chat',
                {
                    messages: history.map(m => ({ role: m.role, content: m.content })),
                    username: profile?.username || 'User',
                },
                { withCredentials: true }
            )

            const aiMsg = {
                role: 'assistant',
                content: res.data.reply,
                timestamp: Date.now(),
            }
            setMessages(prev => [...prev, aiMsg])
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to get response. Please try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const clearChat = () => {
        setMessages([])
        setError('')
    }

    const isWelcome = messages.length === 0

    return (
        <div className="chat-shell">
            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <div className="chat-header">
                <div className="chat-header-left">
                    <div className="chat-header-icon">🤖</div>
                    <div>
                        <div className="chat-header-title">KodBank AI Assistant</div>
                        <div className="chat-header-sub">
                            <span className="chat-online-dot" />
                            Powered by DeepSeek · Always available
                        </div>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button className="chat-clear-btn" onClick={clearChat} title="Clear chat">
                        🗑 Clear Chat
                    </button>
                )}
            </div>

            {/* ── MESSAGES AREA ──────────────────────────────────────────── */}
            <div className="chat-body">
                {isWelcome ? (
                    <div className="chat-welcome">
                        <div className="chat-welcome-icon">✨</div>
                        <h2 className="chat-welcome-title">
                            Hello, {profile?.username ? profile.username.charAt(0).toUpperCase() + profile.username.slice(1) : 'there'}!
                        </h2>
                        <p className="chat-welcome-sub">
                            I'm your KodBank AI assistant. Ask me anything about banking,
                            finance, savings, or your account.
                        </p>
                        <div className="chat-suggestions">
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    className="chat-suggestion-card"
                                    onClick={() => sendMessage(s.text)}
                                >
                                    <span className="chat-suggestion-icon">{s.icon}</span>
                                    <span>{s.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <Message key={i} msg={msg} />
                        ))}
                        {loading && <TypingBubble />}
                        {error && (
                            <div className="chat-error">
                                ⚠️ {error}
                                <button onClick={() => setError('')} className="chat-error-dismiss">✕</button>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* ── INPUT BAR ──────────────────────────────────────────────── */}
            <div className="chat-input-wrap">
                <div className="chat-input-box">
                    <textarea
                        ref={textareaRef}
                        className="chat-textarea"
                        placeholder="Ask me anything about banking, finance, or your account…"
                        value={input}
                        onChange={e => { setInput(e.target.value); adjustTextarea() }}
                        onKeyDown={handleKey}
                        rows={1}
                        disabled={loading}
                    />
                    <button
                        className={`chat-send-btn ${(!input.trim() || loading) ? 'disabled' : ''}`}
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        id="btn-chat-send"
                        title="Send message (Enter)"
                    >
                        {loading ? (
                            <span className="chat-send-spinner" />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="chat-input-hint">
                    Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
                </div>
            </div>
        </div>
    )
}
