import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  FaUsers, FaBox, FaTasks, FaChartBar, FaCalendar, 
  FaCheck, FaClock, FaTimes, FaEye, FaEdit, FaTrash,
  FaPlus, FaUpload, FaImage, FaVideo, FaCog, FaUserTie,
  FaVideo as FaVideoIcon, FaTv, FaTools, FaMapMarkerAlt
} from 'react-icons/fa'
import styles from './AdminDashboardPage.module.css'
import api from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import AdminSettings from '../components/admin/AdminSettings'
import VideoManager from '../components/admin/VideoManager'
import ServiceManager from '../components/admin/ServiceManager'
import TaskManager from '../components/admin/TaskManager'

const AdminDashboardPage = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [orders, setOrders] = useState([])
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [staff, setStaff] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  
  // Media state
  const [mediaItems, setMediaItems] = useState([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [videoUploading, setVideoUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [editFormData, setEditFormData] = useState({})

  // Task creation state
  const [pendingOrders, setPendingOrders] = useState([])
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
    if (activeTab !== 'settings' && activeTab !== 'videos' && activeTab !== 'services' && activeTab !== 'media') {
      fetchDashboardData()
    }
    if (activeTab === 'staff') {
      fetchStaff()
    }
    if (activeTab === 'tasks') {
      fetchPendingOrders()
    }
    if (activeTab === 'media') {
      fetchMediaItems()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [statsData, ordersData, tasksData, usersData] = await Promise.all([
        api.getAdminStats().catch(err => {
          console.error('Error fetching stats:', err)
          return {}
        }),
        api.getAllOrders().catch(err => {
          console.error('Error fetching orders:', err)
          return { orders: [] }
        }),
        api.getAllTasks().catch(err => {
          console.error('Error fetching tasks:', err)
          return { tasks: [] }
        }),
        api.getAllUsers().catch(err => {
          console.error('Error fetching users:', err)
          return { users: [] }
        })
      ])

      setStats(statsData || {})

      // Handle orders data
      if (Array.isArray(ordersData)) {
        setOrders(ordersData)
      } else if (ordersData?.orders && Array.isArray(ordersData.orders)) {
        setOrders(ordersData.orders)
      } else {
        setOrders([])
      }

      // Handle tasks data
      if (Array.isArray(tasksData)) {
        setTasks(tasksData)
      } else if (tasksData?.tasks && Array.isArray(tasksData.tasks)) {
        setTasks(tasksData.tasks)
      } else {
        setTasks([])
      }

      // Handle users data
      if (Array.isArray(usersData)) {
        setUsers(usersData)
      } else if (usersData?.users && Array.isArray(usersData.users)) {
        setUsers(usersData.users)
      } else {
        setUsers([])
      }

    } catch (error) {
      console.error('Error fetching admin data:', error)
      setOrders([])
      setTasks([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingOrders = async () => {
    try {
      const allOrdersResponse = await api.getAllOrders();
      let allOrders = [];
      if (Array.isArray(allOrdersResponse)) {
        allOrders = allOrdersResponse;
      } else if (allOrdersResponse?.orders) {
        allOrders = allOrdersResponse.orders;
      }

      const pending = allOrders.filter(order => {
        const isPending = order.status === 'pending' || order.status === 'confirmed';
        const hasNoStaff = !order.assignedStaff || order.assignedStaff.length === 0;
        return isPending && hasNoStaff;
      });

      setPendingOrders(pending);
    } catch {
      // silently handle error
    }
  }

  const fetchStaff = async () => {
    try {
      let allUsers = [];

      try {
        const response = await api.getAllUsers();
        if (Array.isArray(response)) {
          allUsers = response;
        } else if (response?.users && Array.isArray(response.users)) {
          allUsers = response.users;
        } else if (response?.data?.users && Array.isArray(response.data.users)) {
          allUsers = response.data.users;
        }
      } catch {
        // silently handle error
      }

      const staffMembers = allUsers.filter(user => 
        user.role === 'staff' || user.role === 'admin'
      );

      setStaff(staffMembers);
    } catch {
      setStaff([]);
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#2563eb',
      assigned: '#7c3aed',
      'in-progress': '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444'
    }
    return colors[status] || '#64748b'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const handleAction = async (action, item, type) => {
    if (action === 'edit') {
      setSelectedItem(item)
      setModalType('edit' + type.charAt(0).toUpperCase() + type.slice(1))
      setShowModal(true)
    } else if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
        try {
          if (type === 'staff' || type === 'user') {
            await api.deleteStaff(item._id)
            alert('User deleted successfully!')
            fetchStaff()
            fetchDashboardData()
          } else if (type === 'order') {
            await api.adminCancelOrder(item._id, 'Deleted by admin')
            alert('Order cancelled successfully!')
            fetchDashboardData()
          } else if (type === 'media') {
            await api.deleteMedia(item._id)
            alert('Media deleted successfully!')
            fetchMediaItems()
          }
        } catch (error) {
          alert(error.response?.data?.error || `Failed to delete ${type}`)
        }
      }
    } else if (action === 'view') {
      setSelectedItem(item)
      setModalType(type)
      setShowModal(true)
    }
  }

  const fetchMediaItems = async () => {
    try {
      setMediaLoading(true)
      const data = await api.getMedia()
      if (data?.media && Array.isArray(data.media)) {
        setMediaItems(data.media)
      } else if (Array.isArray(data)) {
        setMediaItems(data)
      } else {
        setMediaItems([])
      }
    } catch {
      setMediaItems([])
    } finally {
      setMediaLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }
    const category = prompt('Enter category (service, gallery, installation, event, testimonial):', 'gallery')
    if (!category) return
    const title = prompt('Enter image title:', file.name)
    if (!title) return
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', category)
    formData.append('title[en]', title)
    formData.append('title[am]', title)
    formData.append('description[en]', title)
    formData.append('description[am]', title)
    formData.append('isPublic', 'true')
    setImageUploading(true)
    try {
      await api.uploadImage(formData)
      alert('Image uploaded successfully!')
      fetchMediaItems()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload image')
    } finally {
      setImageUploading(false)
    }
  }

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('Video size must be less than 50MB')
      return
    }
    const category = prompt('Enter category (hero-video, gallery, event, installation):', 'hero-video')
    if (!category) return
    const title = prompt('Enter video title:', file.name)
    if (!title) return
    const formData = new FormData()
    formData.append('video', file)
    formData.append('category', category)
    formData.append('title[en]', title)
    formData.append('title[am]', title)
    formData.append('description[en]', title)
    formData.append('description[am]', title)
    formData.append('isPublic', 'true')
    setVideoUploading(true)
    setUploadProgress(0)
    try {
      await api.uploadVideo(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(percentCompleted)
      })
      alert('Video uploaded successfully!')
      fetchMediaItems()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload video')
    } finally {
      setVideoUploading(false)
      setUploadProgress(0)
    }
  }

  const handleEditStaff = (member) => {
    setSelectedItem(member)
    setEditFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'staff'
    })
    setModalType('editStaff')
    setShowModal(true)
  }

  const handleUpdateStaff = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.updateStaff(selectedItem._id, editFormData)
      alert('Staff updated successfully!')
      setShowModal(false)
      fetchStaff()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update staff')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStaff = async (member) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await api.deleteStaff(member._id)
        alert('Staff deleted successfully!')
        fetchStaff()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete staff')
      }
    }
  }

  const handleCreateStaff = () => {
    setModalType('createStaff')
    setShowModal(true)
  }

  const handleCreateTask = () => {
    setModalType('createTask')
    setShowModal(true)
  }

  const handleTaskFormChange = (e) => {
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

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.createTask(taskFormData)
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
      fetchDashboardData()
      fetchPendingOrders()
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStaffSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const staffData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      role: formData.get('role')
    }
    
    try {
      setLoading(true)
      const response = await api.createStaff(staffData)
      alert(response.message || 'Staff created successfully!')
      setShowModal(false)
      e.target.reset()
      fetchStaff()
    } catch (error) {
      console.error('Error creating staff:', error)
      alert(error.response?.data?.error || 'Error creating staff. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : []
  const hasOrders = Array.isArray(orders) && orders.length > 0
  const hasTasks = Array.isArray(tasks) && tasks.length > 0
  const hasUsers = Array.isArray(users) && users.length > 0
  const hasStaff = Array.isArray(staff) && staff.length > 0

  if (loading && activeTab !== 'settings' && activeTab !== 'videos' && activeTab !== 'services') return <LoadingSpinner />

  return (
    <div className={styles.adminDashboard}>
      <div className="container">
        <h1 className={styles.pageTitle}>Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartBar /> Overview
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaBox /> Orders
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'tasks' ? styles.active : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <FaTasks /> Tasks
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers /> Users
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'staff' ? styles.active : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <FaUserTie /> Staff
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'services' ? styles.active : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <FaTv /> LED Screens
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'videos' ? styles.active : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            <FaVideoIcon /> Videos
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'media' ? styles.active : ''}`}
            onClick={() => setActiveTab('media')}
          >
            <FaImage /> Media
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog /> Settings
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#2563eb' }}>
                  <FaBox />
                </div>
                <div className={styles.statInfo}>
                  <h3>Total Orders</h3>
                  <p>{orders.length || 0}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#10b981' }}>
                  <FaCheck />
                </div>
                <div className={styles.statInfo}>
                  <h3>Completed</h3>
                  <p>{orders.filter(o => o.status === 'completed').length || 0}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#f59e0b' }}>
                  <FaClock />
                </div>
                <div className={styles.statInfo}>
                  <h3>Pending</h3>
                  <p>{orders.filter(o => o.status === 'pending').length || 0}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#7c3aed' }}>
                  <FaUsers />
                </div>
                <div className={styles.statInfo}>
                  <h3>Total Users</h3>
                  <p>{stats?.totalUsers || users.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className={styles.recentSection}>
              <h2>Recent Orders</h2>
              <div className={styles.table}>
                <table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>LED Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map(order => (
                        <tr key={order._id || Math.random()}>
                          <td>{order.orderNumber || 'N/A'}</td>
                          <td>
                            {order.customer?.firstName || order.customer?.name || 'N/A'}
                          </td>
                          <td>{order.ledType || 'N/A'}</td>
                          <td>{formatDate(order.programDate)}</td>
                          <td>
                            <span 
                              className={styles.statusBadge}
                              style={{ backgroundColor: getStatusColor(order.status) }}
                            >
                              {order.status || 'pending'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className={styles.actionBtn}
                              onClick={() => {
                                setSelectedItem(order)
                                setModalType('order')
                                setShowModal(true)
                              }}
                            >
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className={styles.ordersTab}>
            <div className={styles.tabHeader}>
              <h2>All Orders</h2>
              <div className={styles.filters}>
                <select className={styles.filterSelect}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  className={styles.searchInput}
                />
              </div>
            </div>

            <div className={styles.table}>
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>LED Type</th>
                    <th>Size</th>
                    <th>Event Date</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hasOrders ? (
                    orders.map(order => (
                      <tr key={order._id || Math.random()}>
                        <td>{order.orderNumber || 'N/A'}</td>
                        <td>{order.customer?.name || order.customer?.firstName || 'N/A'}</td>
                        <td>{order.ledType || 'N/A'}</td>
                        <td>{order.squareMeters || 0} m²</td>
                        <td>{formatDate(order.programDate)}</td>
                        <td>{order.totalPrice?.toLocaleString() || 0} ETB</td>
                        <td>
                          <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button className={styles.actionBtn} onClick={() => handleAction('view', order, 'order')}><FaEye /></button>
                            <button className={styles.actionBtn} onClick={() => handleAction('edit', order, 'order')}><FaEdit /></button>
                            <button className={styles.actionBtn} onClick={() => handleAction('delete', order, 'order')}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tasks Tab - Now using TaskManager component */}
        {activeTab === 'tasks' && (
          <div className={styles.tasksTab}>
            <TaskManager />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={styles.usersTab}>
            <div className={styles.tabHeader}>
              <h2>User Management</h2>
              <div className={styles.filters}>
                <select className={styles.filterSelect}>
                  <option value="all">All Roles</option>
                  <option value="customer">Customers</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admins</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className={styles.searchInput}
                />
              </div>
            </div>

            <div className={styles.table}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hasUsers ? (
                    users.map(user => (
                      <tr key={user._id || Math.random()}>
                        <td>{user.firstName || ''} {user.lastName || ''}</td>
                        <td>{user.email || 'N/A'}</td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>
                          <span className={`${styles.roleBadge} ${styles[user.role] || ''}`}>
                            {user.role || 'customer'}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button className={styles.actionBtn}><FaEdit /></button>
                            <button className={styles.actionBtn}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className={styles.staffTab}>
            <div className={styles.tabHeader}>
              <h2>Staff Management</h2>
              <button className="btn btn-primary" onClick={handleCreateStaff}>
                <FaPlus /> Add New Staff
              </button>
            </div>

            <div className={styles.staffGrid}>
              {hasStaff ? (
                staff.map(member => (
                  <div key={member._id || Math.random()} className={styles.staffCard}>
                    <div className={styles.staffAvatar}>
                      {member.profileImage ? (
                        <img src={member.profileImage} alt={member.firstName} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {member.firstName?.charAt(0) || ''}{member.lastName?.charAt(0) || ''}
                        </div>
                      )}
                    </div>
                    <div className={styles.staffInfo}>
                      <h3>{member.firstName || ''} {member.lastName || ''}</h3>
                      <p className={styles.staffEmail}>{member.email || 'No email'}</p>
                      <p className={styles.staffPhone}>{member.phone || 'No phone'}</p>
                      <div className={styles.staffStats}>
                        <div className={styles.stat}>
                          <span>Tasks</span>
                          <strong>{member.taskCount || 0}</strong>
                        </div>
                        <div className={styles.stat}>
                          <span>Completed</span>
                          <strong>{member.completedTasks || 0}</strong>
                        </div>
                      </div>
                    </div>
                    <div className={styles.staffActions}>
                      <button className={styles.actionBtn} onClick={() => handleEditStaff(member)}><FaEdit /></button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteStaff(member)}><FaTrash /></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noData}>No staff members found</div>
              )}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className={styles.servicesTab}>
            <ServiceManager />
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className={styles.videosTab}>
            <VideoManager />
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className={styles.mediaTab}>
            <div className={styles.tabHeader}>
              <h2>Media Library</h2>
              <div className={styles.uploadButtons}>
                <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaImage /> {imageUploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={imageUploading} />
                </label>
                <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaVideo /> {videoUploading ? `Uploading ${uploadProgress}%` : 'Upload Video'}
                  <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} disabled={videoUploading} />
                </label>
              </div>
            </div>

            {mediaLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading media...</div>
            ) : (
              <div className={styles.mediaGrid}>
                {mediaItems.length > 0 ? (
                  mediaItems.map(item => (
                    <div key={item._id} className={styles.mediaCard}>
                      {item.type === 'video' ? (
                        <video src={item.url} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                      ) : (
                        <img src={item.url || item.thumbnail} alt={item.title?.en || 'Media'} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                      )}
                      <div style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
                        <strong>{item.title?.en || 'Untitled'}</strong>
                        <div style={{ color: '#888' }}>{item.category} | {item.type}</div>
                      </div>
                      <div className={styles.mediaOverlay}>
                        <button className={styles.mediaAction} onClick={() => window.open(item.url, '_blank')}><FaEye /></button>
                        <button className={styles.mediaAction} onClick={() => handleAction('delete', item, 'media')}><FaTrash /></button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>
                    No media found. Upload images or videos to get started.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className={styles.settingsTab}>
            <AdminSettings />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2>
              {modalType === 'order' ? 'Order Details' :
               modalType === 'createStaff' ? 'Add New Staff' :
               modalType === 'editStaff' ? 'Edit Staff Member' :
               modalType === 'createTask' ? 'Create New Task' :
               'Item Details'}
            </h2>
            <div className={styles.modalBody}>
              {modalType === 'createStaff' && (
                <form className={styles.staffForm} onSubmit={handleStaffSubmit}>
                  <input type="text" name="firstName" placeholder="First Name" required />
                  <input type="text" name="lastName" placeholder="Last Name" required />
                  <input type="email" name="email" placeholder="Email" required />
                  <input type="tel" name="phone" placeholder="Phone" />
                  <select name="role" required>
                    <option value="">Select Role</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit" className="btn btn-primary">Create Staff</button>
                </form>
              )}
              
              {modalType === 'createTask' && (
                <form className={styles.taskForm} onSubmit={handleTaskSubmit}>
                  <div className={styles.formGroup}>
                    <label>Select Order *</label>
                    <select 
                      name="orderId" 
                      value={taskFormData.orderId} 
                      onChange={handleTaskFormChange}
                      required
                    >
                      <option value="">Select an order</option>
                      {pendingOrders.map(order => (
                        <option key={order._id} value={order._id}>
                          {order.orderNumber} - {order.ledType} ({order.squareMeters} m²)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Assign To *</label>
                    <select 
                      name="assignedTo" 
                      value={taskFormData.assignedTo} 
                      onChange={handleTaskFormChange}
                      required
                    >
                      <option value="">Select Staff Member</option>
                      {staff.map(member => (
                        <option key={member._id} value={member._id}>
                          {member.firstName} {member.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label>Task Type</label>
                      <select name="taskType" value={taskFormData.taskType} onChange={handleTaskFormChange}>
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
                      <select name="priority" value={taskFormData.priority} onChange={handleTaskFormChange}>
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
                      onChange={handleTaskFormChange}
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
                        onChange={handleTaskFormChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>End Time</label>
                      <input
                        type="time"
                        name="schedule.endTime"
                        value={taskFormData.schedule.endTime}
                        onChange={handleTaskFormChange}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Additional Notes</label>
                    <textarea
                      name="notes"
                      value={taskFormData.notes}
                      onChange={handleTaskFormChange}
                      rows="3"
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
              )}
              
              {modalType === 'editStaff' && selectedItem && (
                <form className={styles.staffForm} onSubmit={handleUpdateStaff}>
                  <input type="text" value={editFormData.firstName} onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})} placeholder="First Name" required />
                  <input type="text" value={editFormData.lastName} onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})} placeholder="Last Name" required />
                  <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} placeholder="Email" required />
                  <input type="tel" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} placeholder="Phone" />
                  <select value={editFormData.role} onChange={(e) => setEditFormData({...editFormData, role: e.target.value})} required>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit" className="btn btn-primary">Update Staff</button>
                </form>
              )}

              {modalType === 'order' && selectedItem && (
                <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
              )}
            </div>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
