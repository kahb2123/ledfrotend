import React, { useEffect } from 'react'
import { SignIn, SignUp, useUser, useAuth } from '@clerk/clerk-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import styles from './LoginPage.module.css'

const LoginPage = () => {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'signin'
  const { isSignedIn, user } = useUser()
  const { getToken } = useAuth() // Use useAuth hook
  const navigate = useNavigate()

  // Check user role after sign in and redirect accordingly
  useEffect(() => {
    const checkUserRole = async () => {
      if (isSignedIn) {
        try {
          // Use getToken() from useAuth hook
          const token = await getToken()
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          const data = await response.json()
          console.log('User role:', data.role)
          
          // Redirect based on role
          if (data.role === 'admin') {
            navigate('/admin')
          } else if (data.role === 'staff') {
            navigate('/staff')
          } else {
            navigate('/dashboard')
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
          navigate('/dashboard') // Default fallback
        }
      }
    }

    checkUserRole()
  }, [isSignedIn, navigate, getToken])

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <h1 className={styles.title}>Welcome to LED Screen Rental</h1>
          <p className={styles.subtitle}>
            Your trusted partner for premium LED screen solutions in Ethiopia
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>✓</div>
              <div>
                <h3>Easy Booking</h3>
                <p>Simple and fast online ordering</p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>✓</div>
              <div>
                <h3>Track Orders</h3>
                <p>Real-time order status updates</p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>✓</div>
              <div>
                <h3>24/7 Support</h3>
                <p>Dedicated customer support</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
              <p>
                {mode === 'signin' 
                  ? 'Welcome back! Please sign in to continue' 
                  : 'Join us to start ordering LED screens'}
              </p>
            </div>

            {mode === 'signin' ? (
              <SignIn 
                routing="path" 
                path="/login"
                signUpUrl="/login?mode=signup"
              />
            ) : (
              <SignUp 
                routing="path" 
                path="/login"
                signInUrl="/login?mode=signin"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage