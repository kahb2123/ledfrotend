import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome } from 'react-icons/fa'
import styles from './NotFoundPage.module.css'

const NotFoundPage = () => {
  return (
    <div className={styles.notFound}>
      <div className="container">
        <div className={styles.content}>
          <h1 className={styles.errorCode}>404</h1>
          <h2 className={styles.title}>Page Not Found</h2>
          <p className={styles.message}>
            The page you are looking for might have been removed, 
            had its name changed, or is temporarily unavailable.
          </p>
          <Link to="/" className="btn btn-primary">
            <FaHome /> Go Back Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage