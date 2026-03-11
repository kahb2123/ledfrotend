import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import styles from './AdminSettings.module.css'

const AdminSettings = () => {
  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Email change states
  const [newEmail, setNewEmail] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [pendingEmailId, setPendingEmailId] = useState(null)

  if (!isLoaded) {
    return <div className={styles.loading}>Loading...</div>
  }

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
      setLoading(false)
      return
    }

    try {
      await user.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        signOutOfOtherSessions: true
      })

      setMessage({ 
        type: 'success', 
        text: '✅ Password updated successfully! You will be logged out from other devices.' 
      })
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Password change error:', error)
      setMessage({ 
        type: 'error', 
        text: error.errors?.[0]?.message || 'Failed to update password. Please check your current password.' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle add new email
  const handleAddEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // Validate email
    if (!newEmail || !newEmail.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      setLoading(false)
      return
    }

    try {
      // Add new email address
      const emailAddress = await user.createEmailAddress({ 
        email: newEmail 
      })

      setPendingEmailId(emailAddress.id)
      setMessage({ 
        type: 'info', 
        text: '📧 Verification email sent! Please check your inbox and enter the verification code below.' 
      })
      
    } catch (error) {
      console.error('Add email error:', error)
      setMessage({ 
        type: 'error', 
        text: error.errors?.[0]?.message || 'Failed to add email address' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle verify email
  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (!verificationCode) {
      setMessage({ type: 'error', text: 'Please enter verification code' })
      setLoading(false)
      return
    }

    try {
      // Find the email address object
      const emailAddress = user.emailAddresses.find(
        email => email.id === pendingEmailId
      )

      if (!emailAddress) {
        throw new Error('Email address not found')
      }

      // Attempt verification
      await emailAddress.attemptVerification({ code: verificationCode })

      setMessage({ 
        type: 'success', 
        text: '✅ Email verified successfully! You can now set it as primary.' 
      })
      
      setVerificationCode('')
      setPendingEmailId(null)
      
    } catch (error) {
      console.error('Verification error:', error)
      setMessage({ 
        type: 'error', 
        text: error.errors?.[0]?.message || 'Invalid verification code' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle set primary email
  const handleSetPrimaryEmail = async (emailId) => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await user.update({
        primaryEmailAddressId: emailId
      })

      setMessage({ 
        type: 'success', 
        text: '✅ Primary email updated successfully!' 
      })
      
      setShowEmailForm(false)
      setNewEmail('')
      
    } catch (error) {
      console.error('Set primary error:', error)
      setMessage({ 
        type: 'error', 
        text: error.errors?.[0]?.message || 'Failed to set primary email' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle remove email
  const handleRemoveEmail = async (emailId) => {
    if (user.emailAddresses.length <= 1) {
      setMessage({ 
        type: 'error', 
        text: 'Cannot remove the only email address' 
      })
      return
    }

    if (!window.confirm('Are you sure you want to remove this email?')) {
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const emailAddress = user.emailAddresses.find(e => e.id === emailId)
      await emailAddress.destroy()

      setMessage({ 
        type: 'success', 
        text: '✅ Email removed successfully' 
      })
      
    } catch (error) {
      console.error('Remove email error:', error)
      setMessage({ 
        type: 'error', 
        text: error.errors?.[0]?.message || 'Failed to remove email' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className={styles.adminSettings}>
      <h2 className={styles.title}>Admin Account Settings</h2>

      {/* Current Admin Info */}
      <div className={styles.infoCard}>
        <h3>Current Admin Information</h3>
        <p><strong>Name:</strong> {user?.fullName || 'Admin User'}</p>
        <p><strong>Username:</strong> {user?.username || 'Not set'}</p>
        <p><strong>Primary Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
        <p><strong>Account Created:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.type === 'success' && <FaCheck />}
          {message.type === 'error' && <FaExclamationTriangle />}
          {message.type === 'info' && '📧'}
          <span>{message.text}</span>
        </div>
      )}

      {/* Email Management Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <FaEnvelope /> Email Addresses
        </h3>

        {/* List existing emails */}
        <div className={styles.emailList}>
          {user?.emailAddresses?.map(email => (
            <div key={email.id} className={styles.emailItem}>
              <div className={styles.emailInfo}>
                <span className={styles.emailAddress}>{email.emailAddress}</span>
                {email.id === user.primaryEmailAddressId && (
                  <span className={styles.primaryBadge}>Primary</span>
                )}
                {email.verification?.status === 'verified' ? (
                  <span className={styles.verifiedBadge}>✓ Verified</span>
                ) : (
                  <span className={styles.unverifiedBadge}>⚠ Not Verified</span>
                )}
              </div>
              
              <div className={styles.emailActions}>
                {email.id !== user.primaryEmailAddressId && email.verification?.status === 'verified' && (
                  <button
                    onClick={() => handleSetPrimaryEmail(email.id)}
                    disabled={loading}
                    className={styles.primaryBtn}
                    title="Set as primary email"
                  >
                    Make Primary
                  </button>
                )}
                
                {email.id !== user.primaryEmailAddressId && (
                  <button
                    onClick={() => handleRemoveEmail(email.id)}
                    disabled={loading || user.emailAddresses.length <= 1}
                    className={styles.removeBtn}
                    title="Remove email"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add new email form */}
        {!showEmailForm ? (
          <button
            onClick={() => setShowEmailForm(true)}
            className={styles.addBtn}
          >
            + Add New Email
          </button>
        ) : (
          <div className={styles.addEmailForm}>
            <h4>Add New Email Address</h4>
            
            <form onSubmit={handleAddEmail}>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  disabled={loading}
                  required
                />
              </div>
              
              <div className={styles.formActions}>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? 'Sending...' : 'Send Verification'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false)
                    setNewEmail('')
                  }}
                  className={styles.cancelBtn}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Verification code input */}
            {pendingEmailId && (
              <form onSubmit={handleVerifyEmail} className={styles.verifyForm}>
                <h4>Enter Verification Code</h4>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    disabled={loading}
                    required
                  />
                </div>
                
                <button type="submit" disabled={loading} className={styles.verifyBtn}>
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Password Change Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <FaLock /> Change Password
        </h3>

        <form onSubmit={handlePasswordChange} className={styles.passwordForm}>
          {/* Current Password */}
          <div className={styles.formGroup}>
            <label>Current Password</label>
            <div className={styles.passwordInput}>
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                placeholder="Enter current password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className={styles.togglePassword}
              >
                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className={styles.formGroup}>
            <label>New Password</label>
            <div className={styles.passwordInput}>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                placeholder="Enter new password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className={styles.togglePassword}
              >
                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <small className={styles.hint}>
              Password must be at least 8 characters long
            </small>
          </div>

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <label>Confirm New Password</label>
            <div className={styles.passwordInput}>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className={styles.togglePassword}
              >
                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.updateBtn}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className={styles.note}>
          <p>📝 Note: After changing your password, you'll be signed out from all other devices.</p>
        </div>
      </div>

      {/* Security Tips */}
      <div className={styles.securityTips}>
        <h4>Security Tips</h4>
        <ul>
          <li>Use a strong password with mix of letters, numbers, and symbols</li>
          <li>Don't share your password with anyone</li>
          <li>Enable 2FA in Clerk Dashboard for extra security</li>
          <li>Regularly review your email addresses and remove unused ones</li>
          <li>Change your password every 3 months</li>
        </ul>
      </div>
    </div>
  )
}

export default AdminSettings