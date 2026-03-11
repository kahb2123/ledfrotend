import React from 'react'
import { Link } from 'react-router-dom'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaTelegram, FaYoutube } from 'react-icons/fa'
import styles from './Footer.module.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>About Us</h3>
            <p className={styles.footerText}>
              Leading LED screen rental and fixed installation company in Ethiopia. 
              Serving private and governmental organizations with premium display solutions.
            </p>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Quick Links</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/order">Order Now</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Our Services</h3>
            <ul className={styles.footerLinks}>
              <li>P2 Indoor LED</li>
              <li>P3 Indoor LED</li>
              <li>P4 Indoor LED</li>
              <li>P5 Outdoor LED</li>
              <li>P10 Outdoor LED</li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Contact Info</h3>
            <div className={styles.contactInfo}>
              <p><FaMapMarkerAlt /> AA 22 Golagol, Addis Ababa</p>
              <p><FaPhone /> +251 911 234 567</p>
              <p><FaEnvelope /> info@ledrental.et</p>
            </div>
            <div className={styles.socialLinks}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer">
                <FaTelegram />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; {currentYear} LED Screen Rental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer