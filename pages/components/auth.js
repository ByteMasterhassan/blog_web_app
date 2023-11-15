//auth.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f3f4f6;
  font-family: 'Arial', sans-serif;
`;

const FormBox = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
  text-align: center;
`;

const StyledLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #0077B6;
  }
`;

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 10px 20px;
  background-color: #0077B6;
  color: white;
  border: none;
  border-radius: 5px;
  margin: 10px 0;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #005994;
  }
`;

const ToggleButton = styled(Button)`
  background-color: transparent;
  color: #0077B6;
  border: 1px solid #0077B6;
  
  &:hover {
    background-color: #E5E7EB;
  }
`;

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();

  // Load token from localStorage if available and update Redux state
  useEffect(() => {
    const localToken = localStorage.getItem('jwt_token');
    if (localToken) {
      // Update Redux state with the token
      dispatch({ type: 'SET_TOKEN', payload: localToken });
    }
  }, []);
  
  const handleAuth = async (e) => {
    e.preventDefault();
    
    try {
      const url = isLogin ? 'https://nodejs.backend.techozon.com/api/viewer/login' : 'https://nodejs.backend.techozon.com/api/viewer/signup';
      const response = await axios.post(url, { email, password, username });
    
      if (response.data.viewer && response.data.token) {
        // Update Redux state and localStorage
        dispatch({ type: 'SET_USER', payload: response.data.viewer });
        dispatch({ type: 'SET_TOKEN', payload: response.data.token });
        dispatch({ type: 'SET_VIEWER', payload: response.data.viewer });
        
        localStorage.setItem('jwt_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.viewer));
        localStorage.setItem('viewer', JSON.stringify(response.data.viewer));
      
        // Navigate to the homepage
        router.push('/');
      }
       else {
          console.log("Unexpected API response structure.");
        }
    } catch (error) {
      console.log("API Error:", error);
    }
  };
  
  return (
    <Container>
      <FormBox>
        <h1>{isLogin ? 'Login' : 'Signup'}</h1>
        <form onSubmit={handleAuth}>
          {!isLogin && (
            <div>
              <StyledLabel>Username</StyledLabel>
              <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          )}
          <div>
            <StyledLabel>Email</StyledLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <StyledLabel>Password</StyledLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit">{isLogin ? 'Login' : 'Signup'}</Button>
        </form>
        <ToggleButton onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Switch to Signup' : 'Switch to Login'}</ToggleButton>
      </FormBox>
    </Container>
  );
}