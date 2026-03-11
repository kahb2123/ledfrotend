import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './LanguageSwitcher.module.css'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }

  return (
    <div className={styles.switcher}>
      <button
        className={`${styles.langBtn} ${i18n.language === 'en' ? styles.active : ''}`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button
        className={`${styles.langBtn} ${i18n.language === 'am' ? styles.active : ''}`}
        onClick={() => changeLanguage('am')}
      >
        አማ
      </button>
    </div>
  )
}

export default LanguageSwitcher