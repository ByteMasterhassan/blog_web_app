//ProtectedRoute.js

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';

const ProtectedRoute = ({ children }) => {
  const reduxToken = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  let token = typeof window !== 'undefined' ? (reduxToken || localStorage.getItem('jwt_token')) : null;

  // If the token is in localStorage but not in Redux state, update the Redux state
  if (token && !reduxToken) {
    dispatch({ type: 'SET_TOKEN', payload: token });
  }

  // Load token from localStorage and update Redux state if not already done
  useEffect(() => {
    const localToken = localStorage.getItem('jwt_token');
    if (localToken && !reduxToken) {
      dispatch({ type: 'SET_TOKEN', payload: localToken });
    }
  }, []);

  useEffect(() => {
    if (token) {
      const decodedToken = jwt.decode(token);
      const currentTime = Date.now() / 1000;
      
      // Inside the useEffect where you check the token expiration
      if (decodedToken.exp >= currentTime) {
        setIsAuthenticated(true);
        dispatch({ type: 'SET_IS_AUTHENTICATED', payload: true });
      }
      else {
        setIsAuthenticated(true);
      }
    } else {
      router.push('/auth');
    }
  }, [token]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
