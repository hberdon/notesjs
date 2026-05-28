import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/features/auth/LoginPage'
import AuthCallback from '@/features/auth/AuthCallback'
import EditorPage from '@/features/editor/EditorPage'
import PreferencesPage from '@/features/preferences/PreferencesPage'
import SharedFilePage from '@/features/shared/SharedFilePage'
import ProtectedRoute from './ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/editor" replace />,
  },
  {
    path: '/s/:token',
    element: <SharedFilePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/editor',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <EditorPage />,
      },
    ],
  },
  {
    path: '/preferences',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <PreferencesPage />,
      },
    ],
  },
])
