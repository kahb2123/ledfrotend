import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'
import './App.css'

// Import pages
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import OrderPage from './pages/OrderPage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import StaffDashboardPage from './pages/StaffDashboardPage'
import NotFoundPage from './pages/NotFoundPage'

// Import components
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import LoadingSpinner from './components/common/LoadingSpinner'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Protected route component - FIXED VERSION
const ProtectedRoute = ({ children, allowedRoles = ['customer', 'staff', 'admin'] }) => {
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isLoaded, isSignedIn, getToken } = useAuth()

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!isLoaded || !isSignedIn) {
        setLoading(false)
        return
      }

      try {
        const token = await getToken()
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch user role')
        }
        
        const data = await response.json()
        setUserRole(data.role)
      } catch {
        setUserRole(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [isLoaded, isSignedIn, getToken])

  // Show loading while checking
  if (loading || !isLoaded) {
    return <LoadingSpinner />
  }

  // If not signed in, redirect to login
  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  // Check role permissions
  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="unauthorized">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <a href="/" className="btn btn-primary">Go Home</a>
      </div>
    )
  }

  return children
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes - require sign in */}
              <Route
                path="/order"
                element={
                  <SignedIn>
                    <OrderPage />
                  </SignedIn>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <SignedIn>
                    <DashboardPage />
                  </SignedIn>
                }
              />
              
              {/* Admin routes - FIXED */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Staff routes */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowedRoles={['staff', 'admin']}>
                    <StaffDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/*"
                element={
                  <ProtectedRoute allowedRoles={['staff', 'admin']}>
                    <StaffDashboardPage />
                  </ProtectedRoute>
                }
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ClerkProvider>
  )
}

export default App