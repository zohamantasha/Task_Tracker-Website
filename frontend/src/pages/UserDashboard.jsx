import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import API from '../api/axios'
import '../styles/Dashboard.css'

function UserDashboard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const currentUser = localStorage.getItem('username')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const response = await API.get('tasks/')
      setTasks(response.data.results || response.data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const markCompleted = async (taskId) => {
    try {
      setUpdating(taskId)
      await API.post(`tasks/${taskId}/add-update/`, {
        update_text: 'Marked as completed by ' + currentUser,
        hours_spent: 0,
        progress_percentage: 100
      })
      // Refresh tasks immediately after marking complete
      await fetchTasks()
    } catch (error) {
      console.error('Error marking task completed:', error)
      alert('Failed to mark task as completed')
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#3b82f6',
      in_progress: '#f59e0b',
      completed: '#10b981'
    }
    return colors[status] || '#6b7280'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444'
    }
    return colors[priority] || '#6b7280'
  }

  // Calculate stats for current user only
  const myCompleted = tasks.filter(t => {
    // Check if current user has submitted 100% progress
    return t.status === 'completed'
  }).length
  const myPending = tasks.filter(t => t.status === 'pending').length
  const myInProgress = tasks.filter(t => t.status === 'in_progress').length

  if (loading) return (
    <div className='dashboard-container'>
      <Sidebar />
      <div className='main-content'>
        <Navbar />
        <h2 style={{ padding: '2rem' }}>Loading...</h2>
      </div>
    </div>
  )

  return (
    <div className='dashboard-container'>
      <Sidebar />
      <div className='main-content'>
        <Navbar />
        <div className='dashboard-content'>
          <div className='dashboard-header'>
            <div>
              <h1 className='dashboard-title'>My Dashboard</h1>
              <p className='dashboard-subtitle'>Welcome, {currentUser}</p>
            </div>
            <button className='refresh-btn' onClick={fetchTasks} disabled={loading}>
              🔄 Refresh
            </button>
          </div>

          {/* Stats */}
          <div className='stats-grid'>
            <div className='stat-card total'>
              <div className='stat-icon'>📊</div>
              <h3>Total Tasks</h3>
              <div className='stat-number'>{tasks.length}</div>
            </div>
            <div className='stat-card completed'>
              <div className='stat-icon'>✅</div>
              <h3>Completed</h3>
              <div className='stat-number'>{myCompleted}</div>
              <div className='stat-progress'>
                <div
                  className='progress-bar'
                  style={{
                    width: tasks.length
                      ? `${(myCompleted / tasks.length) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
            <div className='stat-card'>
              <div className='stat-icon'>🔄</div>
              <h3>In Progress</h3>
              <div className='stat-number'>{myInProgress}</div>
            </div>
            <div className='stat-card pending'>
              <div className='stat-icon'>⏳</div>
              <h3>Pending</h3>
              <div className='stat-number'>{myPending}</div>
            </div>
          </div>

          {/* Task List */}
          <div className='tasks-section'>
            <div className='section-header'>
              <h2>My Tasks</h2>
              <span className='task-count'>{tasks.length} tasks</span>
            </div>

            <div className='task-list'>
              {tasks.length === 0 ? (
                <div className='empty-state'>
                  <div className='empty-icon'>📭</div>
                  <h3>No tasks assigned yet</h3>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-card priority-${task.priority}`}
                  >
                    <div className='task-header'>
                      <div
                        className='task-priority-badge'
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {task.priority?.toUpperCase()}
                      </div>
                      <div
                        className='task-status-badge'
                        style={{ borderColor: getStatusColor(task.status) }}
                      >
                        {task.status?.replace('_', ' ')}
                      </div>
                    </div>

                    <h3 className='task-title'>{task.title}</h3>
                    <p className='task-description'>{task.description}</p>

                    {task.assigned_to_names?.length > 0 && (
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>
                        👥 {task.assigned_to_names.join(', ')}
                      </p>
                    )}

                    {task.due_date && (
                      <div className='task-date'>
                        📅 {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <Link to={`/task/${task.id}`}>
                        <button className='btn-view'>View & Update</button>
                      </Link>
                      <Link to={`/chat/${task.id}`}>
                        <button className='btn-chat'>💬 Chat</button>
                      </Link>
                      {task.status !== 'completed' && (
                        <button
                          className='complete-btn'
                          onClick={() => markCompleted(task.id)}
                          disabled={updating === task.id}
                        >
                          {updating === task.id ? 'Updating...' : '✅ Mark Complete'}
                        </button>
                      )}
                      {task.status === 'completed' && (
                        <span style={{
                          color: '#10b981', fontWeight: '600',
                          padding: '6px 12px', fontSize: '14px'
                        }}>
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard