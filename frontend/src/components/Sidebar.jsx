import { Link } from 'react-router-dom'

import '../styles/Sidebar.css'


function Sidebar() {

  const role = localStorage.getItem(
    'role'
  )

  return (

    <div className='sidebar'>

      <h2>
        Task Tracker
      </h2>

      <ul>

        <li>

          <Link
            to={
              role === 'admin'
              ? '/admin-dashboard'
              : '/user-dashboard'
            }
          >

            Dashboard

          </Link>

        </li>

        <li>

          <Link to='/tasks'>

            Tasks

          </Link>

        </li>

        {

          role === 'admin' && (

            <li>

              <Link to='/create-task'>

                Create Task

              </Link>

            </li>
          )
        }

      </ul>

    </div>
  )
}

export default Sidebar