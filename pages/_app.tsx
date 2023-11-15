import React, { useEffect } from 'react';  // Added useEffect
import { AppProps } from 'next/app';
import { useDispatch } from 'react-redux';  // Added useDispatch
import { wrapper } from '../pages/redux/store';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const dispatch = useDispatch();  // Initialize useDispatch

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const storedViewer = JSON.parse(localStorage.getItem('viewer') || '{}');
    
    if (storedToken) {
      dispatch({ type: 'SET_TOKEN', payload: storedToken });
    }
    if (storedUser) {
      dispatch({ type: 'SET_USER', payload: storedUser });
    }
    if (storedViewer) {
      dispatch({ type: 'SET_VIEWER', payload: storedViewer });
    }
  }, []);

  return <Component {...pageProps} />;
};

export default wrapper.withRedux(MyApp);
