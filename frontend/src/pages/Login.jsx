import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'
import '../styles/Login.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
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
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        'Invalid username or password'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login-container'>
      <div className='login-card'>
        <h2>Welcome Back</h2>
        <p className='subtitle'>Sign in to your account</p>

        {error && <div className='error-message'>✗ {error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type='text'
            name='username'
            placeholder='Username'
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <input
            type='password'
            name='password'
            placeholder='Password'
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <button type='submit' disabled={loading} className='submit-btn'>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className='toggle-container'>
          <span>Don't have an account? </span>
          <Link to='/register' className='toggle-btn'>Create Account</Link>
        </div>
      </div>
    </div>
  )
}

export default Login