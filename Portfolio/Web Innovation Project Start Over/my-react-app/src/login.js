import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/login', { email, password }, {withCredentials: true});

      // Assuming the backend returns a user object upon successful login
      const user = response.data.user;

      // Save user data to cookies or state for authentication
      // ...

      // Redirect to the user's dashboard or any other page
      navigate(`/dashboard/${user.uuid}`);
    } catch (error) {
      console.error('Login failed:', error);

      // Handle login failure (e.g., show an error message)
      // ...
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button onClick={handleLogin}>Login</button>
      </div>
      <div>
        <a href="/">Don't have an account? Register here.</a>
      </div>
    </div>
  );
}

export default Login;
