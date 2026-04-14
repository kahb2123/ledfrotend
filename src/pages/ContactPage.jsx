import React, { useState } from 'react'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane, FaUser, FaTag, FaCommentDots, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
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
  const [focusedField, setFocusedField] = useState(null)

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
      await api.submitContactForm(formData)
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch {
      setSubmitStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.contactPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Get In Touch</span>
            <h1 className={styles.heroTitle}>Contact Us</h1>
            <p className={styles.heroSubtitle}>
              Have questions about our LED screen rental services? We are here to help you create an unforgettable event experience.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className={styles.infoSection}>
        <div className="container">
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoIconWrapper}>
                <FaMapMarkerAlt className={styles.infoIcon} />
              </div>
              <h3>Visit Us</h3>
              <p>AA 22 Golagol</p>
              <p>Addis Ababa, Ethiopia</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrapper}>
                <FaPhone className={styles.infoIcon} />
              </div>
              <h3>Call Us</h3>
              <p><a href="tel:+251911234567">+251 911 234 567</a></p>
              <p><a href="tel:+251911234568">+251 911 234 568</a></p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrapper}>
                <FaEnvelope className={styles.infoIcon} />
              </div>
              <h3>Email Us</h3>
              <p><a href="mailto:info@ledrental.et">info@ledrental.et</a></p>
              <p><a href="mailto:support@ledrental.et">support@ledrental.et</a></p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrapper}>
                <FaClock className={styles.infoIcon} />
              </div>
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
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Send us a Message</h2>
            <p className={styles.sectionSubtitle}>Fill out the form below and we will get back to you within 24 hours</p>
          </div>
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
              {submitStatus === 'success' && (
                <div className={styles.successMessage}>
                  <FaCheckCircle className={styles.statusIcon} />
                  <div>
                    <strong>Message sent successfully!</strong>
                    <p>We will get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className={styles.errorMessage}>
                  <FaTimesCircle className={styles.statusIcon} />
                  <div>
                    <strong>Failed to send message.</strong>
                    <p>Please try again or contact us directly.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${focusedField === 'name' ? styles.focused : ''} ${formData.name ? styles.filled : ''}`}>
                    <label htmlFor="name" className={styles.label}>
                      <FaUser className={styles.labelIcon} /> Full Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                      placeholder="Enter your full name"
                      className={styles.input}
                    />
                  </div>

                  <div className={`${styles.formGroup} ${focusedField === 'email' ? styles.focused : ''} ${formData.email ? styles.filled : ''}`}>
                    <label htmlFor="email" className={styles.label}>
                      <FaEnvelope className={styles.labelIcon} /> Email Address <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      placeholder="Enter your email"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${focusedField === 'phone' ? styles.focused : ''} ${formData.phone ? styles.filled : ''}`}>
                    <label htmlFor="phone" className={styles.label}>
                      <FaPhone className={styles.labelIcon} /> Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your phone number"
                      className={styles.input}
                    />
                  </div>

                  <div className={`${styles.formGroup} ${focusedField === 'subject' ? styles.focused : ''} ${formData.subject ? styles.filled : ''}`}>
                    <label htmlFor="subject" className={styles.label}>
                      <FaTag className={styles.labelIcon} /> Subject <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField(null)}
                      required
                      placeholder="Enter message subject"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={`${styles.formGroup} ${focusedField === 'message' ? styles.focused : ''} ${formData.message ? styles.filled : ''}`}>
                  <label htmlFor="message" className={styles.label}>
                    <FaCommentDots className={styles.labelIcon} /> Message <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    rows="5"
                    placeholder="Tell us about your event or inquiry..."
                    className={styles.textarea}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className={styles.submittingContent}>
                      <span className={styles.spinner}></span>
                      Sending...
                    </span>
                  ) : (
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
          <div className={styles.sectionHeader}>
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionSubtitle}>Find answers to common questions about our services</p>
          </div>

          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <div className={styles.faqNumber}>01</div>
              <div className={styles.faqContent}>
                <h3>What areas do you serve?</h3>
                <p>We serve all areas in Addis Ababa and major cities across Ethiopia. Contact us for availability in your area.</p>
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqNumber}>02</div>
              <div className={styles.faqContent}>
                <h3>Do you provide installation services?</h3>
                <p>Yes, we provide professional installation and teardown services for all our LED screens at no extra cost.</p>
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqNumber}>03</div>
              <div className={styles.faqContent}>
                <h3>What is the minimum rental period?</h3>
                <p>The minimum rental period is 1 day for all LED screens. We also offer multi-day and weekly packages at discounted rates.</p>
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqNumber}>04</div>
              <div className={styles.faqContent}>
                <h3>Do you offer technical support during events?</h3>
                <p>Yes, we provide on-site technical support throughout your event to ensure everything runs smoothly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage
