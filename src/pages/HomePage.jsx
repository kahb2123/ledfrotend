import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { 
  FaTv, FaTools, FaClock, FaUsers, FaAward, 
  FaPlay, FaChevronRight, FaStar, FaQuoteRight, 
  FaCalendar, FaMapMarkerAlt, FaArrowRight, FaCheck, 
  FaPhone, FaEnvelope, FaRocket, FaShieldAlt, FaHeadset
} from 'react-icons/fa'
import styles from './HomePage.module.css'
import VideoBackground from '../components/common/VideoBackground'
import video1 from '../assets/videos/led-showcase-1.mp4'
import video2 from '../assets/videos/led-showcase-2.mp4'
import video3 from '../assets/videos/led-showcase-3.mp4'

const HomePage = () => {
  const { t } = useTranslation()
  const { isSignedIn } = useUser()
  const [activeTestimonial, setActiveTestimonial] = useState(0)
   const videos = [video1, video2, video3]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
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

  const popularLEDs = [
    {
      type: 'P3',
      category: 'Indoor',
      resolution: '1280x720',
      brightness: '1500 nits',
      price: '2,500 ETB/m²/day',
      image: 'https://images.unsplash.com/photo-1580894901296-2b8f2a4e6282?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      features: ['HD Quality', 'Energy Efficient', 'Light Weight'],
      popular: true
    },
    {
      type: 'P4',
      category: 'Indoor',
      resolution: '960x540',
      brightness: '1800 nits',
      price: '2,000 ETB/m²/day',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80',
      features: ['Cost Effective', 'Easy Setup', 'Versatile'],
      popular: false
    },
    {
      type: 'P5',
      category: 'Outdoor',
      resolution: '768x432',
      brightness: '5500 nits',
      price: '3,500 ETB/m²/day',
      image: 'https://images.unsplash.com/photo-1545156521-77bd85671d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      features: ['Weatherproof', 'Daylight Visible', 'Durable'],
      popular: true
    },
    {
      type: 'P10',
      category: 'Outdoor',
      resolution: '384x216',
      brightness: '6500 nits',
      price: '2,800 ETB/m²/day',
      image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      features: ['Large Format', 'High Impact', 'Cost Efficient'],
      popular: false
    }
  ]

  const recentInstallations = [
    {
      title: 'Millennium Hall Conference',
      location: 'Addis Ababa',
      date: 'Feb 2024',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1112&q=80',
      type: 'P3 Indoor',
      size: '25 m²'
    },
    {
      title: 'Ethio Telecom Expo',
      location: 'Addis Ababa',
      date: 'Jan 2024',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      type: 'P5 Outdoor',
      size: '40 m²'
    },
    {
      title: 'Wedding Reception',
      location: 'Skylight Hotel',
      date: 'Mar 2024',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80',
      type: 'P2 Indoor',
      size: '15 m²'
    },
    {
      title: 'New Year Concert',
      location: 'Meskel Square',
      date: 'Dec 2023',
      image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      type: 'P10 Outdoor',
      size: '100 m²'
    }
  ]

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

      {/* What We Offer Section - Rich Sapphire */}
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

      {/* Most Popular LEDs Section - Midnight Teal */}
      <section className={styles.popularLEDs}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSubtitle}>Most Popular</span>
            <h2 className={styles.sectionTitle}>Our Top LED Screens</h2>
            <p className={styles.sectionDescription}>
              Choose from our most requested LED screens
            </p>
          </div>

          <div className={styles.ledGrid}>
            {popularLEDs.map((led, index) => (
              <div key={index} className={`${styles.ledCard} ${led.popular ? styles.popular : ''}`}>
                {led.popular && <span className={styles.popularBadge}>Most Popular</span>}
                <div className={styles.ledImage}>
                  <img src={led.image} alt={`${led.type} LED Screen`} />
                  <div className={styles.ledOverlay}>
                    <span className={styles.ledCategory}>{led.category}</span>
                  </div>
                </div>
                <div className={styles.ledInfo}>
                  <h3 className={styles.ledType}>{led.type}</h3>
                  <div className={styles.ledSpecs}>
                    <div className={styles.spec}>
                      <span>Resolution</span>
                      <strong>{led.resolution}</strong>
                    </div>
                    <div className={styles.spec}>
                      <span>Brightness</span>
                      <strong>{led.brightness}</strong>
                    </div>
                  </div>
                  <ul className={styles.ledFeatures}>
                    {led.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                  <div className={styles.ledPrice}>
                    <span className={styles.price}>{led.price}</span>
                    <Link to="/order" className={styles.orderBtn}>
                      Order Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Installations Section - Dark Royal */}
      <section className={styles.recentInstallations}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSubtitle}>Recent</span>
            <h2 className={styles.sectionTitle}>Our Latest Installations</h2>
            <p className={styles.sectionDescription}>
              See our work across Ethiopia
            </p>
          </div>

          <div className={styles.installationGrid}>
            {recentInstallations.map((installation, index) => (
              <div key={index} className={styles.installationCard}>
                <div className={styles.installationImage}>
                  <img src={installation.image} alt={installation.title} />
                  <div className={styles.installationOverlay}>
                    <div className={styles.installationDetails}>
                      <h4>{installation.title}</h4>
                      <p><FaMapMarkerAlt /> {installation.location}</p>
                      <p><FaCalendar /> {installation.date}</p>
                      <div className={styles.installationSpecs}>
                        <span>{installation.type}</span>
                        <span>{installation.size}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.viewMore}>
            <Link to="/gallery" className={styles.viewMoreBtn}>
              View Full Gallery <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - Purple Navy */}
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

      {/* Testimonials Section - Deep Indigo */}
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

      {/* CTA Section - Vibrant Gradient */}
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