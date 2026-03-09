import './App.css'
import { BrowserRouter, Route, Routes } from "react-router"
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home/Home'
import SignUp from './pages/SignUp/SignUp'
import Login from './pages/Login/Login'
import ToastList from '@/components/Toast/ToastList'
import TopHeader from '@/components/TopHeader/TopHeader'
import Footer from '@/components/Footer/Footer'
import VerifySignup from './pages/Verify/VerifySignUp'
import Profile from './pages/Profile/Profile'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import ResetPasswordForm from './pages/ResetPasswordForm/ResetPasswordForm'

function App() {
  return (
    <div className="app">
      <BrowserRouter>

          <ToastProvider>
            <AuthProvider>
              <ToastList />

              <TopHeader />

              <Routes>
                <Route path="/sign-up" element={<SignUp />}/>
                <Route path="/login" element={<Login />}/>
                <Route path="/reset-password" element={<ResetPassword />}/>
                <Route path="/reset-password-form" element={<ResetPasswordForm />}/>
                <Route path="/verify-sign-up" element={<VerifySignup />}/>
                <Route path="/profile" element={<Profile />}/>

                <Route path="/" element={<Home />}/>

              </Routes>

              <Footer />
            </AuthProvider>
          </ToastProvider>

      </BrowserRouter>
    </div>

  )
}

export default App
