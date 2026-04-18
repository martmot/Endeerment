import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { SocialProvider } from './contexts/SocialContext'
import { UserDataProvider } from './contexts/UserDataContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <AuthProvider>
      <UserDataProvider>
        <SocialProvider>
          <App />
        </SocialProvider>
      </UserDataProvider>
    </AuthProvider>
  </BrowserRouter>
)
