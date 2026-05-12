import { useState } from 'react'

import {
  Link,
  useNavigate
} from 'react-router-dom'

import API from '../api/axios'

import '../styles/Register.css'


function Register() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({

    username: '',

    email: '',

    password: '',

    role: 'user'
  })

  const [error, setError] =
    useState('')

  const [loading, setLoading] =
    useState(false)


  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value
    })

    setError('')
  }


  const handleSubmit =
    async (e) => {

      e.preventDefault()

      setLoading(true)

      setError('')

      try {

        await API.post(

          'auth/register/',

          formData
        )

        alert(
          `${formData.role.toUpperCase()} Registered Successfully`
        )

        navigate('/login')

      } catch (error) {

        const backendError =

          error.response?.data?.error ||

          error.response?.data?.detail ||

          ''

        if (

          backendError.includes(
            'already'
          )

        ) {

          alert(
            'Already Registered'
          )

          setError(
            'Already Registered'
          )

        } else {

          const errorMessage =

            error.response?.data?.username?.[0] ||

            error.response?.data?.email?.[0] ||

            error.response?.data?.password?.[0] ||

            'Registration failed. Please try again.'

          alert(errorMessage)

          setError(errorMessage)
        }

      } finally {

        setLoading(false)
      }
    }


  return (

    <div className='register-container'>

      <div className='register-box'>

        <h1 className='register-title'>

          Create Account

        </h1>

        {

          error && (

            <div className='error-message'>

              {error}

            </div>
          )
        }

        <form

          className='register-form'

          onSubmit={handleSubmit}
        >

          <input

            type='text'

            name='username'

            placeholder='Username'

            value={formData.username}

            onChange={handleChange}

            required

            disabled={loading}

            minLength={3}
          />

          <input

            type='email'

            name='email'

            placeholder='Email'

            value={formData.email}

            onChange={handleChange}

            required

            disabled={loading}
          />

          <input

            type='password'

            name='password'

            placeholder='Password'

            value={formData.password}

            onChange={handleChange}

            required

            minLength={8}

            disabled={loading}
          />

          <select

            name='role'

            value={formData.role}

            onChange={handleChange}

            disabled={loading}
          >

            <option value='user'>

              Register as User

            </option>

            <option value='admin'>

              Register as Admin

            </option>

          </select>

          <button

            type='submit'

            disabled={loading}
          >

            {

              loading

                ? 'Registering...'

                : 'Register'
            }

          </button>

        </form>

        <div className='register-footer'>

          Already have an account?{' '}

          <Link to='/login'>

            Login

          </Link>

        </div>

      </div>

    </div>
  )
}

export default Register