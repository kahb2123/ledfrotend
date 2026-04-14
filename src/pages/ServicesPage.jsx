import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { FaCheck, FaInfoCircle, FaCalculator, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import styles from './ServicesPage.module.css'
import LoadingSpinner from '../components/common/LoadingSpinner'
import api from '../services/api'

const ServicesPage = () => {
  const { t } = useTranslation()
  const { isSignedIn } = useUser()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorData, setCalculatorData] = useState({
    type: 'P3',
    squareMeters: 10,
    days: 1
  })
  const [calculatedPrice, setCalculatedPrice] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const data = await api.getServices()
      setServices(data)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCalculatePrice = async () => {
    try {
      const result = await api.calculatePrice(calculatorData)
      setCalculatedPrice(result)
    } catch (error) {
      console.error('Error calculating price:', error)
    }
  }

  const openServiceDetails = (service) => {
    setSelectedService(service)
    setCurrentImageIndex(0)
    setShowDetails(true)
    document.body.style.overflow = 'hidden'
  }

  const closeServiceDetails = () => {
    setShowDetails(false)
    setSelectedService(null)
    document.body.style.overflow = 'auto'
  }

  const nextImage = () => {
    if (selectedService?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedService.images.length)
    }
  }

  const prevImage = () => {
    if (selectedService?.images?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedService.images.length) % selectedService.images.length)
    }
  }

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory)

  if (loading) return <LoadingSpinner />

  return (
    <div className={styles.servicesPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            <span>Our LED Screen</span> Services
          </h1>
          <p className={styles.heroSubtitle}>
            Choose from a wide range of high-quality LED screens for your events
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className={styles.filterSection}>
        <div className="container">
          <div className={styles.categoryFilter}>
            <button
              className={`${styles.filterBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Screens
            </button>
            <button
              className={`${styles.filterBtn} ${selectedCategory === 'indoor' ? styles.active : ''}`}
              onClick={() => setSelectedCategory('indoor')}
            >
              Indoor
            </button>
            <button
              className={`${styles.filterBtn} ${selectedCategory === 'outdoor' ? styles.active : ''}`}
              onClick={() => setSelectedCategory('outdoor')}
            >
              Outdoor
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className={styles.servicesGrid}>
        <div className="container">
          <div className={styles.grid}>
            {filteredServices.map((service) => {
              const primaryImage = service.images?.find(img => img.isPrimary) || service.images?.[0]
              
              return (
                <div 
                  key={service._id} 
                  className={styles.serviceCard}
                  onClick={() => openServiceDetails(service)}
                >
                  <div className={styles.serviceImageContainer}>
                    {primaryImage ? (
                      <img 
                        src={primaryImage.url} 
                        alt={service.type}
                        className={styles.serviceImage}
                      />
                    ) : (
                      <div className={styles.noImagePlaceholder}>
                        <span>No Image</span>
                      </div>
                    )}
                    {service.images?.length > 1 && (
                      <span className={styles.imageCount}>
                        +{service.images.length} photos
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.serviceHeader}>
                    <h2 className={styles.serviceType}>{service.type}</h2>
                    <span className={`${styles.serviceCategory} ${styles[service.category]}`}>
                      {service.category}
                    </span>
                  </div>
                  
                  <div className={styles.serviceContent}>
                    <h3 className={styles.serviceName}>{typeof service.name === 'string' ? service.name : (service.name?.en || service.type)}</h3>
                    <p className={styles.serviceDescription}>{typeof service.description === 'string' ? service.description : (service.description?.en || '')}</p>
                    
                    <div className={styles.priceSection}>
                      <span className={styles.priceLabel}>Price per day:</span>
                      <span className={styles.priceValue}>{service.pricePerDay.toLocaleString()} ETB/m²</span>
                    </div>

                    <div className={styles.specifications}>
                      <h4>Key Specifications:</h4>
                      <ul>
                        <li>Pixel Pitch: {service.specifications?.pixelPitch || 'N/A'}</li>
                        <li>Brightness: {service.specifications?.brightness || 'N/A'}</li>
                        <li>Resolution: {service.specifications?.resolution || 'N/A'}</li>
                      </ul>
                    </div>

                    <div className={styles.features}>
                      {service.features?.slice(0, 3).map((feature, index) => (
                        <div key={index} className={styles.feature}>
                          <FaCheck className={styles.featureIcon} />
                          <span>{typeof feature === 'string' ? feature : (feature?.en || '')}</span>
                        </div>
                      ))}
                      {service.features?.length > 3 && (
                        <div className={styles.moreFeatures}>
                          +{service.features.length - 3} more features
                        </div>
                      )}
                    </div>

                    {/* UPDATED: Service Footer Buttons with custom classes */}
                    <div className={styles.serviceFooter}>
                      <Link 
                        to={isSignedIn ? "/order" : "/login"} 
                        className={styles.orderNowBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isSignedIn ? 'Order Now' : 'Login to Order'}
                      </Link>
                      <button 
                        className={styles.calculateBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          setCalculatorData({ ...calculatorData, type: service.type })
                          setShowCalculator(true)
                        }}
                      >
                        <FaCalculator /> Calculate
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Service Details Modal */}
      {showDetails && selectedService && (
        <div className={styles.detailsModal} onClick={closeServiceDetails}>
          <div className={styles.detailsModalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={closeServiceDetails}>
              <FaTimes />
            </button>

            <div className={styles.detailsGrid}>
              {/* Image Gallery */}
              <div className={styles.imageGallery}>
                {selectedService.images?.length > 0 ? (
                  <>
                    <div className={styles.mainImage}>
                      <img 
                        src={selectedService.images[currentImageIndex]?.url} 
                        alt={`${selectedService.type} - View ${currentImageIndex + 1}`}
                      />
                      {selectedService.images.length > 1 && (
                        <>
                          <button className={styles.galleryPrev} onClick={prevImage}>
                            <FaChevronLeft />
                          </button>
                          <button className={styles.galleryNext} onClick={nextImage}>
                            <FaChevronRight />
                          </button>
                        </>
                      )}
                    </div>
                    
                    {selectedService.images.length > 1 && (
                      <div className={styles.thumbnailGrid}>
                        {selectedService.images.map((img, idx) => (
                          <div 
                            key={idx}
                            className={`${styles.thumbnail} ${idx === currentImageIndex ? styles.activeThumbnail : ''}`}
                            onClick={() => setCurrentImageIndex(idx)}
                          >
                            <img src={img.url} alt={`Thumbnail ${idx + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.noImagePlaceholder}>No Images Available</div>
                )}
              </div>

              {/* Service Details */}
              <div className={styles.detailsInfo}>
                <div className={styles.detailsHeader}>
                  <h2>{selectedService.type} - {typeof selectedService.name === 'string' ? selectedService.name : (selectedService.name?.en || '')}</h2>
                  <span className={`${styles.categoryBadge} ${styles[selectedService.category]}`}>
                    {selectedService.category}
                  </span>
                </div>

                <p className={styles.detailsDescription}>{typeof selectedService.description === 'string' ? selectedService.description : (selectedService.description?.en || '')}</p>

                <div className={styles.detailsPrice}>
                  <span className={styles.priceLabel}>Price per m²/day:</span>
                  <span className={styles.priceValue}>{selectedService.pricePerDay.toLocaleString()} ETB</span>
                </div>

                <div className={styles.detailsSection}>
                  <h3>Technical Specifications</h3>
                  <div className={styles.specsList}>
                    {selectedService.specifications?.pixelPitch && (
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Pixel Pitch:</span>
                        <span className={styles.specValue}>{selectedService.specifications.pixelPitch}</span>
                      </div>
                    )}
                    {selectedService.specifications?.brightness && (
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Brightness:</span>
                        <span className={styles.specValue}>{selectedService.specifications.brightness}</span>
                      </div>
                    )}
                    {selectedService.specifications?.resolution && (
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Resolution:</span>
                        <span className={styles.specValue}>{selectedService.specifications.resolution}</span>
                      </div>
                    )}
                    {selectedService.specifications?.weight && (
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Weight:</span>
                        <span className={styles.specValue}>{selectedService.specifications.weight}</span>
                      </div>
                    )}
                    {selectedService.specifications?.dimensions && (
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Dimensions:</span>
                        <span className={styles.specValue}>{selectedService.specifications.dimensions}</span>
                      </div>
                    )}
                    {selectedService.specifications?.powerConsumption && (
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Power Consumption:</span>
                        <span className={styles.specValue}>{selectedService.specifications.powerConsumption}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.detailsSection}>
                  <h3>Features</h3>
                  <div className={styles.featuresList}>
                    {selectedService.features?.map((feature, idx) => (
                      <div key={idx} className={styles.featureItem}>
                        <FaCheck className={styles.featureIcon} />
                        <span>{typeof feature === 'string' ? feature : (feature?.en || '')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedService.applications?.length > 0 && (
                  <div className={styles.detailsSection}>
                    <h3>Applications</h3>
                    <div className={styles.applicationsList}>
                      {selectedService.applications.map((app, idx) => (
                        <span key={idx} className={styles.applicationTag}>{typeof app === 'string' ? app : (app?.en || '')}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* UPDATED: Details Modal Buttons */}
                <div className={styles.detailsActions}>
                  <Link 
                    to={isSignedIn ? "/order" : "/login"} 
                    className={styles.orderBtn}
                    onClick={closeServiceDetails}
                  >
                    Order This Screen
                  </Link>
                  <button 
                    className={styles.calculateBtn}
                    onClick={() => {
                      closeServiceDetails()
                      setCalculatorData({ ...calculatorData, type: selectedService.type })
                      setShowCalculator(true)
                    }}
                  >
                    <FaCalculator /> Calculate Price
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Calculator Modal */}
      {showCalculator && (
        <div className={styles.modal} onClick={() => setShowCalculator(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              <FaCalculator /> Price Calculator
            </h3>
            
            <div className={styles.calculatorForm}>
              <div className="form-group">
                <label>LED Type</label>
                <select
                  value={calculatorData.type}
                  onChange={(e) => setCalculatorData({ ...calculatorData, type: e.target.value })}
                >
                  {services.map(service => (
                    <option key={service.type} value={service.type}>
                      {service.type} - {typeof service.name === 'string' ? service.name : (service.name?.en || service.type)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Square Meters</label>
                <input
                  type="number"
                  min="1"
                  value={calculatorData.squareMeters}
                  onChange={(e) => setCalculatorData({ ...calculatorData, squareMeters: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="form-group">
                <label>Number of Days</label>
                <input
                  type="number"
                  min="1"
                  value={calculatorData.days}
                  onChange={(e) => setCalculatorData({ ...calculatorData, days: parseInt(e.target.value) || 1 })}
                />
              </div>

              {/* UPDATED: Calculator button */}
              <button className={styles.calculateModalBtn} onClick={handleCalculatePrice}>
                Calculate Price
              </button>

              {calculatedPrice && (
                <div className={styles.priceResult}>
                  <h4>Estimated Price:</h4>
                  <p className={styles.totalPrice}>
                    {calculatedPrice.totalPrice.toLocaleString()} ETB
                  </p>
                  <p className={styles.priceBreakdown}>
                    ({calculatedPrice.pricePerDay.toLocaleString()} ETB/m²/day × {calculatedPrice.squareMeters}m² × {calculatedPrice.days} days)
                  </p>
                </div>
              )}
            </div>

            <button 
              className={styles.closeBtn}
              onClick={() => setShowCalculator(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <section className={styles.infoSection}>
        <div className="container">
          <div className={styles.infoContent}>
            <FaInfoCircle className={styles.infoIcon} />
            <div>
              <h3>Need Help Choosing?</h3>
              <p>Our experts can help you select the right LED screen for your event.</p>
            </div>
            {/* UPDATED: Info section button */}
            <Link to="/contact" className={styles.contactBtn}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServicesPage