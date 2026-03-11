import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaImage, FaEye, FaTimes } from 'react-icons/fa'
import api from '../../services/api'
import styles from './ServiceManager.module.css'

const ServiceManager = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'P3',
    category: 'indoor',
    name: { en: '', am: '' },
    description: { en: '', am: '' },
    pricePerDay: '',
    specifications: {
      pixelPitch: '',
      brightness: '',
      resolution: '',
      weight: '',
      dimensions: '',
      powerConsumption: '',
      viewingAngle: '',
      lifespan: '',
      ipRating: ''
    },
    features: [{ en: '', am: '' }],
    images: [],
    applications: [{ en: '', am: '' }],
    isAvailable: true,
    minOrder: 1,
    stockQuantity: 0
  })

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      })
    } else {
      setFormData({ 
        ...formData, 
        [name]: type === 'checkbox' ? checked : value 
      })
    }
  }

  const handleNestedInputChange = (field, lang, value) => {
    setFormData({
      ...formData,
      [field]: {
        ...formData[field],
        [lang]: value
      }
    })
  }

  const handleSpecChange = (field, value) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [field]: value
      }
    })
  }

  const handleFeatureChange = (index, lang, value) => {
    const updatedFeatures = [...formData.features]
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      [lang]: value
    }
    setFormData({ ...formData, features: updatedFeatures })
  }

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { en: '', am: '' }]
    })
  }

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const updatedFeatures = formData.features.filter((_, i) => i !== index)
      setFormData({ ...formData, features: updatedFeatures })
    }
  }

  const handleApplicationChange = (index, lang, value) => {
    const updatedApplications = [...formData.applications]
    updatedApplications[index] = {
      ...updatedApplications[index],
      [lang]: value
    }
    setFormData({ ...formData, applications: updatedApplications })
  }

  const addApplication = () => {
    setFormData({
      ...formData,
      applications: [...formData.applications, { en: '', am: '' }]
    })
  }

  const removeApplication = (index) => {
    if (formData.applications.length > 1) {
      const updatedApplications = formData.applications.filter((_, i) => i !== index)
      setFormData({ ...formData, applications: updatedApplications })
    }
  }

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('category', 'service')
        formData.append('title', JSON.stringify({ en: file.name, am: file.name }))
        
        try {
          const response = await api.uploadImage(formData)
          console.log('Upload response:', response)
          
          // Handle different response structures
          let imageUrl = ''
          let publicId = ''
          
          if (response.url) {
            imageUrl = response.url
            publicId = response.publicId || ''
          } else if (response.data?.url) {
            imageUrl = response.data.url
            publicId = response.data.publicId || ''
          } else if (response.secure_url) {
            imageUrl = response.secure_url
            publicId = response.public_id || ''
          } else {
            console.error('Unexpected response format:', response)
            return null
          }
          
          return {
            url: imageUrl,
            publicId: publicId,
            isPrimary: false,
            caption: { en: '', am: '' }
          }
        } catch (uploadError) {
          console.error('Error uploading individual file:', uploadError)
          return null
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      const validImages = uploadedImages.filter(img => img !== null)
      
      if (validImages.length === 0) {
        throw new Error('No images were uploaded successfully')
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validImages]
      }))
      
      alert(`${validImages.length} image(s) uploaded successfully!`)
      
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const setPrimaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }))
  }

  const removeImage = (index) => {
    if (window.confirm('Remove this image?')) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'P3',
      category: 'indoor',
      name: { en: '', am: '' },
      description: { en: '', am: '' },
      pricePerDay: '',
      specifications: {
        pixelPitch: '',
        brightness: '',
        resolution: '',
        weight: '',
        dimensions: '',
        powerConsumption: '',
        viewingAngle: '',
        lifespan: '',
        ipRating: ''
      },
      features: [{ en: '', am: '' }],
      images: [],
      applications: [{ en: '', am: '' }],
      isAvailable: true,
      minOrder: 1,
      stockQuantity: 0
    })
    setEditingService(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (service) => {
    setEditingService(service)
    setFormData(service)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name.en || !formData.name.am) {
      alert('Please enter name in both English and Amharic')
      return
    }
    if (!formData.description.en || !formData.description.am) {
      alert('Please enter description in both English and Amharic')
      return
    }
    if (!formData.pricePerDay) {
      alert('Please enter price per day')
      return
    }

    try {
      setLoading(true)
      let response
      
      if (editingService) {
        response = await api.updateService(editingService._id, formData)
        alert('Service updated successfully!')
      } else {
        response = await api.createService(formData)
        alert('Service created successfully!')
      }
      
      console.log('Service saved:', response)
      setShowModal(false)
      resetForm()
      await fetchServices()
    } catch (error) {
      console.error('Error saving service:', error)
      alert(error.response?.data?.error || 'Error saving service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      try {
        setLoading(true)
        await api.deleteService(id)
        alert('Service deleted successfully')
        await fetchServices()
      } catch (error) {
        console.error('Error deleting service:', error)
        alert(error.response?.data?.error || 'Error deleting service')
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading && !showModal) return <div className={styles.loading}>Loading services...</div>

  return (
    <div className={styles.serviceManager}>
      <div className={styles.header}>
        <h2>LED Screen Management</h2>
        <button className={styles.addBtn} onClick={openCreateModal}>
          <FaPlus /> Add New LED Screen
        </button>
      </div>

      <div className={styles.serviceList}>
        {services.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No LED screens found. Click the button above to add your first screen.</p>
          </div>
        ) : (
          services.map(service => (
            <div key={service._id} className={styles.serviceItem}>
              <div className={styles.serviceImage}>
                {service.images?.find(img => img.isPrimary) ? (
                  <img src={service.images.find(img => img.isPrimary).url} alt={service.type} />
                ) : service.images?.[0] ? (
                  <img src={service.images[0].url} alt={service.type} />
                ) : (
                  <div className={styles.noImage}>No Image</div>
                )}
              </div>
              <div className={styles.serviceInfo}>
                <h3>{service.type} - {service.name?.en || 'Unnamed'}</h3>
                <p className={styles.serviceCategory}>{service.category}</p>
                <p className={styles.servicePrice}>{service.pricePerDay?.toLocaleString() || 0} ETB/m²/day</p>
                <p className={styles.serviceStatus}>
                  Status: <span className={service.isAvailable ? styles.available : styles.unavailable}>
                    {service.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </p>
              </div>
              <div className={styles.serviceActions}>
                <button className={styles.actionBtn} onClick={() => openEditModal(service)} title="Edit">
                  <FaEdit />
                </button>
                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(service._id)} title="Delete">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Service Modal */}
      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingService ? 'Edit LED Screen' : 'Add New LED Screen'}</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.serviceForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>LED Type <span className={styles.required}>*</span></label>
                  <select name="type" value={formData.type} onChange={handleInputChange} required>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                    <option value="P4">P4</option>
                    <option value="P5">P5</option>
                    <option value="P10">P10</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Category <span className={styles.required}>*</span></label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Name (English) <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    value={formData.name.en}
                    onChange={(e) => handleNestedInputChange('name', 'en', e.target.value)}
                    placeholder="e.g., P3 Indoor LED Screen"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Name (Amharic) <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    value={formData.name.am}
                    onChange={(e) => handleNestedInputChange('name', 'am', e.target.value)}
                    placeholder="የኤልኢዲ ስክሪን ስም"
                    required
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label>Description (English) <span className={styles.required}>*</span></label>
                  <textarea
                    value={formData.description.en}
                    onChange={(e) => handleNestedInputChange('description', 'en', e.target.value)}
                    placeholder="Describe the LED screen features and benefits"
                    rows="3"
                    required
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label>Description (Amharic) <span className={styles.required}>*</span></label>
                  <textarea
                    value={formData.description.am}
                    onChange={(e) => handleNestedInputChange('description', 'am', e.target.value)}
                    placeholder="ስለ ኤልኢዲ ስክሪን ያብራሩ"
                    rows="3"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Price Per Day (ETB/m²) <span className={styles.required}>*</span></label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    placeholder="2500"
                    min="0"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Minimum Order (m²)</label>
                  <input
                    type="number"
                    name="minOrder"
                    value={formData.minOrder}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className={styles.formGroupCheckbox}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                    />
                    <span>Available for Rental</span>
                  </label>
                </div>
              </div>

              <h3 className={styles.sectionTitle}>Technical Specifications</h3>
              <div className={styles.specsGrid}>
                <div className={styles.formGroup}>
                  <label>Pixel Pitch</label>
                  <input
                    value={formData.specifications.pixelPitch}
                    onChange={(e) => handleSpecChange('pixelPitch', e.target.value)}
                    placeholder="e.g., 2mm"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Brightness</label>
                  <input
                    value={formData.specifications.brightness}
                    onChange={(e) => handleSpecChange('brightness', e.target.value)}
                    placeholder="e.g., 1500 nits"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Resolution</label>
                  <input
                    value={formData.specifications.resolution}
                    onChange={(e) => handleSpecChange('resolution', e.target.value)}
                    placeholder="e.g., 1920x1080"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Weight</label>
                  <input
                    value={formData.specifications.weight}
                    onChange={(e) => handleSpecChange('weight', e.target.value)}
                    placeholder="e.g., 15kg/sqm"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Dimensions</label>
                  <input
                    value={formData.specifications.dimensions}
                    onChange={(e) => handleSpecChange('dimensions', e.target.value)}
                    placeholder="e.g., 500x500mm"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Power Consumption</label>
                  <input
                    value={formData.specifications.powerConsumption}
                    onChange={(e) => handleSpecChange('powerConsumption', e.target.value)}
                    placeholder="e.g., 200W/sqm"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Viewing Angle</label>
                  <input
                    value={formData.specifications.viewingAngle}
                    onChange={(e) => handleSpecChange('viewingAngle', e.target.value)}
                    placeholder="e.g., 160°"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Lifespan</label>
                  <input
                    value={formData.specifications.lifespan}
                    onChange={(e) => handleSpecChange('lifespan', e.target.value)}
                    placeholder="e.g., 100,000 hours"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>IP Rating</label>
                  <input
                    value={formData.specifications.ipRating}
                    onChange={(e) => handleSpecChange('ipRating', e.target.value)}
                    placeholder="e.g., IP65"
                  />
                </div>
              </div>

              <h3 className={styles.sectionTitle}>Features</h3>
              {formData.features.map((feature, index) => (
                <div key={index} className={styles.featureRow}>
                  <input
                    type="text"
                    placeholder="Feature in English"
                    value={feature.en}
                    onChange={(e) => handleFeatureChange(index, 'en', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Feature in Amharic"
                    value={feature.am}
                    onChange={(e) => handleFeatureChange(index, 'am', e.target.value)}
                  />
                  {formData.features.length > 1 && (
                    <button type="button" className={styles.removeBtn} onClick={() => removeFeature(index)} title="Remove feature">
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className={styles.addFeatureBtn} onClick={addFeature}>
                <FaPlus /> Add Feature
              </button>

              <h3 className={styles.sectionTitle}>Applications</h3>
              {formData.applications.map((app, index) => (
                <div key={index} className={styles.featureRow}>
                  <input
                    type="text"
                    placeholder="Application in English"
                    value={app.en}
                    onChange={(e) => handleApplicationChange(index, 'en', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Application in Amharic"
                    value={app.am}
                    onChange={(e) => handleApplicationChange(index, 'am', e.target.value)}
                  />
                  {formData.applications.length > 1 && (
                    <button type="button" className={styles.removeBtn} onClick={() => removeApplication(index)} title="Remove application">
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className={styles.addFeatureBtn} onClick={addApplication}>
                <FaPlus /> Add Application
              </button>

              <h3 className={styles.sectionTitle}>Images</h3>
              <div className={styles.imageUpload}>
                <label className={styles.uploadBtn}>
                  <FaImage /> {uploading ? 'Uploading...' : 'Upload Images'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    hidden
                  />
                </label>
                {uploading && <div className={styles.uploadProgress}>Uploading...</div>}

                <div className={styles.imageGrid}>
                  {formData.images.map((image, index) => (
                    <div key={index} className={styles.imageItem}>
                      <img src={image.url} alt={`Service ${index}`} />
                      <div className={styles.imageOverlay}>
                        {!image.isPrimary && (
                          <button onClick={() => setPrimaryImage(index)} title="Set as primary">
                            <FaEye />
                          </button>
                        )}
                        {image.isPrimary && <span className={styles.primaryBadge}>Primary</span>}
                        <button onClick={() => removeImage(index)} className={styles.deleteImageBtn} title="Remove">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn} disabled={loading || uploading}>
                  {loading ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service')}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceManager