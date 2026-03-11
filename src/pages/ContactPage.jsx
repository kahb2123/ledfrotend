import React, { useState } from 'react'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane } from 'react-icons/fa'
import styles from './ContactPage.module.css'
import api from '../services/api'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitStatus(null)

    try {
      // Send contact form data to backend
      await api.submitContactForm(formData)
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.contactPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Contact Us</h1>
          <p className={styles.heroSubtitle}>
            Get in touch with us for any inquiries or assistance
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className={styles.infoSection}>
        <div className="container">
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <FaMapMarkerAlt className={styles.infoIcon} />
              <h3>Visit Us</h3>
              <p>AA 22 Golagol</p>
              <p>Addis Ababa, Ethiopia</p>
            </div>

            <div className={styles.infoCard}>
              <FaPhone className={styles.infoIcon} />
              <h3>Call Us</h3>
              <p>+251 911 234 567</p>
              <p>+251 911 234 568</p>
            </div>

            <div className={styles.infoCard}>
              <FaEnvelope className={styles.infoIcon} />
              <h3>Email Us</h3>
              <p>info@ledrental.et</p>
              <p>support@ledrental.et</p>
            </div>

            <div className={styles.infoCard}>
              <FaClock className={styles.infoIcon} />
              <h3>Working Hours</h3>
              <p>Mon - Fri: 8:00 - 18:00</p>
              <p>Sat: 9:00 - 15:00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map and Form Section */}
      <section className={styles.contactSection}>
        <div className="container">
          <div className={styles.contactGrid}>
            {/* Map */}
            <div className={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.793345112014!2d38.75795531478434!3d8.98069379357076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85f7b8b3b3b3%3A0x3b3b3b3b3b3b3b3b!2sAddis%20Ababa!5e0!3m2!1sen!2set!4v1620000000000!5m2!1sen!2set"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Location Map"
                className={styles.map}
              ></iframe>
            </div>

            {/* Contact Form */}
            <div className={styles.formContainer}>
              <h2 className={styles.formTitle}>Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className={styles.successMessage}>
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className={styles.errorMessage}>
                  Failed to send message. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Enter message subject"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : (
                    <>
                      <FaPaperPlane /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className="container">
          <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
          
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>What areas do you serve?</h3>
              <p>We serve all areas in Addis Ababa and major cities across Ethiopia.</p>
            </div>

            <div className={styles.faqItem}>
              <h3>Do you provide installation services?</h3>
              <p>Yes, we provide professional installation services for all our LED screens.</p>
            </div>

            <div className={styles.faqItem}>
              <h3>What is the minimum rental period?</h3>
              <p>The minimum rental period is 1 day for all LED screens.</p>
            </div>

            <div className={styles.faqItem}>
              <h3>Do you offer technical support during events?</h3>
              <p>Yes, we provide on-site technical support throughout your event.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage