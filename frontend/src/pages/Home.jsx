import { Link } from 'react-router-dom'

import '../styles/Home.css'


function Home() {

  return (

    <div className='home-container'>

      <div className='overlay'>

        <div className='hero-section'>

          <h1>
            Task Management System
          </h1>

          <p>
            Manage tasks, collaborate with teams,
            track productivity and monitor work
            progress efficiently.
          </p>

          <div className='home-buttons'>

            <Link to='/login'>

              <button className='login-btn'>

                Login

              </button>

            </Link>

            <Link to='/register'>

              <button className='register-btn'>

                Create Account

              </button>

            </Link>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Home