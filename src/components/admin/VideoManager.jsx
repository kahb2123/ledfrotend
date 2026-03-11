import React, { useState, useEffect } from 'react'
import { FaUpload, FaTrash, FaArrowUp, FaArrowDown, FaEye, FaEyeSlash } from 'react-icons/fa'
import api from '../../services/api'
import styles from './VideoManager.module.css'

const VideoManager = () => {
  const [videos, setVideos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching videos...')
      
      const response = await api.getMedia({ category: 'hero-video', type: 'video' })
      console.log('Videos response:', response)
      
      if (response?.media && Array.isArray(response.media)) {
        setVideos(response.media)
      } else if (Array.isArray(response)) {
        setVideos(response)
      } else {
        setVideos([])
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      setError('Failed to load videos: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    console.log('Selected file:', file.name, 'Type:', file.type, 'Size:', (file.size / (1024 * 1024)).toFixed(2), 'MB')

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Video size must be less than 50MB')
      return
    }

    const formData = new FormData()
    formData.append('video', file)
    formData.append('category', 'hero-video')
    
    // Send title as separate fields
    formData.append('title[en]', file.name)
    formData.append('title[am]', file.name)
    
    // Send description
    formData.append('description[en]', 'Hero section video')
    formData.append('description[am]', 'ዋና ቪዲዮ')
    
    formData.append('isPublic', 'true')

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      console.log('Uploading video...')
      
      const response = await api.uploadVideo(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(percentCompleted)
        console.log(`Upload progress: ${percentCompleted}%`)
      })
      
      console.log('Upload response:', response)
      alert('Video uploaded successfully!')
      fetchVideos()
      
    } catch (error) {
      console.error('Upload error details:', error)
      
      let errorMessage = 'Failed to upload video'
      
      if (error.response) {
        console.error('Error response data:', error.response.data)
        console.error('Error response status:', error.response.status)
        errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`
        
        if (error.response.data?.details) {
          errorMessage += '\n' + error.response.data.details.join('\n')
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Check if backend is running.'
      } else {
        errorMessage = `Request error: ${error.message}`
      }
      
      alert(errorMessage)
      setError(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      e.target.value = ''
    }
  }

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return

    try {
      console.log('Deleting video:', videoId)
      await api.deleteMedia(videoId)
      alert('Video deleted successfully')
      fetchVideos()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete video: ' + (error.message || 'Unknown error'))
    }
  }

  const handleToggleVisibility = async (video) => {
    try {
      console.log('Toggling visibility for:', video._id)
      await api.updateMedia(video._id, {
        isPublic: !video.isPublic
      })
      fetchVideos()
    } catch (error) {
      console.error('Error toggling visibility:', error)
      alert('Failed to update video visibility')
    }
  }

  const handleMoveUp = (index) => {
    if (index === 0) return
    const newVideos = [...videos]
    ;[newVideos[index - 1], newVideos[index]] = [newVideos[index], newVideos[index - 1]]
    setVideos(newVideos)
    
    // Save new order
    const orderedIds = newVideos.map(v => v._id)
    api.reorderMedia('hero-video', orderedIds).catch(console.error)
  }

  const handleMoveDown = (index) => {
    if (index === videos.length - 1) return
    const newVideos = [...videos]
    ;[newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]]
    setVideos(newVideos)
    
    // Save new order
    const orderedIds = newVideos.map(v => v._id)
    api.reorderMedia('hero-video', orderedIds).catch(console.error)
  }

  if (loading) return <div className={styles.loading}>Loading videos...</div>

  return (
    <div className={styles.videoManager}>
      <div className={styles.header}>
        <h2>Hero Section Videos</h2>
        <p>Manage videos that appear in the homepage hero section</p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>Error: {error}</p>
          <button onClick={fetchVideos}>Retry</button>
        </div>
      )}

      <div className={styles.uploadSection}>
        <label className={styles.uploadBtn}>
          <FaUpload /> Upload New Video
          <input 
            type="file" 
            accept="video/mp4,video/webm,video/ogg,video/avi,video/mov"
            onChange={handleUpload}
            disabled={uploading}
            hidden
          />
        </label>
        
        {uploading && (
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <span>{uploadProgress}% Uploaded</span>
          </div>
        )}
      </div>

      {videos.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No videos uploaded yet. Click the button above to add your first video.</p>
        </div>
      ) : (
        <div className={styles.videoList}>
          {videos.map((video, index) => (
            <div key={video._id} className={styles.videoItem}>
              <div className={styles.videoPreview}>
                <video 
                  src={video.url} 
                  className={styles.preview} 
                  controls
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className={styles.videoInfo}>
                <div className={styles.videoDetails}>
                  <h3>Video {index + 1}</h3>
                  <p className={styles.videoTitle}>
                    {video.title?.en || video.title || 'Untitled'}
                  </p>
                  <p className={styles.videoMeta}>
                    Size: {video.size ? (video.size / (1024 * 1024)).toFixed(2) : 'N/A'} MB | 
                    Format: {video.format?.split('/')[1]?.toUpperCase() || 'MP4'} | 
                    Status: <span className={video.isPublic ? styles.public : styles.private}>
                      {video.isPublic ? 'Public' : 'Private'}
                    </span>
                  </p>
                </div>

                <div className={styles.videoActions}>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => handleToggleVisibility(video)}
                    title={video.isPublic ? 'Hide video' : 'Show video'}
                  >
                    {video.isPublic ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  
                  <button 
                    className={styles.actionBtn}
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <FaArrowUp />
                  </button>
                  
                  <button 
                    className={styles.actionBtn}
                    onClick={() => handleMoveDown(index)}
                    disabled={index === videos.length - 1}
                    title="Move down"
                  >
                    <FaArrowDown />
                  </button>
                  
                  <button 
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(video._id)}
                    title="Delete video"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VideoManager