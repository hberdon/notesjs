import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/features/auth/LoginPage'
import AuthCallback from '@/features/auth/AuthCallback'
import EditorPage from '@/features/editor/EditorPage'
import ProtectedRoute from './ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/editor" replace />,
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
])
