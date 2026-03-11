import React, { useRef, useState, useEffect } from 'react'
import api from '../../services/api'
import styles from './VideoBackground.module.css'

const VideoBackground = () => {
  const videoRef = useRef(null)
  const [videos, setVideos] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch videos from database
  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      console.log('🎥 Fetching hero videos...')
      
      const response = await api.getMedia({ 
        category: 'hero-video', 
        type: 'video',
        isPublic: true 
      })
      
      let videosData = []
      if (response?.media && Array.isArray(response.media)) {
        videosData = response.media
      } else if (Array.isArray(response)) {
        videosData = response
      }
      
      console.log(`✅ Found ${videosData.length} videos`)
      setVideos(videosData)
      
    } catch (error) {
      console.error('❌ Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoEnd = () => {
    if (videos.length > 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length)
    }
  }

  useEffect(() => {
    if (videoRef.current && videos.length > 0) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [currentIndex, videos])

  if (loading) {
    return <div className={styles.videoContainer}></div>
  }

  if (videos.length === 0) {
    return <div className={styles.videoContainer}></div>
  }

  const currentVideo = videos[currentIndex]

  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop={videos.length === 1}
        playsInline
        className={styles.video}
        onEnded={handleVideoEnd}
        key={currentVideo._id || currentIndex}
      >
        <source src={currentVideo.url} type="video/mp4" />
      </video>
      
      {/* Gradient Overlay - Kept for text readability */}
      <div className={styles.videoOverlay}></div>
    </div>
  )
}

export default VideoBackground