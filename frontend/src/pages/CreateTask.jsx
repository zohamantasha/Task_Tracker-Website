import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import '../styles/CreateTask.css'

function CreateTask() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to: []
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await API.get('auth/users/')
      const filteredUsers = response.data.filter((user) => user.role !== 'admin')
      setUsers(filteredUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCheckbox = (userId) => {
    const alreadySelected = formData.assigned_to.includes(userId)
    
    if (alreadySelected) {
      setFormData({
        ...formData,
        assigned_to: formData.assigned_to.filter((id) => id !== userId)
      })
    } else {
      setFormData({
        ...formData,
        assigned_to: [...formData.assigned_to, userId]
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.assigned_to.length === 0) {
      alert('Please select at least one user')
      return
    }

    setLoading(true)
    try {
      await API.post('tasks/create/', {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        due_date: formData.due_date,
        assigned_to: formData.assigned_to
      })

      alert('Task Created Successfully!')
      navigate('/admin')
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Error creating task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='create-task-container'>
      <div className='create-task-card'>
        <h2>Create Task</h2>
        
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <input
              type='text'
              name='title'
              placeholder='Task Title'
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className='form-group'>
            <textarea
              name='description'
              placeholder='Task Description'
              value={formData.description}
              onChange={handleChange}
              rows='4'
              required
            />
          </div>

          <div className='form-group'>
            <select
              name='priority'
              value={formData.priority}
              onChange={handleChange}
            >
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
            </select>
          </div>

          <div className='form-group'>
            <input
              type='date'
              name='due_date'
              value={formData.due_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className='assign-users'>
            <h3>Assign Users ({formData.assigned_to.length} selected)</h3>
            
            {users.length === 0 ? (
              <p>No Users Found</p>
            ) : (
              <div className='users-list'>
                {users.map((user) => (
                  <label key={user.id} className='user-checkbox'>
                    <input
                      type='checkbox'
                      checked={formData.assigned_to.includes(user.id)}
                      onChange={() => handleCheckbox(user.id)}
                    />
                    <span>{user.username}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button type='submit' disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateTask