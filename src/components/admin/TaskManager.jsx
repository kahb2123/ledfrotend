import React, { useState, useEffect } from 'react'
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaCheckCircle, 
  FaClock, FaExclamationTriangle, FaUserTie,
  FaCalendar, FaMapMarkerAlt, FaTv, FaTools
} from 'react-icons/fa'
import api from '../../services/api'
import styles from './TaskManager.module.css'
import LoadingSpinner from '../common/LoadingSpinner'

const TaskManager = () => {
  const [orders, setOrders] = useState([])
  const [staff, setStaff] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  const [taskFormData, setTaskFormData] = useState({
    orderId: '',
    assignedTo: '',
    taskType: 'installation',
    priority: 'medium',
    schedule: {
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: ''
    },
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [ordersData, staffData, tasksData] = await Promise.all([
        api.getAllOrders({ status: 'pending' }).catch(err => {
          console.error('Error fetching orders:', err)
          return { orders: [] }
        }),
        api.getStaff().catch(err => {
          console.error('Error fetching staff:', err)
          return []
        }),
        api.getAllTasks().catch(err => {
          console.error('Error fetching tasks:', err)
          return { tasks: [] }
        })
      ])
      
      // Handle orders data
      if (Array.isArray(ordersData)) {
        setOrders(ordersData)
      } else if (ordersData?.orders) {
        setOrders(ordersData.orders)
      }

      // Handle staff data
      if (Array.isArray(staffData)) {
        setStaff(staffData)
      } else if (staffData?.data) {
        setStaff(staffData.data)
      }

      // Handle tasks data
      if (Array.isArray(tasksData)) {
        setTasks(tasksData)
      } else if (tasksData?.tasks) {
        setTasks(tasksData.tasks)
      }

    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = (order) => {
    setSelectedOrder(order)
    setTaskFormData({
      ...taskFormData,
      orderId: order._id,
      schedule: {
        ...taskFormData.schedule,
        startDate: order.programDate?.split('T')[0] || '',
        endDate: ''
      }
    })
    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setTaskFormData({
        ...taskFormData,
        [parent]: {
          ...taskFormData[parent],
          [child]: value
        }
      })
    } else {
      setTaskFormData({ ...taskFormData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Validate form
  if (!taskFormData.orderId) {
    alert('Please select an order')
    return
  }
  if (!taskFormData.assignedTo) {
    alert('Please select a staff member')
    return
  }
  if (!taskFormData.schedule.startDate) {
    alert('Please select a start date')
    return
  }

  // Format the data properly for the backend
  const submitData = {
    orderId: taskFormData.orderId,
    assignedTo: taskFormData.assignedTo,
    taskType: taskFormData.taskType,
    priority: taskFormData.priority,
    schedule: {
      startDate: taskFormData.schedule.startDate,
      startTime: taskFormData.schedule.startTime || '09:00',
      endDate: taskFormData.schedule.endDate || taskFormData.schedule.startDate,
      endTime: taskFormData.schedule.endTime || '17:00'
    },
    notes: taskFormData.notes || ''
  }

  try {
    setLoading(true)
    await api.createTask(submitData)
    alert('Task created successfully!')
    setShowModal(false)
    setTaskFormData({
      orderId: '',
      assignedTo: '',
      taskType: 'installation',
      priority: 'medium',
      schedule: {
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      },
      notes: ''
    })
    fetchData()
  } catch (error) {
    // Show detailed error message
    let errorMessage = 'Failed to create task.\n'
    if (error.response?.data?.error === 'Validation error') {
      errorMessage += '\nValidation errors:'
      const details = error.response.data.details || {}
      Object.keys(details).forEach(key => {
        errorMessage += `\n- ${key}: ${details[key]}`
      })
    } else if (error.response?.data?.error) {
      errorMessage += error.response.data.error
    } else if (error.response?.data?.message) {
      errorMessage += error.response.data.message
    }
    
    alert(errorMessage)
  } finally {
    setLoading(false)
  }
}
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#2563eb'
      case 'low': return '#10b981'
      default: return '#64748b'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <FaCheckCircle />
      case 'in-progress': return <FaClock />
      case 'pending': return <FaClock />
      case 'cancelled': return <FaExclamationTriangle />
      default: return null
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className={styles.taskManager}>
      <div className={styles.header}>
        <h2>Task Management</h2>
        <p>Create and manage tasks for staff members</p>
      </div>

      {/* Pending Orders Section */}
      <div className={styles.section}>
        <h3>Pending Orders Ready for Task Assignment</h3>
        <div className={styles.orderGrid}>
          {orders.length > 0 ? (
            orders.map(order => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderNumber}>{order.orderNumber}</span>
                  <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className={styles.orderDetails}>
                  <p><FaTv /> {order.ledType} - {order.squareMeters} m²</p>
                  <p><FaCalendar /> {new Date(order.programDate).toLocaleDateString()}</p>
                  <p><FaMapMarkerAlt /> {order.location?.venue || 'N/A'}</p>
                </div>
                <button 
                  className={styles.assignBtn}
                  onClick={() => handleCreateTask(order)}
                >
                  <FaTools /> Assign Task
                </button>
              </div>
            ))
          ) : (
            <p className={styles.noData}>No pending orders</p>
          )}
        </div>
      </div>

      {/* Active Tasks Section */}
      <div className={styles.section}>
        <h3>Active Tasks</h3>
        <div className={styles.taskGrid}>
          {tasks.filter(t => t.status !== 'completed').length > 0 ? (
            tasks.filter(t => t.status !== 'completed').map(task => (
              <div key={task._id} className={styles.taskCard}>
                <div className={styles.taskHeader}>
                  <span className={styles.taskNumber}>{task.taskNumber}</span>
                  <span 
                    className={styles.taskPriority}
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  >
                    {task.priority}
                  </span>
                </div>
                <h4>{task.title}</h4>
                <div className={styles.taskDetails}>
                  <p><FaUserTie /> Assigned to: {task.assignedTo?.firstName} {task.assignedTo?.lastName}</p>
                  <p><FaCalendar /> Start: {task.schedule?.startDate ? new Date(task.schedule.startDate).toLocaleDateString() : 'N/A'}</p>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${task.progress || 0}%` }} />
                    <span>{task.progress || 0}%</span>
                  </div>
                </div>
                <div className={styles.taskFooter}>
                  <span className={`${styles.taskStatus} ${styles[task.status]}`}>
                    {getStatusIcon(task.status)} {task.status}
                  </span>
                  <button className={styles.viewBtn}>
                    <FaEye /> View
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noData}>No active tasks</p>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showModal && selectedOrder && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2>Create Task for Order {selectedOrder.orderNumber}</h2>
            
            <form onSubmit={handleSubmit} className={styles.taskForm}>
              <div className={styles.orderSummary}>
                <h3>Order Summary</h3>
                <p><strong>LED Type:</strong> {selectedOrder.ledType} ({selectedOrder.ledCategory})</p>
                <p><strong>Size:</strong> {selectedOrder.squareMeters} m²</p>
                <p><strong>Location:</strong> {selectedOrder.location?.venue}, {selectedOrder.location?.city}</p>
                <p><strong>Event Date:</strong> {new Date(selectedOrder.programDate).toLocaleDateString()}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Assign To *</label>
                <select 
                  name="assignedTo" 
                  value={taskFormData.assignedTo} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Staff Member</option>
                  {staff.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.firstName} {member.lastName} - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Task Type</label>
                  <select name="taskType" value={taskFormData.taskType} onChange={handleChange}>
                    <option value="installation">Installation</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                    <option value="support">Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Priority</label>
                  <select name="priority" value={taskFormData.priority} onChange={handleChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Start Date *</label>
                <input
                  type="date"
                  name="schedule.startDate"
                  value={taskFormData.schedule.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Start Time</label>
                  <input
                    type="time"
                    name="schedule.startTime"
                    value={taskFormData.schedule.startTime}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>End Time</label>
                  <input
                    type="time"
                    name="schedule.endTime"
                    value={taskFormData.schedule.endTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Additional Notes</label>
                <textarea
                  name="notes"
                  value={taskFormData.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Any special instructions for the staff..."
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn}>
                  Create Task
                </button>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
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

export default TaskManager
