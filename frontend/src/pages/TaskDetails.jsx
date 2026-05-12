import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import '../styles/TaskDetails.css'

function TaskDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [updates, setUpdates] = useState([])
  const [updateText, setUpdateText] = useState('')
  const [hoursSpent, setHoursSpent] = useState(1)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTask()
    fetchUpdates()
  }, [])

  const fetchTask = async () => {
    try {
      const response = await API.get(`tasks/${id}/`)
      setTask(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchUpdates = async () => {
    try {
      const response = await API.get(`tasks/${id}/updates/`)
      setUpdates(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const addUpdate = async () => {
    if (!updateText.trim()) return
    setLoading(true)
    try {
      await API.post(`tasks/${id}/add-update/`, {
        update_text: updateText,
        hours_spent: hoursSpent,
        progress_percentage: progressPercentage
      })
      setUpdateText('')
      setHoursSpent(1)
      setProgressPercentage(0)
      fetchTask()
      fetchUpdates()
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  if (!task) return <h2>Loading...</h2>

  const role = localStorage.getItem('role')

  return (
    <div className='task-details-container'>
      <div className='task-header'>
        <button
          className='back-btn'
          onClick={() => navigate(role === 'admin' ? '/admin' : '/user-dashboard')}
        >
          ← Dashboard
        </button>
        <h2>Task Details</h2>
      </div>

      <div className='task-card'>
        <h3>{task.title}</h3>
        <p>{task.description}</p>
        <p><strong>Status:</strong> {task.status?.replace('_', ' ')}</p>
        <p><strong>Priority:</strong> {task.priority}</p>
        <p><strong>Due Date:</strong> {task.due_date}</p>
        {task.assigned_to_names?.length > 0 && (
          <p><strong>Assigned to:</strong> {task.assigned_to_names.join(', ')}</p>
        )}
      </div>

      {/* Add Update */}
      <div className='update-box'>
        <h3>Add Work Update</h3>
        <textarea
          placeholder='Describe your work...'
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
          rows={4}
        />
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <label>
            Hours Spent:
            <input
              type='number'
              min='0'
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              style={{ marginLeft: '8px', width: '70px' }}
            />
          </label>
          <label>
            Progress %:
            <input
              type='number'
              min='0'
              max='100'
              value={progressPercentage}
              onChange={(e) => setProgressPercentage(e.target.value)}
              style={{ marginLeft: '8px', width: '70px' }}
            />
          </label>
        </div>
        <button
          onClick={addUpdate}
          disabled={loading}
          style={{ marginTop: '10px' }}
        >
          {loading ? 'Saving...' : 'Add Update'}
        </button>
      </div>

      {/* Updates List */}
      <div className='updates-section'>
        <h3>Work Updates</h3>
        {updates.length === 0 ? (
          <p>No updates yet.</p>
        ) : (
          updates.map((update) => (
            <div key={update.id} className='update-card'>
              <p><strong>{update.user_name}</strong></p>
              <p>{update.update_text}</p>
              <span>Hours: {update.hours_spent}</span>
              <span style={{ marginLeft: '12px' }}>
                Progress: {update.progress_percentage}%
              </span>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                {new Date(update.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TaskDetails