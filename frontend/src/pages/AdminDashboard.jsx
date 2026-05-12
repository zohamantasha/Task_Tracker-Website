import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import API from '../api/axios'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Legend
} from 'recharts'
import '../styles/Dashboard.css'

function AdminDashboard() {
  const [tasks, setTasks] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
    fetchAnalytics()
    const interval = setInterval(() => {
      fetchTasks()
      fetchAnalytics()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await API.get('tasks/')
      setTasks(response.data.results || response.data || [])
    } catch (error) {
      console.error('Tasks error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('analytics/dashboard/')
      setAnalytics(res.data)
    } catch (err) {
      console.error('Analytics error:', err)
    }
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length

  const pieData = [
    { name: 'Completed', value: completedTasks },
    { name: 'In Progress', value: inProgressTasks },
    { name: 'Pending', value: pendingTasks }
  ]

  if (loading) {
    return (
      <div className='dashboard-container'>
        <Sidebar />
        <div className='main-content'>
          <Navbar />
          <h2 style={{ padding: '2rem' }}>Loading...</h2>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
            <button
              onClick={() => { fetchTasks(); fetchAnalytics() }}
              style={{
                background: '#6366f1', color: 'white', border: 'none',
                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px', fontWeight: '500'
              }}
            >
              Refresh
            </button>
          </div>

          <div className='stats-grid'>
            <div className='stat-card'>
              <h3>Total Tasks</h3>
              <p>{tasks.length}</p>
            </div>
            <div className='stat-card'>
              <h3>Completed</h3>
              <p style={{ color: '#22c55e' }}>{completedTasks}</p>
            </div>
            <div className='stat-card'>
              <h3>In Progress</h3>
              <p style={{ color: '#f59e0b' }}>{inProgressTasks}</p>
            </div>
            <div className='stat-card'>
              <h3>Pending</h3>
              <p style={{ color: '#ef4444' }}>{pendingTasks}</p>
            </div>
            <div className='stat-card'>
              <h3>Total Users</h3>
              <p>{analytics?.total_users || 0}</p>
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3>Task Overview</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie data={pieData} dataKey='value' outerRadius={100} label>
                    <Cell fill='#22c55e' />
                    <Cell fill='#f59e0b' />
                    <Cell fill='#ef4444' />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {analytics?.per_user?.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3>Per User Task Status</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={analytics.per_user}>
                    <XAxis dataKey='username' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='completed' fill='#22c55e' name='Completed' />
                    <Bar dataKey='in_progress' fill='#f59e0b' name='In Progress' />
                    <Bar dataKey='pending' fill='#ef4444' name='Pending' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: '20px' }}>
                <h3>User Details</h3>
                {analytics.per_user.map(u => (
                  <div key={u.username} style={{
                    display: 'flex', gap: '16px', flexWrap: 'wrap',
                    alignItems: 'center', padding: '12px 16px',
                    marginBottom: '10px', border: '1px solid #e5e7eb',
                    borderRadius: '8px', background: 'white'
                  }}>
                    <strong style={{ minWidth: '100px' }}>{u.username}</strong>
                    <span>Tasks: <b>{u.total_tasks}</b></span>
                    <span style={{ color: '#22c55e' }}>Completed: <b>{u.completed}</b></span>
                    <span style={{ color: '#f59e0b' }}>In Progress: <b>{u.in_progress}</b></span>
                    <span style={{ color: '#ef4444' }}>Pending: <b>{u.pending}</b></span>
                    <span style={{ color: '#3b82f6' }}>Hours: <b>{u.hours_spent}</b></span>
                    <span>Avg Progress: <b>{u.avg_progress}%</b></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3>All Tasks</h3>
              <Link to='/create-task'>
                <button style={{
                  background: '#3b82f6', color: 'white', border: 'none',
                  padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '500'
                }}>
                  + Create Task
                </button>
              </Link>
            </div>

            {tasks.length === 0 ? (
              <p style={{ color: '#6b7280', marginTop: '10px' }}>
                No tasks yet. Create your first task!
              </p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className='task-card' style={{ marginTop: '10px' }}>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <p><strong>Status:</strong> {task.status?.replace('_', ' ')}</p>
                  <p><strong>Priority:</strong> {task.priority}</p>
                  <p><strong>Due:</strong> {task.due_date}</p>

                  {task.user_progress?.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <strong>User Progress:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                        {task.user_progress.map(u => (
                          <div key={u.username} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '4px 10px', borderRadius: '20px', fontSize: '13px',
                            background: u.status === 'completed' ? '#d1fae5' :
                                        u.status === 'in_progress' ? '#fef3c7' : '#fee2e2',
                            color: u.status === 'completed' ? '#065f46' :
                                   u.status === 'in_progress' ? '#92400e' : '#991b1b',
                            border: `1px solid ${
                              u.status === 'completed' ? '#6ee7b7' :
                              u.status === 'in_progress' ? '#fcd34d' : '#fca5a5'
                            }`
                          }}>
                            <span>
                              {u.status === 'completed' ? '✓' :
                               u.status === 'in_progress' ? '⏳' : '○'}
                            </span>
                            <strong>{u.username}</strong>
                            <span>{u.progress}%</span>
                            {u.hours > 0 && <span>· {u.hours}h</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <Link to={`/task/${task.id}`}>
                      <button className='btn-view'>View</button>
                    </Link>
                    <Link to={`/chat/${task.id}`}>
                      <button className='btn-chat'>Chat</button>
                    </Link>
                    <Link to={`/edit-task/${task.id}`}>
                      <button className='btn-edit'>Edit</button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminDashboard