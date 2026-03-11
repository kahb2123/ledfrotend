import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUser, SignInButton, UserButton, useAuth } from '@clerk/clerk-react'
import { FaBars, FaTimes } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import styles from './Header.module.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const { isSignedIn, user } = useUser()
  const { getToken } = useAuth() // Use useAuth hook to get token
  const location = useLocation()
  const { t } = useTranslation()

  // Fetch user role when signed in
  useEffect(() => {
    const fetchUserRole = async () => {
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
          console.log('User role from API:', data.role)
          setUserRole(data.role)
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      }
    }

    fetchUserRole()
  }, [isSignedIn, getToken])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Build navigation links based on user role
  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/services', label: t('nav.services') },
    { path: '/contact', label: t('nav.contact') },
  ]

  // Add role-specific links
  if (isSignedIn) {
    if (userRole === 'admin') {
      navLinks.push({ path: '/admin', label: 'Admin Dashboard' })
    } else if (userRole === 'staff') {
      navLinks.push({ path: '/staff', label: 'Staff Dashboard' })
    } else {
      navLinks.push({ path: '/dashboard', label: t('nav.dashboard') })
    }
    
    navLinks.push({ path: '/order', label: t('nav.order') })
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          LED Screen Rental
        </Link>

        <button className={styles.menuButton} onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.navLink} ${
                location.pathname === link.path || location.pathname.startsWith(link.path + '/') ? styles.active : ''
              }`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}

          <LanguageSwitcher />

          <div className={styles.userSection}>
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className={`btn btn-primary ${styles.loginBtn}`}>
                  {t('nav.signIn')}
                </button>
              </SignInButton>
            ) : (
              <div className={styles.userInfo}>
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: styles.userAvatar
                    }
                  }}
                  afterSignOutUrl="/"
                />
                <span className={styles.userName}>
                  {user?.firstName || user?.emailAddresses[0].emailAddress}
                </span>
                {userRole === 'admin' && (
                  <span className={styles.adminBadge}>Admin</span>
                )}
                {userRole === 'staff' && (
                  <span className={styles.staffBadge}>Staff</span>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header