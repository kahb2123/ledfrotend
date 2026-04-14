import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser } from '@clerk/clerk-react'
import { 
  FaTasks, FaCheck, FaClock, FaMapMarkerAlt, 
  FaPhone, FaEnvelope, FaCamera, FaUpload,
  FaCheckCircle, FaExclamationTriangle, FaCalendarAlt,
  FaList, FaEye, FaStar, FaArrowRight
} from 'react-icons/fa'
import styles from './StaffDashboardPage.module.css'
import api from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'

const StaffDashboardPage = () => {
  const { t } = useTranslation()
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [todaysTasks, setTodaysTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all') // all, pending, in-progress, completed
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issueData, setIssueData] = useState({ description: '', severity: 'medium' })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      // Fetch all staff tasks
      const data = await api.getMyTasks()
      setTasks(data)
      
      // Filter today's tasks
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const todayTasks = data.filter(task => {
        const taskDate = new Date(task.schedule?.startDate)
        return taskDate >= today && taskDate < tomorrow
      })
      setTodaysTasks(todayTasks)
      
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (taskId, status, progress) => {
    try {
      await api.updateTaskStatus(taskId, { status, progress })
      // Refresh tasks
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handlePhotoUpload = async (taskId, files) => {
    try {
      setUploading(true)
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('photos', file)
      })
      await api.uploadTaskPhotos(taskId, formData)
      // Refresh task details
      const updatedTask = await api.getTaskById(taskId)
      setSelectedTask(updatedTask)
      // Refresh tasks list
      fetchTasks()
    } catch (error) {
      console.error('Error uploading photos:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleReportIssue = async (taskId) => {
    if (!issueData.description.trim()) {
      alert('Please describe the issue')
      return
    }
    try {
      await api.reportTaskIssue(taskId, issueData)
      alert('Issue reported successfully')
      setShowIssueForm(false)
      setIssueData({ description: '', severity: 'medium' })
      const updatedTask = await api.getTaskById(taskId)
      setSelectedTask(updatedTask)
      fetchTasks()
    } catch (error) {
      console.error('Error reporting issue:', error)
      alert('Failed to report issue')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#2563eb'
      case 'low': return '#10b981'
      default: return '#64748b'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgent'
      case 'high': return 'High Priority'
      case 'medium': return 'Medium Priority'
      case 'low': return 'Low Priority'
      default: return priority
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true
    return task.status === activeFilter
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className={styles.staffDashboard}>
      <div className="container">
        {/* Header with Welcome and Date */}
        <div className={styles.header}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              Welcome back, <span className={styles.userName}>{user?.firstName || 'Staff'}!</span>
            </h1>
            <p className={styles.welcomeSubtitle}>Here's your task summary for today</p>
          </div>
          <div className={styles.dateCard}>
            <FaCalendarAlt className={styles.dateIcon} />
            <div className={styles.dateInfo}>
              <span className={styles.dateDay}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </span>
              <span className={styles.dateFull}>
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}>
              <FaTasks />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Tasks</span>
              <span className={styles.statValue}>{tasks.length}</span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <FaClock />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>In Progress</span>
              <span className={styles.statValue}>{tasks.filter(t => t.status === 'in-progress').length}</span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <FaCheck />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Completed</span>
              <span className={styles.statValue}>{tasks.filter(t => t.status === 'completed').length}</span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              <FaExclamationTriangle />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Urgent</span>
              <span className={styles.statValue}>{tasks.filter(t => t.priority === 'urgent').length}</span>
            </div>
          </div>
        </div>

        {/* Today's Tasks Section */}
        {todaysTasks.length > 0 && (
          <div className={styles.todaySection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FaCalendarAlt className={styles.sectionIcon} />
                Today's Schedule
              </h2>
              <span className={styles.taskCount}>{todaysTasks.length} tasks today</span>
            </div>
            
            <div className={styles.todayGrid}>
              {todaysTasks.map(task => (
                <div key={task._id} className={styles.todayCard}>
                  <div className={styles.todayCardHeader}>
                    <span className={styles.todayTaskNumber}>{task.taskNumber}</span>
                    <span 
                      className={styles.todayPriority}
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <h3 className={styles.todayTaskTitle}>{task.title}</h3>
                  <div className={styles.todayTaskTime}>
                    <FaClock /> {formatTime(task.schedule?.startDate)} - {formatTime(task.schedule?.endDate)}
                  </div>
                  <div className={styles.todayTaskLocation}>
                    <FaMapMarkerAlt /> {task.location?.venue || 'Location TBD'}
                  </div>
                  <button 
                    className={styles.todayViewBtn}
                    onClick={() => {
                      setSelectedTask(task)
                      setShowTaskDetails(true)
                    }}
                  >
                    View Details <FaArrowRight />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Tasks Section */}
        <div className={styles.tasksSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <FaList className={styles.sectionIcon} />
              My Assigned Tasks
            </h2>
            
            {/* Filter Buttons */}
            <div className={styles.filterTabs}>
              <button 
                className={`${styles.filterTab} ${activeFilter === 'all' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button 
                className={`${styles.filterTab} ${activeFilter === 'pending' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`${styles.filterTab} ${activeFilter === 'in-progress' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('in-progress')}
              >
                In Progress
              </button>
              <button 
                className={`${styles.filterTab} ${activeFilter === 'completed' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className={styles.noTasks}>
              <FaTasks className={styles.noTasksIcon} />
              <p>No {activeFilter !== 'all' ? activeFilter : ''} tasks found.</p>
            </div>
          ) : (
            <div className={styles.tasksList}>
              {filteredTasks.map(task => (
                <div key={task._id} className={`${styles.taskCard} ${styles[task.priority]}`}>
                  <div className={styles.taskHeader}>
                    <div className={styles.taskHeaderLeft}>
                      <span className={styles.taskNumber}>{task.taskNumber}</span>
                      <span 
                        className={styles.priorityBadge}
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <span className={`${styles.statusBadge} ${styles[task.status]}`}>
                      {task.status === 'in-progress' ? 'In Progress' : task.status}
                    </span>
                  </div>

                  <h3 className={styles.taskTitle}>{task.title}</h3>
                  <p className={styles.taskDescription}>{task.description}</p>

                  <div className={styles.taskMeta}>
                    <div className={styles.metaItem}>
                      <FaMapMarkerAlt className={styles.metaIcon} />
                      <span>{task.location?.venue || 'Venue TBD'}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <FaClock className={styles.metaIcon} />
                      <span>{formatDate(task.schedule?.startDate)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={styles.progressContainer}>
                    <div className={styles.progressHeader}>
                      <span>Progress</span>
                      <span className={styles.progressPercentage}>{task.progress || 0}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${task.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.actionButtons}>
                    {task.status !== 'completed' && (
                      <>
                        {task.status !== 'in-progress' && (
                          <button 
                            className={`${styles.actionBtn} ${styles.startBtn}`}
                            onClick={() => handleStatusUpdate(task._id, 'in-progress', 25)}
                          >
                            Start Task
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button 
                            className={`${styles.actionBtn} ${styles.completeBtn}`}
                            onClick={() => handleStatusUpdate(task._id, 'completed', 100)}
                          >
                            <FaCheckCircle /> Mark Complete
                          </button>
                        )}
                      </>
                    )}
                    <button 
                      className={`${styles.actionBtn} ${styles.viewBtn}`}
                      onClick={() => {
                        setSelectedTask(task)
                        setShowTaskDetails(true)
                      }}
                    >
                      <FaEye /> Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <div className={styles.modal} onClick={() => setShowTaskDetails(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Task Details - {selectedTask.taskNumber}
              </h2>
              <span className={`${styles.modalStatus} ${styles[selectedTask.status]}`}>
                {selectedTask.status}
              </span>
            </div>

            <div className={styles.modalBody}>
              {/* Task Info */}
              <div className={styles.modalSection}>
                <h3>Task Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Title:</span>
                    <span className={styles.infoValue}>{selectedTask.title}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Description:</span>
                    <span className={styles.infoValue}>{selectedTask.description}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Priority:</span>
                    <span 
                      className={styles.infoPriority}
                      style={{ backgroundColor: getPriorityColor(selectedTask.priority) }}
                    >
                      {getPriorityLabel(selectedTask.priority)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              {selectedTask.customerDetails && (
                <div className={styles.modalSection}>
                  <h3>Customer Information</h3>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Name:</span>
                      <span className={styles.infoValue}>{selectedTask.customerDetails.name}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Phone:</span>
                      <span className={styles.infoValue}>
                        <a href={`tel:${selectedTask.customerDetails.phone}`}>
                          {selectedTask.customerDetails.phone}
                        </a>
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Email:</span>
                      <span className={styles.infoValue}>
                        <a href={`mailto:${selectedTask.customerDetails.email}`}>
                          {selectedTask.customerDetails.email}
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {selectedTask.location && (
                <div className={styles.modalSection}>
                  <h3>Location</h3>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Venue:</span>
                      <span className={styles.infoValue}>{selectedTask.location.venue}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Address:</span>
                      <span className={styles.infoValue}>
                        {selectedTask.location.address}, {selectedTask.location.city}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule */}
              {selectedTask.schedule && (
                <div className={styles.modalSection}>
                  <h3>Schedule</h3>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Start:</span>
                      <span className={styles.infoValue}>{formatDate(selectedTask.schedule.startDate)}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>End:</span>
                      <span className={styles.infoValue}>{formatDate(selectedTask.schedule.endDate)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* LED Details */}
              {selectedTask.ledDetails && (
                <div className={styles.modalSection}>
                  <h3>LED Screen Details</h3>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Type:</span>
                      <span className={styles.infoValue}>{selectedTask.ledDetails.type}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Size:</span>
                      <span className={styles.infoValue}>{selectedTask.ledDetails.squareMeters} m²</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Update */}
              <div className={styles.modalSection}>
                <h3>Update Progress</h3>
                <div className={styles.progressUpdate}>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={selectedTask.progress || 0}
                    onChange={async (e) => {
                      const newProgress = parseInt(e.target.value)
                      setSelectedTask({...selectedTask, progress: newProgress})
                      await handleStatusUpdate(selectedTask._id, selectedTask.status, newProgress)
                    }}
                    className={styles.progressSlider}
                  />
                  <span className={styles.progressValue}>{selectedTask.progress || 0}%</span>
                </div>
              </div>

              {/* Report Issue */}
              <div className={styles.modalSection}>
                <h3>Report Issue</h3>
                {!showIssueForm ? (
                  <button 
                    className={styles.reportIssueBtn || styles.uploadBtn}
                    onClick={() => setShowIssueForm(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
                  >
                    <FaExclamationTriangle /> Report an Issue
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <textarea
                      placeholder="Describe the issue..."
                      value={issueData.description}
                      onChange={(e) => setIssueData({ ...issueData, description: e.target.value })}
                      rows="3"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                    />
                    <select
                      value={issueData.severity}
                      onChange={(e) => setIssueData({ ...issueData, severity: e.target.value })}
                      style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                    >
                      <option value="low">Low Severity</option>
                      <option value="medium">Medium Severity</option>
                      <option value="high">High Severity</option>
                      <option value="critical">Critical</option>
                    </select>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleReportIssue(selectedTask._id)}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
                      >
                        Submit Issue
                      </button>
                      <button 
                        onClick={() => { setShowIssueForm(false); setIssueData({ description: '', severity: 'medium' }) }}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {selectedTask.issues?.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Previous Issues</h4>
                    {selectedTask.issues.map((issue, idx) => (
                      <div key={idx} style={{ padding: '0.5rem', backgroundColor: issue.status === 'resolved' ? '#f0fdf4' : '#fef2f2', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>{issue.description}</p>
                        <small style={{ color: '#666' }}>
                          Severity: {issue.severity} | Status: {issue.status}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo Upload */}
              <div className={styles.modalSection}>
                <h3>Completion Photos</h3>
                <div className={styles.photoGrid}>
                  {selectedTask.completionPhotos?.map((photo, index) => (
                    <div key={index} className={styles.photoItem}>
                      <img src={photo.url} alt={`Completion ${index + 1}`} />
                    </div>
                  ))}
                  <label className={styles.uploadBtn}>
                    <FaCamera />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(selectedTask._id, e.target.files)}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                {uploading && <p className={styles.uploading}>Uploading...</p>}
              </div>
            </div>

            <button 
              className={styles.closeBtn}
              onClick={() => setShowTaskDetails(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffDashboardPage
