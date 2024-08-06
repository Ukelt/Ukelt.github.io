import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Import Axiosn
import { useNavigate } from 'react-router-dom';
import { isCookieSet } from './cookieCheck'; // Import the cookie checking function
import Cookies from 'js-cookie'; // Import the js-cookie library



function isValidEmail(email) {
  // This regex checks for a basic email format (contains "@" and ".")
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function UserProfile() {
  const cookies = Cookies.get('userCookie')
  const userUuid = cookies ? JSON.parse(cookies).uuid : null;
  console.log(userUuid)

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Track the current theme
  const [passwordError, setPasswordError] = useState('');


  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.style.setProperty('--bg-color', '#f0f0f0');
      document.documentElement.style.setProperty('--text-color', '#222');
      document.documentElement.style.setProperty('--container-bg', '#fff');
      document.documentElement.style.setProperty('--toggle-bg', '#c4c4c4');
      document.documentElement.style.setProperty('--toggle-thumb-bg', '#fff');
    } else {
      document.documentElement.style.setProperty('--bg-color', '#222');
      document.documentElement.style.setProperty('--text-color', '#fff');
      document.documentElement.style.setProperty('--container-bg', '#333');
      document.documentElement.style.setProperty('--toggle-bg', '#888');
      document.documentElement.style.setProperty('--toggle-thumb-bg', '#fff');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === 'password') {
      // Check password strength when the password field changes
      const passwordError = passStrengthCheck(value);
      // You can handle the password strength here, e.g., update a state variable
      // For this example, let's assume you have a state variable called `passwordStrength`
      setPasswordError(passwordError);
      checkRegistrationEnabled();

    }
    if (name === 'email') {
    handleEmailCheck();
    }

    if (name === 'username') {
      handleUsernameCheck();
    }
      // Check if email, password, and username are all valid

  };

  const passStrengthCheck = (password) => {
    if (password.length < 8) {
      return 'Too Short';
    } else if (!/[!@#$%^&*]/.test(password)) {
      return 'No Special Character';
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return 'Must contain an uppercase, lowercase, and a number';
    } else {
      return 'Strong';
    }
    
  };


  const handleEmailCheck = () => {
    axios.get(`http://localhost:3001/api/check-email`, {
      params: { email: formData.email },
      withCredentials: true  // Include credentials in the request
    })
      .then((response) => {
        console.log('Email to check:', formData.email);
        console.log('Response:', response.data.exists, 'Inverse:', !response.data.exists);
        setIsEmailValid(!response.data.exists);
      })
      .catch((error) => {
        console.error('Error checking email:', error);
      });
  };
  
  const handleUsernameCheck = () => {
    axios.get(`http://localhost:3001/api/check-username`, {
      params: { username: formData.username },
      withCredentials: true  // Include credentials in the request
    })
      .then((response) => {
        console.log('Username to check:', formData.username);
        console.log('Response:', response.data.exists, 'Inverse:', !response.data.exists);
        setIsUsernameValid(!response.data.exists);
      })
      .catch((error) => {
        console.error('Error checking username:', error);
      });
  };
  
  const checkRegistrationEnabled = useCallback(() => {
    const validEmail = isValidEmail(formData.email);
    const validPassword = passStrengthCheck(formData.password) === 'Strong';
    const validUsername = isUsernameValid;
  
    // Update isRegistrationEnabled based on all conditions
    setIsRegistrationEnabled(validEmail && validPassword && validUsername);
  
    // Console.log isRegistrationEnabled and all the variables it checks, with a new line for each
    console.log(
      'isRegistrationEnabled:',
      isRegistrationEnabled,
      '\nvalidEmail:',
      validEmail,
      '\nvalidPassword:',
      validPassword,
      '\nvalidUsername:',
      validUsername
    );
  }, [isUsernameValid, formData.email, formData.password]);
  

  useEffect(() => {
    checkRegistrationEnabled();
  }, [isEmailValid, isUsernameValid, formData.email, formData.password, isRegistrationEnabled, checkRegistrationEnabled]);
  

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Send a POST request to your backend API to create the user profile
    axios.post('http://localhost:3001/api/users', formData, { withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
    })
      .then((response) => {
        //Remove current cookie if exists 
        if(Cookies.get('userCookie')){
        Cookies.remove('userCookie')
        }
        // Handle success or display error messages
        console.log('Profile created:', response.data);
        console.log(response.data.username, response.data.uuid, response.data.role)
        //Create a cookie using the response data
        Cookies.set('userCookie', JSON.stringify({
          handle: response.data.handle, // Assuming the username is the handle
          uuid: response.data.uuid, // Use the actual response data key
          role: response.data.role, // Set the role to whatever is appropriate
          theme: isDarkMode ? 'dark' : 'light', // Set the theme to whatever is appropriate
        }), { expires: 30 });
        navigate(`/dashboard/${response.data.uuid}`);
      })
      .catch((error) => {
        console.log('Error creating profile:', error.response.data)
        console.error('Error:', error);
      });
  };
  

  return (
    <div className={`container ${isDarkMode ? 'dark' : 'light'} center w60`}>
      <div className="top-bar">
        <h1>SociArt</h1>
        <div className="theme-toggle">
          <label>Dark Mode</label>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleTheme}
            className="theme-toggle-checkbox"
          />
        </div>
      </div>
      <h2>Create Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            id="email"
            name="email"
            placeholder='email'
            value={formData.email}
            onChange={handleChange}
  //          onBlur={handleEmailCheck} // Check email availability on blur
            onKeyUp={handleEmailCheck}
          />
          {!formData.email ? (
            <div></div>
          ) : !isEmailValid ? (
            <div className={`error ${isDarkMode ? 'dark' : 'light'} `}>Email is already in use.</div> // Change this line
          ) : !isValidEmail(formData.email) ? (
            <div className={`error ${isDarkMode ? 'dark' : 'light'} `}>Email is not valid.</div>
          ) : (
            <div className={`success ${isDarkMode ? 'dark' : 'light'} `}>Email is available</div>
          )}
        </div>
        {isEmailValid ? (
          <>
            <div>
              <input
                type="password"
                id="password"
                name="password"
                placeholder='password'
                value={formData.password}
                onChange={handleChange}
                onKeyUp={handleChange}
              />
            </div>
            <div className={`password-strength ${isDarkMode ? 'dark' : 'light'} `}>
              {passwordError === 'Strong' ? (
                <span className={`success ${isDarkMode ? 'dark' : 'light'} `}>Strong</span>
              ) : (
                <span className={`error ${isDarkMode ? 'dark' : 'light'} `}>{passwordError}</span>
              )}
            </div>
            <div>
              <input
                type="text"
                id="username"
                name="username"
                placeholder='username'
                value={formData.username}
                onChange={handleChange}
 //               onBlur={handleUsernameCheck} // Check username availability on blur
                onKeyUp={handleUsernameCheck} // Check username availability on key up
              />
            {!formData.username ? (
            <div></div>
          ) : !isUsernameValid ? (
            <div className={`error ${isDarkMode ? 'dark' : 'light'} `}>Username is already taken</div> // Change this line
          ) : (
            <div className={`success ${isDarkMode ? 'dark' : 'light'} `}>Username is available</div>
          )}
            </div>
          </>
        ) : null}
        {isRegistrationEnabled ? (
          <button type="submit">Create Profile</button>
        ) : <div></div>}
      </form>
      <div>
        <a href="/login">Already have an account? Login here.</a>
      </div>
    </div>
  );
}

export default UserProfile;
