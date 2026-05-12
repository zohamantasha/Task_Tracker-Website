import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import API from '../api/axios'
import '../styles/EditTask.css'


function EditTask() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: ''
  })
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchTask()
  }, [taskId])

  const fetchTask = async () => {
    try {
      setLoading(true)
      const response = await API.get(`tasks/${taskId}/`)
      setFormData(response.data)
    } catch (error) {
      console.error('Error fetching task:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.due_date) newErrors.due_date = 'Due date is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await API.put(`tasks/${taskId}/edit/`, formData)
      navigate('/tasks', { 
        state: { message: 'Task updated successfully!' }
      })
    } catch (error) {
      console.error('Error updating task:', error)
      setErrors({ submit: 'Failed to update task. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='dashboard-container'>
        <Sidebar />
        <div className='main-content'>
          <Navbar />
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <h3>Loading task...</h3>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='dashboard-container'>
      <Sidebar />
      <div className='main-content'>
        <Navbar />
        <div className='edit-task-container'>
          <div className='edit-task-header'>
            <div className='header-content'>
              <h1>Edit Task</h1>
              <p>Update task details and save changes</p>
            </div>
            <button 
              className='back-button'
              onClick={() => navigate('/tasks')}
            >
              ← Back to Tasks
            </button>
          </div>

          <form className='edit-task-form' onSubmit={handleSubmit}>
            {errors.submit && (
              <div className='error-message'>{errors.submit}</div>
            )}

            <div className='form-group'>
              <label htmlFor='title'>Task Title</label>
              <input
                id='title'
                type='text'
                name='title'
                placeholder='Enter task title'
                value={formData.title}
                onChange={handleChange}
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className='error-text'>{errors.title}</span>}
            </div>

            <div className='form-group'>
              <label htmlFor='description'>Description</label>
              <textarea
                id='description'
                name='description'
                placeholder='Describe the task in detail...'
                value={formData.description}
                onChange={handleChange}
                rows='5'
                className={errors.description ? 'error' : ''}
              />
              {errors.description && (
                <span className='error-text'>{errors.description}</span>
              )}
            </div>

            <div className='form-row'>
              <div className='form-group'>
                <label htmlFor='priority'>Priority</label>
                <select
                  id='priority'
                  name='priority'
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value='low'>Low Priority</option>
                  <option value='medium'>Medium Priority</option>
                  <option value='high'>High Priority</option>
                </select>
              </div>

              <div className='form-group'>
                <label htmlFor='status'>Status</label>
                <select
                  id='status'
                  name='status'
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value='todo'>Pending</option>
                  <option value='in_progress'>In Progress</option>
                  <option value='completed'>Completed</option>
                </select>
              </div>

              <div className='form-group'>
                <label htmlFor='due_date'>Due Date</label>
                <input
                  id='due_date'
                  type='date'
                  name='due_date'
                  value={formData.due_date}
                  onChange={handleChange}
                  className={errors.due_date ? 'error' : ''}
                />
                {errors.due_date && (
                  <span className='error-text'>{errors.due_date}</span>
                )}
              </div>
            </div>

            <div className='form-actions'>
              <button
                type='button'
                className='cancel-button'
                onClick={() => navigate('/tasks')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type='submit'
                className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className='spinner'></span>
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditTask