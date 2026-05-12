import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'
import '../styles/Tasks.css'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const role = localStorage.getItem('role')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await API.get('tasks/')
      setTasks(response.data.results || response.data || [])
    } catch (error) {
      console.log(error)
    }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await API.delete(`tasks/${taskId}/delete/`)
      fetchTasks()
    } catch (error) {
      alert('Failed to delete task')
    }
  }

  const getStatusClass = (status) => {
    if (status === 'completed') return 'task-status completed'
    if (status === 'in_progress') return 'task-status in-progress'
    return 'task-status pending'
  }

  const getPriorityClass = (priority) => {
    if (priority === 'high') return 'task-priority high'
    if (priority === 'medium') return 'task-priority medium'
    return 'task-priority low'
  }

  return (
    <div className='tasks-container'>
      <div className='tasks-header'>
        <h2>Tasks</h2>
        {role === 'admin' && (
          <Link to='/create-task'>
            <button className='create-btn'>+ Create Task</button>
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className='empty-tasks'>
          <h3>No Tasks Found</h3>
        </div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className='task-card'>
            <h3>{task.title}</h3>
            <p>{task.description}</p>

            {task.assigned_to_names?.length > 0 && (
              <p className='assigned-users'>
                Assigned to: {task.assigned_to_names.join(', ')}
              </p>
            )}

            {task.due_date && (
              <p className='due-date'>Due: {new Date(task.due_date).toLocaleDateString()}</p>
            )}

            <div className='task-meta'>
              <span className={getStatusClass(task.status)}>
                {task.status?.replace('_', ' ')}
              </span>
              <span className={getPriorityClass(task.priority)}>
                {task.priority}
              </span>
            </div>

            <div className='task-buttons'>
              <Link to={`/task/${task.id}`}>
                <button className='btn-view'>View</button>
              </Link>

              <Link to={`/chat/${task.id}`}>
                <button className='btn-chat'>Chat</button>
              </Link>

              {role === 'admin' && (
                <>
                  <Link to={`/edit-task/${task.id}`}>
                    <button className='btn-edit'>Edit</button>
                  </Link>
                  <button
                    className='btn-delete'
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Tasks