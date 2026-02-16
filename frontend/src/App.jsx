import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/context/theme-context'
import { AuthProvider } from '@/context/auth-context'
import { WorkspaceProvider } from '@/context/workspace-context'
import { SocketProvider } from '@/context/socket-context'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import WorkspacesPage from './pages/WorkspacesPage'
import WorkspaceBoardPage from './pages/WorkspaceBoardPage'
import ProtectedRoute from './components/auth/protected-route'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <WorkspaceProvider>
            <SocketProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route 
                  path="/workspaces" 
                  element={
                    <ProtectedRoute>
                      <WorkspacesPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/workspaces/:workspaceId" 
                  element={
                    <ProtectedRoute>
                      <WorkspaceBoardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/workspaces/:workspaceId/boards/:boardId"
                  element={
                    <ProtectedRoute>
                      <WorkspaceBoardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SocketProvider>
          </WorkspaceProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
