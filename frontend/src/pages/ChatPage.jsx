import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import '../styles/ChatPage.css'

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

function ChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('connecting')
  const [typingUsers, setTypingUsers] = useState([])
  const [taskTitle, setTaskTitle] = useState('')

  const ws = useRef(null)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  const currentUser = localStorage.getItem('username')

  useEffect(() => {
    getConversation()
  }, [id])

  useEffect(() => {
    if (!conversationId) return
    fetchMessages()
    connectWebSocket()
    return () => ws.current?.close()
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  const getConversation = async () => {
    try {
      const res = await API.get(`chat/conversation/${id}/`)
      setConversationId(res.data.id)
      // get task title
      const taskRes = await API.get(`tasks/${id}/`)
      setTaskTitle(taskRes.data.title)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMessages = async () => {
    try {
      const res = await API.get(`chat/messages/${conversationId}/`)
      setMessages(res.data)
      await API.post(`chat/messages/${conversationId}/mark-seen/`)
    } catch (err) {
      console.error(err)
    }
  }

  const connectWebSocket = () => {
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
        setMessages(prev => {
          // avoid duplicate
          const exists = prev.find(m => m.id === data.message.id)
          if (exists) return prev
          return [...prev, data.message]
        })
        if (data.message.sender_name !== currentUser) {
          API.post(`chat/messages/${conversationId}/mark-seen/`)
        }
      }

      if (data.type === 'typing') {
        if (data.username !== currentUser) {
          setTypingUsers(prev =>
            prev.includes(data.username) ? prev : [...prev, data.username]
          )
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u !== data.username))
          }, 3000)
        }
      }
    }
  }

  const sendMessage = useCallback(() => {
    if (!content.trim() || !ws.current) return
    if (ws.current.readyState !== WebSocket.OPEN) return

    ws.current.send(JSON.stringify({
      type: 'chat_message',
      content: content.trim()
    }))
    setContent('')
  }, [content])

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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString([], {
      day: 'numeric', month: 'short'
    })
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.created_at).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {})

  return (
    <div className='chat-container'>
      <div className='chat-header'>
        <button className='back-btn' onClick={() => navigate(-1)}>← Back</button>
        <div className='chat-header-info'>
          <span className='chat-title'>{taskTitle || 'Task Chat'}</span>
          <span className={`status-badge ${status}`}>
            {status === 'connected' ? '● Online' : '● Offline'}
          </span>
        </div>
      </div>

      <div className='chat-box'>
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className='date-divider'>
              <span>{formatDate(msgs[0].created_at)}</span>
            </div>
            {msgs.map((msg) => {
              const isMine = msg.sender_name === currentUser
              return (
                <div key={msg.id} className={`message-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                  {!isMine && (
                    <div className='avatar'>
                      {msg.sender_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`message-bubble ${isMine ? 'sent' : 'received'}`}>
                    {!isMine && (
                      <div className='sender-name'>{msg.sender_name}</div>
                    )}
                    <div className='message-text'>{msg.content}</div>
                    <div className='message-meta'>
                      <span className='message-time'>{formatTime(msg.created_at)}</span>
                      {isMine && (
                        <span className='seen-status' title={
                          msg.seen_by_all ? 'Seen by all' :
                          msg.seen_by_names?.length > 0
                            ? `Seen by: ${msg.seen_by_names.join(', ')}`
                            : 'Delivered'
                        }>
                          {msg.seen_by_all ? '✓✓' :
                           msg.seen_by_names?.length > 0 ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                  {isMine && (
                    <div className='avatar mine'>
                      {currentUser?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {typingUsers.length > 0 && (
          <div className='typing-indicator'>
            <div className='typing-bubble'>
              <span>{typingUsers.join(', ')} is typing</span>
              <span className='dots'>
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className='chat-input'>
        <textarea
          rows={1}
          placeholder='Type a message... (Enter to send)'
          value={content}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          disabled={!content.trim()}
          className='send-btn'
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatPage