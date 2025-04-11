// src/routes/ProtectedRoute.tsx
import type { JSX } from 'react';

import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  children: JSX.Element;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}
