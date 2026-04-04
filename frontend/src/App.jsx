import { BrowserRouter, Route, Routes, Navigate } from "react-router"
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
import ProtectedRoute from './pages/ProtectedRoute/ProtectedRoute.jsx'
import Invite from './pages/Invite/Invite'
import ServerSettings from './pages/ServerSettings/ServerSettings'
import UserProfile from './pages/UserProfile/UserProfile'
import NotFound from './pages/NotFound/NotFound'
import Search from './pages/Search/Search'

function App() {
  return (
    <div className="app">
      <BrowserRouter>

          <ToastProvider>
            <AuthProvider>

              <ToastList />
              <TopHeader />

              <Routes>
                {/* Public routes */}
                <Route path="/sign-up" element={<SignUp />}/>
                <Route path="/login" element={<Login />}/>
                <Route path="/invite/:code" element={<Invite />}/>
                <Route path="/users/:userId" element={<UserProfile />}/>

                <Route path="/reset-password" element={<ResetPassword />}/>
                <Route path="/reset-password-form" element={<ResetPasswordForm />}/>
                <Route path="/verify-sign-up" element={<VerifySignup />}/>

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  {/* <Route path="/" element={<Navigate to="/channels/@me" replace/>} /> */}
                  <Route path="/" element={<Home />}/>
                  <Route path="/search" element={<Search />}/>
                  <Route path="/channels/:serverId/:channelId" element={<Home />}/>
                  <Route path="/server/:serverId/settings" element={<ServerSettings />}/>

                  <Route path="/:userId" element={<Profile />}/>
                </Route>

                {/* Not found */}
                {/* <Route path="*" element={<NotFound />} /> */}
              </Routes>

              <Footer />

            </AuthProvider>
          </ToastProvider>

      </BrowserRouter>
    </div>

  )
}

export default App
