import {

  BrowserRouter,
  Routes,
  Route

} from 'react-router-dom'

import Login from './pages/Login'

import Register from './pages/Register'

import AdminDashboard from './pages/AdminDashboard'

import UserDashboard from './pages/UserDashboard'

import CreateTask from './pages/CreateTask'

import TaskDetails from './pages/TaskDetails'
import EditTask from './pages/EditTask'
import ChatPage from './pages/ChatPage'

import Tasks from './pages/Tasks'
function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route

          path='/'

          element={<Login />}
        />

        <Route

          path='/login'

          element={<Login />}
        />

        <Route

          path='/register'

          element={<Register />}
        />

        <Route

          path='/admin'

          element={<AdminDashboard />}
        />

        <Route

          path='/user-dashboard'

          element={<UserDashboard />}
        />
         
         <Route

          path='/user'

          element={<UserDashboard />}
        />

         <Route

          path='/tasks'

          element={<Tasks />}
        />
        <Route

          path='/create-task'

          element={<CreateTask />}
        />
         
        <Route

          path='/task/:id'

          element={<TaskDetails />}
        />
        <Route path='/edit-task/:taskId' element={<EditTask />} />
        <Route

          path='/chat/:id'

          element={<ChatPage />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App