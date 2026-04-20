import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import fr from './locales/fr'

const saved = localStorage.getItem('lang')
const browserLang = navigator.language.startsWith('fr') ? 'fr' : 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: saved ?? browserLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => localStorage.setItem('lang', lng))

export default i18n
