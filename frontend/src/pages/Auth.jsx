import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import '../styles/Auth.css'

function Auth() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isRegister) {
        await API.post('auth/register/', formData)
        alert('Account created successfully! Please login.')
        setIsRegister(false)
        setFormData({ username: '', email: '', password: '', role: 'user' })
      } else {
        const response = await API.post('auth/login/', {
          username: formData.username,
          password: formData.password
        })

        localStorage.setItem('access', response.data.access)
        localStorage.setItem('refresh', response.data.refresh)
        localStorage.setItem('username', formData.username)

        const payload = JSON.parse(atob(response.data.access.split('.')[1]))
        localStorage.setItem('role', payload.role || 'user')

        if (payload.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/user-dashboard')
        }
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = useCallback(() => {
    setIsRegister(prev => !prev)
    setError('')
    setFormData({ username: '', email: '', password: '', role: 'user' })
  }, [])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          )}
          
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
          
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
          
          {isRegister && (
            <select name="role" value={formData.role} onChange={handleChange} disabled={loading}>
              <option value="user">User</option>
            </select>
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <button type="button" className="toggle-button" onClick={toggleMode} disabled={loading}>
          {isRegister ? 'Have an account? Sign In' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  )
}

export default Auth