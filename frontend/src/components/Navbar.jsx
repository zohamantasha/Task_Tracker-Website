import '../styles/Navbar.css'

function Navbar() {

  const role = localStorage.getItem(
    'role'
  )

  return (

    <div className='navbar'>

      <div>

        {

          role === 'admin' ? (

            <h2>
              Welcome Admin 👨‍💼
            </h2>

          ) : (

            <h2>
              Welcome User 👨‍💻
            </h2>
          )
        }

      </div>

      <button
        onClick={() => {

          localStorage.clear()

          window.location.href = '/login'
        }}
      >

        Logout

      </button>

    </div>
  )
}

export default Navbar