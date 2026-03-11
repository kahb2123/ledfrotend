import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { FaBox, FaCalendar, FaMapMarkerAlt, FaEye, FaCheck, FaClock, FaTimes } from 'react-icons/fa'
import styles from './DashboardPage.module.css'
import api from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'

const DashboardPage = () => {
  const { t } = useTranslation()
  const { user } = useUser()
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await api.getMyOrders()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheck />
      case 'cancelled':
        return <FaTimes />
      default:
        return <FaClock />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className={styles.dashboardPage}>
      <div className="container">
        {/* Welcome Message */}
        {location.state?.message && (
          <div className={styles.successMessage}>
            {location.state.message}
          </div>
        )}

        <div className={styles.header}>
          <h1 className={styles.welcomeTitle}>
            {t('dashboard.welcome')}, {user?.firstName || user?.emailAddresses[0].emailAddress}!
          </h1>
          <Link to="/order" className="btn btn-primary">
            {t('nav.order')}
          </Link>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#2563eb' }}>
              <FaBox />
            </div>
            <div className={styles.statInfo}>
              <h3>Total Orders</h3>
              <p>{orders.length}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#f59e0b' }}>
              <FaClock />
            </div>
            <div className={styles.statInfo}>
              <h3>Pending</h3>
              <p>{orders.filter(o => o.status === 'pending').length}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#10b981' }}>
              <FaCheck />
            </div>
            <div className={styles.statInfo}>
              <h3>Completed</h3>
              <p>{orders.filter(o => o.status === 'completed').length}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#7c3aed' }}>
              <FaCalendar />
            </div>
            <div className={styles.statInfo}>
              <h3>Upcoming</h3>
              <p>{orders.filter(o => o.status === 'confirmed' || o.status === 'assigned').length}</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className={styles.ordersSection}>
          <h2 className={styles.sectionTitle}>{t('dashboard.myOrders')}</h2>

          {orders.length === 0 ? (
            <div className={styles.noOrders}>
              <p>{t('dashboard.noOrders')}</p>
              <Link to="/order" className="btn btn-primary">
                {t('nav.order')}
              </Link>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <div key={order._id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderNumber}>
                      <strong>{t('dashboard.orderNumber')}:</strong> {order.orderNumber}
                    </div>
                    <div 
                      className={styles.orderStatus}
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
                    </div>
                  </div>

                  <div className={styles.orderDetails}>
                    <div className={styles.detailItem}>
                      <FaCalendar />
                      <span>{formatDate(order.programDate)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>{order.ledType}</strong>
                      <span>{order.squareMeters} m²</span>
                    </div>
                    <div className={styles.detailItem}>
                      <FaMapMarkerAlt />
                      <span>{order.location.venue}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Total:</strong>
                      <span>{order.totalPrice?.toLocaleString()} ETB</span>
                    </div>
                  </div>

                  <div className={styles.orderFooter}>
                    <button 
                      className={styles.viewBtn}
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowDetails(true)
                      }}
                    >
                      <FaEye /> {t('dashboard.viewDetails')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className={styles.modal} onClick={() => setShowDetails(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              Order Details - {selectedOrder.orderNumber}
            </h2>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h3>LED Screen Information</h3>
                <p><strong>Type:</strong> {selectedOrder.ledType}</p>
                <p><strong>Size:</strong> {selectedOrder.squareMeters} m²</p>
                <p><strong>Price:</strong> {selectedOrder.totalPrice?.toLocaleString()} ETB</p>
              </div>

              <div className={styles.modalSection}>
                <h3>Event Information</h3>
                <p><strong>Program:</strong> {selectedOrder.programType}</p>
                <p><strong>Date:</strong> {formatDate(selectedOrder.programDate)}</p>
                <p><strong>Duration:</strong> {selectedOrder.duration?.days} days</p>
              </div>

              <div className={styles.modalSection}>
                <h3>Location</h3>
                <p><strong>Venue:</strong> {selectedOrder.location.venue}</p>
                <p><strong>City:</strong> {selectedOrder.location.city}</p>
                <p><strong>Address:</strong> {selectedOrder.location.address || 'N/A'}</p>
              </div>

              {selectedOrder.requirements?.specialInstructions && (
                <div className={styles.modalSection}>
                  <h3>Special Instructions</h3>
                  <p>{selectedOrder.requirements.specialInstructions}</p>
                </div>
              )}

              <div className={styles.modalSection}>
                <h3>Timeline</h3>
                {selectedOrder.timeline?.map((event, index) => (
                  <div key={index} className={styles.timelineItem}>
                    <div className={styles.timelineDot}></div>
                    <div className={styles.timelineContent}>
                      <p><strong>{event.status}</strong></p>
                      <p className={styles.timelineDate}>
                        {formatDate(event.timestamp)}
                      </p>
                      {event.note && <p>{event.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className={styles.closeBtn}
              onClick={() => setShowDetails(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage