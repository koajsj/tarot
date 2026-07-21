import { createApp } from 'vue'
import App from './App.vue'
import styles from './styles.css?inline'

const styleElement = document.createElement('style')
styleElement.dataset.lunaStyles = 'true'
styleElement.textContent = styles
document.head.append(styleElement)

createApp(App).mount('#app')
