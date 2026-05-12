import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import API from '../api/axios'
import "../styles/Dashboard.css"; // Updated CSS import

function UserDashboard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await API.get('tasks/')
      setTasks(response.data.results || response.data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const markCompleted = async (taskId) => {
  try {
    setStatsLoading(true)
    await API.post(`tasks/${taskId}/add-update/`, {
      update_text: 'Marked as completed',
      hours_spent: 0,
      progress_percentage: 100
    })
    fetchTasks()
  } catch (error) {
    console.error('Error marking task completed:', error)
  } finally {
    setStatsLoading(false)
  }
}

  const getStatusColor = (status) => {
    const colors = {
      todo: '#3b82f6',
      'in_progress': '#f59e0b',
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

  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const pendingTasks = tasks.filter(task => task.status !== 'completed').length
  const totalTasks = tasks.length

  if (loading) {
    return (
      <div className='dashboard-container'>
        <Sidebar />
        <div className='main-content'>
          <Navbar />
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <h3>Loading dashboard...</h3>
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
        <div className='dashboard-content'>
          <div className='dashboard-header'>
            <div>
              <h1 className='dashboard-title'>Dashboard</h1>
              <p className='dashboard-subtitle'>Manage your tasks efficiently</p>
            </div>
            <button className='refresh-btn' onClick={fetchTasks} disabled={loading}>
              🔄 Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className='stats-grid'>
            <div className='stat-card total'>
              <div className='stat-icon'>📊</div>
              <h3>Total Tasks</h3>
              <div className='stat-number'>{totalTasks}</div>
            </div>
            <div className='stat-card completed'>
              <div className='stat-icon'>✅</div>
              <h3>Completed</h3>
              <div className='stat-number'>{completedTasks}</div>
              <div className='stat-progress'>
                <div 
                  className='progress-bar'
                  style={{ width: totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
            <div className='stat-card pending'>
              <div className='stat-icon'>⏳</div>
              <h3>Pending</h3>
              <div className='stat-number'>{pendingTasks}</div>
            </div>
          </div>

          {/* Tasks List */}
          <div className='tasks-section'>
            <div className='section-header'>
              <h2>Recent Tasks</h2>
              <span className='task-count'>{tasks.length} tasks</span>
            </div>
            <div className='task-list'>
              {tasks.map((task) => (
                <div key={task.id} className={`task-card priority-${task.priority}`}>
                  <div className='task-header'>
                    <div className='task-priority-badge' style={{ backgroundColor: getPriorityColor(task.priority) }}>
                      {task.priority?.toUpperCase()}
                    </div>
                    <div className={`task-status-badge status-${task.status}`} style={{ borderColor: getStatusColor(task.status) }}>
                      {task.status?.replace('_', ' ')}
                    </div>
                  </div>
                  <h3 className='task-title'>{task.title}</h3>
                  <p className='task-description'>{task.description}</p>
                  {task.due_date && (
                    <div className='task-date'>
                      📅 {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                  {task.status !== 'completed' && (
                    <button
                      className='complete-btn'
                      onClick={() => markCompleted(task.id)}
                      disabled={statsLoading}
                    >
                      {statsLoading ? (
                        <>
                          <span className='btn-spinner'></span>
                          Updating...
                        </>
                      ) : (
                        '✅ Mark Completed'
                      )}
                    </button>
                  )}
                </div>
              ))}
              {tasks.length === 0 && (
                <div className='empty-state'>
                  <div className='empty-icon'>📭</div>
                  <h3>No tasks yet</h3>
                  <p>Get started by creating your first task!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard