import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaClock, 
  FaCalculator,
  FaTv,
  FaBuilding,
  FaTools,
  FaUserCog,
  FaBackspace,
  FaArrowRight,
  FaCheckCircle,
  FaInfoCircle,
  FaVideo,
  FaExclamationCircle
} from 'react-icons/fa'
import { MdEvent, MdLocationCity, MdDateRange } from 'react-icons/md'
import { BsGrid3X3GapFill } from 'react-icons/bs'
import { IoMdPricetag } from 'react-icons/io'
import styles from './OrderPage.module.css'
import api from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'

const OrderPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useUser()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [calculatedPrice, setCalculatedPrice] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formErrors, setFormErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)
  
  // Use refs to track previous values and prevent excessive API calls
  const previousValues = useRef({
    ledType: 'P3',
    squareMeters: 10,
    days: 1
  })
  
  const priceCalculationTimeout = useRef(null)
  const lastCalculationTime = useRef(0)
  const calculationAttempts = useRef(0)

  const [formData, setFormData] = useState({
    ledType: 'P3',
    ledCategory: 'indoor', // Add this field
    squareMeters: 10,
    programType: '', // Changed from eventType
    programDate: '', // Changed from eventDate
    duration: {
      days: 1,
      hours: 0
    },
    location: {
      venue: '',
      city: 'Addis Ababa',
      subcity: '',
      address: '',
      mapLink: ''
    },
    requirements: {
      installation: true,
      technician: true,
      backup: false,
      specialInstructions: ''
    }
  })

  useEffect(() => {
    fetchServices()
  }, [])

  // Update ledCategory when ledType changes
  useEffect(() => {
    const selectedService = services.find(s => s.type === formData.ledType)
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        ledCategory: selectedService.category // Set category based on selected LED type
      }))
    }
  }, [formData.ledType, services])

  // Reset calculation attempts when component unmounts
  useEffect(() => {
    return () => {
      if (priceCalculationTimeout.current) {
        clearTimeout(priceCalculationTimeout.current)
      }
    }
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const data = await api.getServices()
      setServices(data)
    } catch (error) {
      console.error('Error fetching services:', error)
      setSubmitError('Failed to load services. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const calculatePrice = useCallback(async (force = false) => {
    // Check if values have actually changed
    const currentValues = {
      ledType: formData.ledType,
      squareMeters: formData.squareMeters,
      days: formData.duration.days
    }

    if (
      !force &&
      previousValues.current.ledType === currentValues.ledType &&
      previousValues.current.squareMeters === currentValues.squareMeters &&
      previousValues.current.days === currentValues.days
    ) {
      return // No changes, skip calculation
    }

    // Rate limiting: prevent too many requests
    const now = Date.now()
    const timeSinceLastCall = now - lastCalculationTime.current
    
    // Reset counter if it's been more than 10 seconds
    if (timeSinceLastCall > 10000) {
      calculationAttempts.current = 0
    }

    // Check if we're making too many attempts
    if (calculationAttempts.current >= 5) {
      console.warn('Too many price calculation attempts, please wait...')
      setSubmitError('Too many requests. Please wait a moment before trying again.')
      return
    }

    // Ensure minimum 2 seconds between calculations
    if (timeSinceLastCall < 2000 && !force) {
      // Schedule calculation for later
      if (priceCalculationTimeout.current) {
        clearTimeout(priceCalculationTimeout.current)
      }
      
      priceCalculationTimeout.current = setTimeout(() => {
        calculatePrice(true)
      }, 2000 - timeSinceLastCall)
      
      return
    }

    try {
      setIsCalculating(true)
      calculationAttempts.current += 1
      lastCalculationTime.current = now
      
      const result = await api.calculatePrice({
        type: formData.ledType,
        squareMeters: formData.squareMeters,
        days: formData.duration.days
      })
      
      setCalculatedPrice(result)
      
      // Update previous values on success
      previousValues.current = { ...currentValues }
      
      // Clear any error message
      if (submitError === 'Too many requests. Please wait a moment before trying again.') {
        setSubmitError(null)
      }
      
    } catch (error) {
      console.error('Error calculating price:', error)
      
      // Handle rate limiting errors specifically
      if (error.response?.status === 429) {
        setSubmitError('Rate limit reached. Please wait a moment before trying again.')
      }
    } finally {
      setIsCalculating(false)
    }
  }, [formData.ledType, formData.squareMeters, formData.duration.days, submitError])

  // Debounced price calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      calculatePrice()
    }, 1000) // Wait 1 second after last change before calculating

    return () => clearTimeout(timer)
  }, [formData.ledType, formData.squareMeters, formData.duration.days, calculatePrice])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.')
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }
      } else {
        return {
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }
      }
    })

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      })
    }
  }

  const validateStep = (step) => {
    const errors = {}

    if (step === 1) {
      if (!formData.ledType) errors.ledType = 'Please select LED type'
      if (!formData.squareMeters || formData.squareMeters < 1) {
        errors.squareMeters = 'Square meters must be at least 1'
      }
    }

    if (step === 2) {
      if (!formData.programType?.trim()) {
        errors.programType = 'Please enter program type'
      }
      if (!formData.programDate) {
        errors.programDate = 'Please select event date'
      }
      if (!formData.duration.days || formData.duration.days < 1) {
        errors.durationDays = 'Duration must be at least 1 day'
      }
    }

    if (step === 3) {
      if (!formData.location.venue?.trim()) {
        errors['location.venue'] = 'Please enter venue name'
      }
      if (!formData.location.city?.trim()) {
        errors['location.city'] = 'Please enter city'
      }
    }

    return errors
  }

  const handleNextStep = () => {
    const errors = validateStep(currentStep)
    
    if (Object.keys(errors).length === 0) {
      setCurrentStep(currentStep + 1)
      setFormErrors({})
    } else {
      setFormErrors(errors)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
    setFormErrors({})
  }

 const formatOrderData = () => {
  const selectedService = services.find(s => s.type === formData.ledType)
  
  return {
    ledType: formData.ledType,
    ledCategory: formData.ledCategory,
    squareMeters: Number(formData.squareMeters),
    programType: formData.programType,
    programDate: new Date(formData.programDate).toISOString(),
    duration: {
      days: Number(formData.duration.days),
      hours: Number(formData.duration.hours) || 0
    },
    location: {
      venue: formData.location.venue,
      city: formData.location.city,
      subcity: formData.location.subcity || '',
      address: formData.location.address || '',
      mapLink: ''
    },
    requirements: {
      installation: Boolean(formData.requirements.installation),
      technician: Boolean(formData.requirements.technician),
      backup: Boolean(formData.requirements.backup),
      specialInstructions: formData.requirements.specialInstructions || ''
    }
  };
};
const handleSubmit = async (e) => {
  e.preventDefault()
  setSubmitError(null)
  
  // Validate final step
  const errors = validateStep(4)
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors)
    return
  }

  if (!user) {
    setSubmitError('You must be logged in to create an order')
    return
  }

  setSubmitting(true)

  try {
    const orderData = formatOrderData()
    
    console.log('Submitting order data:', JSON.stringify(orderData, null, 2))
    
    // Validate required fields before sending
    if (!orderData.ledType) throw new Error('LED type is required')
    if (!orderData.ledCategory) throw new Error('LED category is required')
    if (!orderData.squareMeters) throw new Error('Square meters is required')
    if (!orderData.programType) throw new Error('Program type is required')
    if (!orderData.programDate) throw new Error('Program date is required')
    if (!orderData.duration?.days) throw new Error('Duration days is required')
    if (!orderData.location?.venue) throw new Error('Venue is required')
    if (!orderData.location?.city) throw new Error('City is required')
    
    const response = await api.createOrder(orderData)
    console.log('Order created successfully:', response)
    
    navigate('/dashboard', { 
      state: { 
        message: 'Order created successfully! We will contact you soon.',
        type: 'success'
      }
    })
  } catch (error) {
    console.error('Error creating order:', error)
    
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      console.error('Server response:', data)
      
      if (status === 429) {
        setSubmitError('Too many requests. Please wait a moment before trying again.')
      } else if (status === 400) {
        if (data.details) {
          setSubmitError('Validation errors:\n' + data.details.join('\n'))
        } else if (data.missingFields) {
          setSubmitError('Missing fields: ' + data.missingFields.join(', '))
        } else if (data.error) {
          setSubmitError(data.error)
        } else {
          setSubmitError('Invalid order data. Please check your inputs.')
        }
      } else if (status === 401) {
        setSubmitError('You need to be logged in to create an order.')
      } else if (status === 403) {
        setSubmitError('You do not have permission to create an order.')
      } else if (status === 500) {
        setSubmitError('Server error. Please try again later or contact support.')
      } else {
        setSubmitError(data?.message || 'Failed to create order. Please try again.')
      }
    } else if (error.request) {
      setSubmitError('Network error. Please check your internet connection.')
    } else {
      setSubmitError(error.message || 'An unexpected error occurred. Please try again.')
    }
  } finally {
    setSubmitting(false)
  }
}

  const getStepIcon = (step) => {
    switch(step) {
      case 1: return <FaTv />
      case 2: return <MdEvent />
      case 3: return <FaMapMarkerAlt />
      case 4: return <FaTools />
      default: return null
    }
  }

  const getStepTitle = (step) => {
    switch(step) {
      case 1: return 'Select LED Screen'
      case 2: return 'Event Details'
      case 3: return 'Location Information'
      case 4: return 'Additional Requirements'
      default: return ''
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className={styles.orderPage}>
      <div className={styles.heroSection}>
        <div className="container">
          <h1 className={styles.pageTitle}>
            <FaVideo className={styles.titleIcon} />
            {t('order.title')}
          </h1>
          <p className={styles.pageSubtitle}>
            Complete the form below to request your LED screen rental. 
            Our team will review your requirements and get back to you within 24 hours.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Progress Steps */}
        <div className={styles.progressSteps}>
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step}
              className={`${styles.step} ${currentStep >= step ? styles.active : ''} ${currentStep > step ? styles.completed : ''}`}
              onClick={() => step < currentStep && setCurrentStep(step)}
            >
              <div className={styles.stepNumber}>
                {currentStep > step ? <FaCheckCircle /> : step}
              </div>
              <div className={styles.stepLabel}>
                {getStepTitle(step)}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.orderForm}>
          {/* Error Message */}
          {submitError && (
            <div className={styles.errorBanner}>
              <FaExclamationCircle />
              <span>{submitError}</span>
              <button 
                type="button" 
                onClick={() => setSubmitError(null)}
                className={styles.closeError}
              >
                ×
              </button>
            </div>
          )}

          {/* Step 1: LED Selection */}
          {currentStep === 1 && (
            <div className={styles.formStep}>
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                  {getStepIcon(1)} {getStepTitle(1)}
                </h2>
                
                <div className={styles.serviceGrid}>
                  {services.length > 0 ? services.map(service => (
                    <label 
                      key={service.type}
                      className={`${styles.serviceCard} ${formData.ledType === service.type ? styles.selected : ''}`}
                    >
                      <input
                        type="radio"
                        name="ledType"
                        value={service.type}
                        checked={formData.ledType === service.type}
                        onChange={handleChange}
                        className={styles.hiddenRadio}
                      />
                      <div className={styles.serviceIcon}>
                        <FaTv />
                      </div>
                      <div className={styles.serviceInfo}>
                        <h3>{service.type}</h3>
                        <p className={styles.serviceName}>{service.name?.en || service.name}</p>
                        <p className={styles.servicePrice}>
                          {service.pricePerDay?.toLocaleString() || 0} ETB/m²/day
                        </p>
                        <p className={styles.serviceCategory}>
                          Category: {service.category}
                        </p>
                      </div>
                      {formData.ledType === service.type && (
                        <div className={styles.selectedCheck}>
                          <FaCheckCircle />
                        </div>
                      )}
                    </label>
                  )) : (
                    <p className={styles.noServices}>No services available</p>
                  )}
                </div>
                
                {formErrors.ledType && (
                  <p className={styles.errorMessage}>{formErrors.ledType}</p>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <BsGrid3X3GapFill className={styles.inputIcon} />
                    Square Meters Required *
                  </label>
                  <input
                    type="number"
                    name="squareMeters"
                    min="1"
                    value={formData.squareMeters}
                    onChange={handleChange}
                    className={`${styles.input} ${formErrors.squareMeters ? styles.error : ''}`}
                    required
                  />
                  {formErrors.squareMeters && (
                    <p className={styles.errorMessage}>{formErrors.squareMeters}</p>
                  )}
                  <p className={styles.helpText}>
                    Minimum order: 1 square meter. Larger screens available upon request.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Event Details */}
          {currentStep === 2 && (
            <div className={styles.formStep}>
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                  {getStepIcon(2)} {getStepTitle(2)}
                </h2>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <MdEvent className={styles.inputIcon} />
                    Program Type *
                  </label>
                  <input
                    type="text"
                    name="programType"
                    value={formData.programType}
                    onChange={handleChange}
                    placeholder="e.g., Conference, Concert, Exhibition"
                    className={`${styles.input} ${formErrors.programType ? styles.error : ''}`}
                    required
                  />
                  {formErrors.programType && (
                    <p className={styles.errorMessage}>{formErrors.programType}</p>
                  )}
                </div>

                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <FaCalendar className={styles.inputIcon} />
                      Event Date *
                    </label>
                    <input
                      type="date"
                      name="programDate"
                      value={formData.programDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`${styles.input} ${formErrors.programDate ? styles.error : ''}`}
                      required
                    />
                    {formErrors.programDate && (
                      <p className={styles.errorMessage}>{formErrors.programDate}</p>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <FaClock className={styles.inputIcon} />
                      Duration (Days) *
                    </label>
                    <input
                      type="number"
                      name="duration.days"
                      min="1"
                      value={formData.duration.days}
                      onChange={handleChange}
                      className={`${styles.input} ${formErrors.durationDays ? styles.error : ''}`}
                      required
                    />
                    {formErrors.durationDays && (
                      <p className={styles.errorMessage}>{formErrors.durationDays}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location Details */}
          {currentStep === 3 && (
            <div className={styles.formStep}>
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                  {getStepIcon(3)} {getStepTitle(3)}
                </h2>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FaBuilding className={styles.inputIcon} />
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    name="location.venue"
                    value={formData.location.venue}
                    onChange={handleChange}
                    placeholder="e.g., Millennium Hall, Sheraton Hotel"
                    className={`${styles.input} ${formErrors['location.venue'] ? styles.error : ''}`}
                    required
                  />
                  {formErrors['location.venue'] && (
                    <p className={styles.errorMessage}>{formErrors['location.venue']}</p>
                  )}
                </div>

                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <MdLocationCity className={styles.inputIcon} />
                      City *
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      className={`${styles.input} ${formErrors['location.city'] ? styles.error : ''}`}
                      required
                    />
                    {formErrors['location.city'] && (
                      <p className={styles.errorMessage}>{formErrors['location.city']}</p>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Sub-city</label>
                    <input
                      type="text"
                      name="location.subcity"
                      value={formData.location.subcity}
                      onChange={handleChange}
                      placeholder="e.g., Bole, Kirkos"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Street Address</label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    placeholder="Street name, house number"
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Requirements */}
          {currentStep === 4 && (
            <div className={styles.formStep}>
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                  {getStepIcon(4)} {getStepTitle(4)}
                </h2>

                <div className={styles.requirementsGrid}>
                  <label className={`${styles.requirementCard} ${formData.requirements.installation ? styles.selected : ''}`}>
                    <input
                      type="checkbox"
                      name="requirements.installation"
                      checked={formData.requirements.installation}
                      onChange={handleChange}
                      className={styles.hiddenCheckbox}
                    />
                    <FaTools className={styles.requirementIcon} />
                    <span className={styles.requirementTitle}>Installation</span>
                    <span className={styles.requirementDesc}>Professional setup included</span>
                    {formData.requirements.installation && (
                      <FaCheckCircle className={styles.requirementCheck} />
                    )}
                  </label>

                  <label className={`${styles.requirementCard} ${formData.requirements.technician ? styles.selected : ''}`}>
                    <input
                      type="checkbox"
                      name="requirements.technician"
                      checked={formData.requirements.technician}
                      onChange={handleChange}
                      className={styles.hiddenCheckbox}
                    />
                    <FaUserCog className={styles.requirementIcon} />
                    <span className={styles.requirementTitle}>Technician</span>
                    <span className={styles.requirementDesc}>On-site support throughout event</span>
                    {formData.requirements.technician && (
                      <FaCheckCircle className={styles.requirementCheck} />
                    )}
                  </label>

                  <label className={`${styles.requirementCard} ${formData.requirements.backup ? styles.selected : ''}`}>
                    <input
                      type="checkbox"
                      name="requirements.backup"
                      checked={formData.requirements.backup}
                      onChange={handleChange}
                      className={styles.hiddenCheckbox}
                    />
                    <FaBackspace className={styles.requirementIcon} />
                    <span className={styles.requirementTitle}>Backup Screen</span>
                    <span className={styles.requirementDesc}>Additional screen for emergencies</span>
                    {formData.requirements.backup && (
                      <FaCheckCircle className={styles.requirementCheck} />
                    )}
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Special Instructions</label>
                  <textarea
                    name="requirements.specialInstructions"
                    value={formData.requirements.specialInstructions}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Any special requirements, technical specifications, or instructions..."
                    className={styles.textarea}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Price Summary - Visible in all steps */}
          {calculatedPrice && (
            <div className={styles.priceSummary}>
              <div className={styles.priceHeader}>
                <h3>
                  <IoMdPricetag /> Price Summary
                </h3>
                <div className={styles.priceBadge}>
                  {formData.duration.days} {formData.duration.days === 1 ? 'Day' : 'Days'}
                </div>
              </div>
              <div className={styles.priceDetails}>
                <div className={styles.priceRow}>
                  <span>LED Type:</span>
                  <span className={styles.highlight}>{formData.ledType}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Category:</span>
                  <span className={styles.highlight}>{formData.ledCategory}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Price per m²/day:</span>
                  <span>{calculatedPrice.pricePerDay?.toLocaleString() || 0} ETB</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Square meters:</span>
                  <span>{calculatedPrice.squareMeters} m²</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Duration:</span>
                  <span>{calculatedPrice.days} days</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Subtotal:</span>
                  <span>{(calculatedPrice.pricePerDay * calculatedPrice.squareMeters * calculatedPrice.days).toLocaleString()} ETB</span>
                </div>
                <div className={`${styles.priceRow} ${styles.total}`}>
                  <span>Total Estimated Price:</span>
                  <span className={styles.totalAmount}>
                    {calculatedPrice.totalPrice?.toLocaleString() || 0} ETB
                  </span>
                </div>
              </div>
              <p className={styles.priceNote}>
                * Final price may vary based on additional requirements and site visit
              </p>
            </div>
          )}

          {/* Loading indicator for price calculation */}
          {isCalculating && (
            <div className={styles.calculatingIndicator}>
              <LoadingSpinner size="small" />
              <span>Updating price...</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={styles.formNavigation}>
            {currentStep > 1 && (
              <button 
                type="button"
                onClick={handlePrevStep}
                className={styles.navButton}
                disabled={submitting}
              >
                Previous
              </button>
            )}
            
            {currentStep < 4 ? (
              <button 
                type="button"
                onClick={handleNextStep}
                className={`${styles.navButton} ${styles.primaryButton}`}
                disabled={submitting}
              >
                Next Step <FaArrowRight />
              </button>
            ) : (
              <button 
                type="submit" 
                className={`${styles.navButton} ${styles.submitButton}`}
                disabled={submitting || isCalculating}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Order <FaCheckCircle />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Form Footer */}
          <div className={styles.formFooter}>
            <div className={styles.contactInfo}>
              <FaInfoCircle />
              <span>Need help? Call us at </span>
              <a href="tel:+251911234567">+251 911 234 567</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrderPage