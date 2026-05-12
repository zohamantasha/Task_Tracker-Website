import { useEffect, useState } from 'react'
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
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await API.get('tasks/')
      setTasks(response.data.results || response.data || [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('analytics/dashboard/')
      setAnalytics(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length

  const pieData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Pending', value: pendingTasks }
  ]

  if (loading) return <h2>Loading...</h2>

  return (
    <div className='dashboard-container'>
      <Sidebar />
      <div className='main-content'>
        <Navbar />
        <div className='dashboard-content'>
          <h2>Admin Dashboard</h2>

          {/* Summary Stats */}
          <div className='stats-grid'>
            <div className='stat-card'>
              <h3>Total Tasks</h3>
              <p>{tasks.length}</p>
            </div>
            <div className='stat-card'>
              <h3>Completed</h3>
              <p>{completedTasks}</p>
            </div>
            <div className='stat-card'>
              <h3>Pending</h3>
              <p>{pendingTasks}</p>
            </div>
            <div className='stat-card'>
              <h3>Total Users</h3>
              <p>{analytics?.total_users || 0}</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div style={{ width: '100%', height: '300px', marginTop: '30px' }}>
            <h3>Task Overview</h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey='value' outerRadius={100} label>
                  <Cell fill='#22c55e' />
                  <Cell fill='#ef4444' />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Per User Bar Chart */}
          {analytics?.per_user?.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3>Per User Task Status</h3>
              <ResponsiveContainer width='100%' height={300}>
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

              {/* Per User Detail Cards */}
              <div style={{ marginTop: '20px' }}>
                <h3>User Details</h3>
                {analytics.per_user.map(u => (
                  <div key={u.username} style={{
                    display: 'flex', gap: '20px', alignItems: 'center',
                    padding: '12px 16px', marginBottom: '10px',
                    border: '1px solid #e5e7eb', borderRadius: '8px',
                    background: 'white'
                  }}>
                    <strong style={{ minWidth: '120px' }}>{u.username}</strong>
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

          {/* Task List */}
          <div className='task-list' style={{ marginTop: '30px' }}>
            <h3>All Tasks</h3>
            {tasks.map((task) => (
              <div key={task.id} className='task-card'>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Priority:</strong> {task.priority}</p>
                {task.assigned_to_names?.length > 0 && (
                  <p><strong>Assigned to:</strong> {task.assigned_to_names.join(', ')}</p>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminDashboard