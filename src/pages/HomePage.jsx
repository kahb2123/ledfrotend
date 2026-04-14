import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { 
  FaTv, FaTools, FaClock, FaUsers, FaAward, 
  FaPlay, FaChevronRight, FaStar, FaQuoteRight, 
  FaCalendar, FaMapMarkerAlt, FaArrowRight, FaCheck, 
  FaPhone, FaEnvelope
} from 'react-icons/fa'
import styles from './HomePage.module.css'
import VideoBackground from '../components/common/VideoBackground'
import api from '../services/api'

const HomePage = () => {
  const { t } = useTranslation()
  const { isSignedIn } = useUser()
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [ledScreens, setLedScreens] = useState([])
  const [installations, setInstallations] = useState([])
  const [loadingScreens, setLoadingScreens] = useState(true)
  const [loadingInstallations, setLoadingInstallations] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Fetch LED screens from backend (Services API)
  useEffect(() => {
    const fetchLedScreens = async () => {
      try {
        setLoadingScreens(true)
        const data = await api.getServices()
        if (Array.isArray(data)) {
          setLedScreens(data)
        } else if (data?.services && Array.isArray(data.services)) {
          setLedScreens(data.services)
        } else {
          setLedScreens([])
        }
      } catch {
        setLedScreens([])
      } finally {
        setLoadingScreens(false)
      }
    }
    fetchLedScreens()
  }, [])

  // Fetch recent installations from backend (Media API)
  useEffect(() => {
    const fetchInstallations = async () => {
      try {
        setLoadingInstallations(true)
        const data = await api.getMedia({ category: 'installation', isPublic: 'true' })
        if (data?.media && Array.isArray(data.media)) {
          setInstallations(data.media)
        } else if (Array.isArray(data)) {
          setInstallations(data)
        } else {
          setInstallations([])
        }
      } catch {
        setInstallations([])
      } finally {
        setLoadingInstallations(false)
      }
    }
    fetchInstallations()
  }, [])

  const services = [
    {
      icon: <FaTv />,
      title: 'LED Screen Rental',
      description: 'Premium P2 to P10 LED screens for indoor and outdoor events',
      features: ['4K Ultra HD', 'Quick Installation', '24/7 Support'],
      color: '#FF6B6B'
    },
    {
      icon: <FaTools />,
      title: 'Fixed Installation',
      description: 'Permanent LED solutions for businesses and venues',
      features: ['Custom Design', 'Professional Setup', 'Maintenance'],
      color: '#4ECDC4'
    },
    {
      icon: <FaClock />,
      title: 'Event Support',
      description: 'On-site technical support throughout your event',
      features: ['Live Monitoring', 'Instant Support', 'Backup Systems'],
      color: '#FFD93D'
    },
    {
      icon: <FaUsers />,
      title: 'Consultation',
      description: 'Expert advice for the perfect LED solution',
      features: ['Free Consultation', 'Site Visit', 'Custom Quotes'],
      color: '#A8E6CF'
    }
  ]

  // Fallback data when no LED screens in the database yet
  const fallbackLEDs = [
    {
      type: 'P3',
      category: 'indoor',
      specifications: { brightness: '1500 nits', resolution: '1280x720' },
      pricePerDay: 2500,
      features: [{ en: 'HD Quality' }, { en: 'Energy Efficient' }, { en: 'Light Weight' }],
      images: [{ url: 'https://images.unsplash.com/photo-1580894901296-2b8f2a4e6282?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80' }],
      isAvailable: true
    },
    {
      type: 'P4',
      category: 'indoor',
      specifications: { brightness: '1800 nits', resolution: '960x540' },
      pricePerDay: 2000,
      features: [{ en: 'Cost Effective' }, { en: 'Easy Setup' }, { en: 'Versatile' }],
      images: [{ url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80' }],
      isAvailable: true
    },
    {
      type: 'P5',
      category: 'outdoor',
      specifications: { brightness: '5500 nits', resolution: '768x432' },
      pricePerDay: 3500,
      features: [{ en: 'Weatherproof' }, { en: 'Daylight Visible' }, { en: 'Durable' }],
      images: [{ url: 'https://images.unsplash.com/photo-1545156521-77bd85671d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80' }],
      isAvailable: true
    },
    {
      type: 'P10',
      category: 'outdoor',
      specifications: { brightness: '6500 nits', resolution: '384x216' },
      pricePerDay: 2800,
      features: [{ en: 'Large Format' }, { en: 'High Impact' }, { en: 'Cost Efficient' }],
      images: [{ url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80' }],
      isAvailable: true
    }
  ]

  // Fallback installations when none in the database yet
  const fallbackInstallations = [
    {
      title: { en: 'Millennium Hall Conference' },
      url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1112&q=80',
      description: { en: 'Addis Ababa' },
      createdAt: '2024-02-15'
    },
    {
      title: { en: 'Ethio Telecom Expo' },
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      description: { en: 'Addis Ababa' },
      createdAt: '2024-01-10'
    },
    {
      title: { en: 'Wedding Reception' },
      url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80',
      description: { en: 'Skylight Hotel' },
      createdAt: '2024-03-20'
    },
    {
      title: { en: 'New Year Concert' },
      url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      description: { en: 'Meskel Square' },
      createdAt: '2023-12-25'
    }
  ]

  // Use real data if available, fallback otherwise
  const displayLEDs = ledScreens.length > 0 ? ledScreens : fallbackLEDs
  const displayInstallations = installations.length > 0 ? installations : fallbackInstallations

  const testimonials = [
    {
      name: 'Abebe Kebede',
      role: 'Event Organizer',
      company: 'Ethio Events',
      content: 'The LED screen quality was exceptional. Our conference attendees were amazed by the crystal-clear display. The installation team was professional and efficient.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Tigist Haile',
      role: 'Marketing Director',
      company: 'Ethio Telecom',
      content: "We've used their services for multiple events. Always reliable, great quality, and excellent technical support during events. Highly recommended!",
      rating: 5,
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Dawit Mekonnen',
      role: 'Government Official',
      company: 'Ministry of Trade',
      content: 'Professional service from start to finish. The fixed installation at our conference hall has been working flawlessly for months.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/75.jpg'
    }
  ]

  const stats = [
    { number: '500+', label: 'Events Completed', icon: <FaAward /> },
    { number: '100+', label: 'Happy Clients', icon: <FaUsers /> },
    { number: '50+', label: 'LED Screens', icon: <FaTv /> },
    { number: '24/7', label: 'Support Available', icon: <FaClock /> }
  ]

  // Helper to get LED image URL
  const getLedImage = (led) => {
    if (led.images && led.images.length > 0) {
      const primary = led.images.find(img => img.isPrimary)
      return primary ? primary.url : led.images[0].url
    }
    const defaults = {
      P2: 'https://images.unsplash.com/photo-1580894901296-2b8f2a4e6282?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      P3: 'https://images.unsplash.com/photo-1580894901296-2b8f2a4e6282?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      P4: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80',
      P5: 'https://images.unsplash.com/photo-1545156521-77bd85671d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      P10: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'
    }
    return defaults[led.type] || defaults.P3
  }

  // Helper to get metadata from installation
  const getMetadata = (item, key) => {
    if (item.metadata instanceof Map) {
      return item.metadata.get(key) || ''
    }
    if (item.metadata && typeof item.metadata === 'object') {
      return item.metadata[key] || ''
    }
    return ''
  }

  // Helper to format date for installations
  const formatInstallationDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    } catch {
      return ''
    }
  }

  return (
    <div className={styles.homePage}>
      <section className={styles.hero}>
        <VideoBackground />
        
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>Premium LED Solutions</span>
            <h1 className={styles.heroTitle}>
              <span className={styles.gradientText}>Illuminate Your Events</span>
              <br />With Crystal-Clear LED Screens
            </h1>
            <p className={styles.heroSubtitle}>
              Transform your events with stunning visual experiences. 
              From intimate gatherings to large-scale concerts, we deliver 
              professional LED solutions that captivate your audience.
            </p>
            
            <div className={styles.heroButtons}>
              <Link to="/quote" className={styles.primaryBtn}>
                Get Free Quote <FaArrowRight />
              </Link>
              <Link to="/services" className={styles.secondaryBtn}>
                <FaPlay /> View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className={styles.whatWeOffer}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSubtitle}>What We Offer</span>
            <h2 className={styles.sectionTitle}>Our Premium Services</h2>
            <p className={styles.sectionDescription}>
              Comprehensive LED solutions tailored to your event needs
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <div key={index} className={styles.serviceCard}>
                <div className={styles.serviceIcon} style={{ background: service.color }}>
                  {service.icon}
                </div>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceDescription}>{service.description}</p>
                <ul className={styles.serviceFeatures}>
                  {service.features.map((feature, idx) => (
                    <li key={idx}>
                      <FaCheck className={styles.checkIcon} /> {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/services" className={styles.serviceLink}>
                  Learn More <FaChevronRight />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Most Popular LEDs Section - fetched from backend */}
      <section className={styles.popularLEDs}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSubtitle}>Most Popular</span>
            <h2 className={styles.sectionTitle}>Our Top LED Screens</h2>
            <p className={styles.sectionDescription}>
              Choose from our most requested LED screens
            </p>
          </div>

          {loadingScreens ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>Loading LED screens...</div>
          ) : (
            <div className={styles.ledGrid}>
              {displayLEDs.map((led, index) => (
                <div key={led._id || index} className={`${styles.ledCard} ${index === 0 || index === 2 ? styles.popular : ''}`}>
                  {(index === 0 || index === 2) && <span className={styles.popularBadge}>Most Popular</span>}
                  <div className={styles.ledImage}>
                    <img src={getLedImage(led)} alt={`${led.type} LED Screen`} />
                    <div className={styles.ledOverlay}>
                      <span className={styles.ledCategory}>
                        {led.category ? led.category.charAt(0).toUpperCase() + led.category.slice(1) : 'Indoor'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.ledInfo}>
                    <h3 className={styles.ledType}>{led.type}</h3>
                    <div className={styles.ledSpecs}>
                      <div className={styles.spec}>
                        <span>Resolution</span>
                        <strong>{led.specifications?.resolution || 'N/A'}</strong>
                      </div>
                      <div className={styles.spec}>
                        <span>Brightness</span>
                        <strong>{led.specifications?.brightness || 'N/A'}</strong>
                      </div>
                    </div>
                    <ul className={styles.ledFeatures}>
                      {(led.features || []).slice(0, 3).map((feature, idx) => (
                        <li key={idx}>{typeof feature === 'string' ? feature : (feature?.en || feature?.am || '')}</li>
                      ))}
                    </ul>
                    <div className={styles.ledPrice}>
                      <span className={styles.price}>
                        {led.pricePerDay ? `${led.pricePerDay.toLocaleString()} ETB/m\u00B2/day` : 'Contact for price'}
                      </span>
                      <Link to="/order" className={styles.orderBtn}>
                        Order Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Installations Section - fetched from backend */}
      <section className={styles.recentInstallations}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSubtitle}>Recent</span>
            <h2 className={styles.sectionTitle}>Our Latest Installations</h2>
            <p className={styles.sectionDescription}>
              See our work across Ethiopia
            </p>
          </div>

          {loadingInstallations ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>Loading installations...</div>
          ) : (
            <div className={styles.installationGrid}>
              {displayInstallations.map((installation, index) => (
                <div key={installation._id || index} className={styles.installationCard}>
                  <div className={styles.installationImage}>
                    <img src={installation.url} alt={typeof installation.title === 'string' ? installation.title : (installation.title?.en || 'Installation')} />
                    <div className={styles.installationOverlay}>
                      <div className={styles.installationDetails}>
                        <h4>{typeof installation.title === 'string' ? installation.title : (installation.title?.en || 'LED Installation')}</h4>
                        <p><FaMapMarkerAlt /> {getMetadata(installation, 'location') || installation.description?.en || ''}</p>
                        <p><FaCalendar /> {formatInstallationDate(installation.createdAt)}</p>
                        <div className={styles.installationSpecs}>
                          <span>{getMetadata(installation, 'ledType') || ''}</span>
                          <span>{getMetadata(installation, 'size') || ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.viewMore}>
            <Link to="/gallery" className={styles.viewMoreBtn}>
              View Full Gallery <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statContent}>
                  <h3 className={styles.statNumber}>{stat.number}</h3>
                  <p className={styles.statLabel}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonials}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSubtitle}>Client</span>
            <h2 className={styles.sectionTitle}>Testimonials</h2>
            <p className={styles.sectionDescription}>
              What our clients say about us
            </p>
          </div>

          <div className={styles.testimonialCarousel}>
            <div className={styles.testimonialCard}>
              <FaQuoteRight className={styles.quoteIcon} />
              <p className={styles.testimonialContent}>
                {testimonials[activeTestimonial].content}
              </p>
              <div className={styles.testimonialAuthor}>
                <img 
                  src={testimonials[activeTestimonial].image} 
                  alt={testimonials[activeTestimonial].name}
                />
                <div>
                  <h4>{testimonials[activeTestimonial].name}</h4>
                  <p>{testimonials[activeTestimonial].role} - {testimonials[activeTestimonial].company}</p>
                  <div className={styles.rating}>
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={i < testimonials[activeTestimonial].rating ? styles.starFilled : styles.starEmpty} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialDots}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === activeTestimonial ? styles.activeDot : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Ready to Illuminate Your Event?
            </h2>
            <p className={styles.ctaDescription}>
              Get a free quote within 2 hours. Tell us about your event and we'll recommend 
              the perfect LED setup tailored to your needs.
            </p>

            <div className={styles.ctaFeatures}>
              <div className={styles.ctaFeature}>
                <FaCheck /> Free Consultation
              </div>
              <div className={styles.ctaFeature}>
                <FaCheck /> 2-Hour Response
              </div>
              <div className={styles.ctaFeature}>
                <FaCheck /> Custom Quote
              </div>
              <div className={styles.ctaFeature}>
                <FaCheck /> No Obligation
              </div>
            </div>

            <div className={styles.ctaButtons}>
              <Link to="/quote" className={styles.ctaPrimary}>
                Request Free Quote <FaArrowRight />
              </Link>
              <div className={styles.ctaContact}>
                <span>Or contact us directly:</span>
                <div className={styles.contactOptions}>
                  <a href="tel:+251911234567">
                    <FaPhone /> +251 911 234 567
                  </a>
                  <a href="mailto:info@ledrental.et">
                    <FaEnvelope /> info@ledrental.et
                  </a>
                </div>
              </div>
            </div>

            <div className={styles.quickQuote}>
              <h3>Quick Quote Request</h3>
              <form className={styles.quoteForm}>
                <input type="text" placeholder="Your Name" />
                <input type="email" placeholder="Email Address" />
                <input type="tel" placeholder="Phone Number" />
                <select>
                  <option>Select LED Type</option>
                  <option>P2 Indoor</option>
                  <option>P3 Indoor</option>
                  <option>P4 Indoor</option>
                  <option>P5 Outdoor</option>
                  <option>P10 Outdoor</option>
                </select>
                <button type="submit" className={styles.submitQuote}>
                  Get Free Quote
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
