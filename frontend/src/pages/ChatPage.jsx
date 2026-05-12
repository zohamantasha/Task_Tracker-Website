import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import '../styles/ChatPage.css'

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

function ChatPage() {
  const { id } = useParams()           // task id
  const navigate = useNavigate()

  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('connecting') // 'connected' | 'disconnected'
  const [typingUsers, setTypingUsers] = useState([])

  const ws = useRef(null)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  const currentUser = localStorage.getItem('username')

  // 1. Fetch conversation on mount
  useEffect(() => {
    const getConversation = async () => {
      try {
        const res = await API.get(`chat/conversation/${id}/`)
        setConversationId(res.data.id)
      } catch (err) {
        console.error(err)
      }
    }
    getConversation()
  }, [id])

  // 2. Load message history + mark seen
  useEffect(() => {
    if (!conversationId) return

    const fetchMessages = async () => {
      try {
        const res = await API.get(`chat/messages/${conversationId}/`)
        setMessages(res.data)
        // mark all as seen
        await API.post(`chat/messages/${conversationId}/mark-seen/`)
      } catch (err) {
        console.error(err)
      }
    }
    fetchMessages()
  }, [conversationId])

  // 3. Open WebSocket once we have the conversation
  useEffect(() => {
    if (!conversationId) return

    const token = localStorage.getItem('access')
    const socket = new WebSocket(
      `${WS_BASE}/ws/chat/${conversationId}/?token=${token}`
    )
    ws.current = socket

    socket.onopen = () => setStatus('connected')
    socket.onclose = () => setStatus('disconnected')

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'chat_message') {
        setMessages(prev => [...prev, data.message])
        // mark seen immediately if it's from someone else
        if (data.message.sender_name?.toLowerCase() !== currentUser?.toLowerCase()) {
          API.post(`chat/messages/${conversationId}/mark-seen/`)
        }
      }

      if (data.type === 'typing') {
        if (data.username !== currentUser) {
          setTypingUsers(prev =>
            prev.includes(data.username) ? prev : [...prev, data.username]
          )
          // clear after 3s
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u !== data.username))
          }, 3000)
        }
      }
    }

    return () => socket.close()
  }, [conversationId])

  // 4. Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  // 5. Send message via WebSocket
  const sendMessage = useCallback(() => {
    if (!content.trim() || !ws.current) return
    if (ws.current.readyState !== WebSocket.OPEN) return

    ws.current.send(JSON.stringify({
      type: 'chat_message',
      content: content.trim()
    }))
    setContent('')
  }, [content])

  // 6. Typing indicator — send event, debounce stop
  const handleTyping = (e) => {
    setContent(e.target.value)
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'typing' }))
    }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'stop_typing' }))
      }
    }, 1500)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <span>Task Chat</span>
        <span className={`status-dot ${status}`} title={status} />
      </div>

      <div className="chat-box">
        {messages.map((msg) => {
          const isMine = msg.sender_name?.toLowerCase() === currentUser?.toLowerCase()
          return (
            <div key={msg.id} className={`message ${isMine ? 'sent' : 'received'}`}>
              {!isMine && <div className="sender-name">{msg.sender_name}</div>}
              <div className="message-text">{msg.content}</div>
              <div className="message-meta">
                <span className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
                {isMine && (
                  <span className="seen-status">
                    {msg.seen_by_all ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
            <span className="dots"><span>.</span><span>.</span><span>.</span></span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <textarea
          rows={1}
          placeholder="Type message... (Enter to send)"
          value={content}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage} disabled={!content.trim()}>Send</button>
      </div>
    </div>
  )
}

export default ChatPage