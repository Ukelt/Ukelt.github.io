import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './NewPost.css'; // Import the CSS file for styling

function NewPost() {
  console.log(Cookies.get('userCookie'))
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the userCookie exists
    const userCookie = Cookies.get('userCookie');
    const userUuid = userCookie ? JSON.parse(userCookie).uuid : null;

    if (userCookie && userUuid !== null) {
      // Construct the URL with the UUID
      console.log(userCookie)
      const postURL = `/dashboard/${userUuid}/newpost`;
      // Navigate to the dashboard with the UUID
      navigate(postURL);
    } else {
      // If the userCookie doesn't exist or doesn't have a UUID, navigate to the userprofile page
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    getSavedPost();
  }, []);

  useEffect(() => {
    const userCookie = Cookies.get('userCookie');
    const parsedCookie = JSON.parse(userCookie);
    const theme = parsedCookie.theme;
    if (theme === 'dark') {
      setIsDarkMode(false);
      toggleTheme();
    }
  }, []);




  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [newMedia, setNewMedia] = useState([]);




  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.style.setProperty('--bg-color', '#f0f0f0');
      document.documentElement.style.setProperty('--text-color', '#222');
      document.documentElement.style.setProperty('--container-bg', '#fff');
      document.documentElement.style.setProperty('--toggle-bg', '#c4c4c4');
      document.documentElement.style.setProperty('--toggle-thumb-bg', '#fff');
      document.documentElement.style.setProperty('--dashboard-bg', '#ffffffd6');
      document.documentElement.style.setProperty('--hover-bg', '#ddddddbb');
    } else {
      document.documentElement.style.setProperty('--bg-color', '#222');
      document.documentElement.style.setProperty('--text-color', '#fff');
      document.documentElement.style.setProperty('--container-bg', '#333');
      document.documentElement.style.setProperty('--toggle-bg', '#888');
      document.documentElement.style.setProperty('--toggle-thumb-bg', '#fff');
      document.documentElement.style.setProperty('--dashboard-bg', '#555');
      document.documentElement.style.setProperty(' --hover-bg', '#393939bb');
    }
  };

  const handleSelect = (e) => {

    const newFiles = Array.from(e.target.files);

    if (newFiles.length + selectedMedia.length > 4) {
      alert("Max 4 files!");
      setNewMedia([]);
      return;
    }

    setSelectedMedia(prev => [...prev, ...newFiles]);
    setNewMedia([]);


  };

  const removeMedia = (media) => {
    console.log(media)
    console.log(selectedMedia)
    setSelectedMedia(prev => {
      const updatedMedia = prev.filter(m => m !== media);
      return updatedMedia;
    });
  };


  const postLen = () => {
    //Save value in local storage
    var postText = document.getElementById('post').value;
    Cookies.set('postText', JSON.stringify({ text: postText }), { expires: 7 });
    var len = document.getElementById('post').value.length;
    document.getElementById('charLen').innerHTML = len + '/512';
  }
  const clearPost = () => {
    document.getElementById('post').value = '';
    Cookies.remove('postText');
    postLen();
  }
  const getSavedPost = () => {
    const savedPost = Cookies.get('postText');
    const parsedPost = savedPost ? JSON.parse(savedPost).text : null
    console.log(savedPost)
    document.getElementById('post').value = parsedPost;
    postLen();
  }


  const createPost = async () => {
    const postText = document.getElementById('post').value;

    try {
      const formData = new FormData();
      formData.append('text', postText);

      for (let i = 0; i < selectedMedia.length; i++) {
        formData.append('media', selectedMedia[i]);
      }

      // You need to replace '/api/createPost' with your actual backend API endpoint
      await axios.post('http://localhost:3001/api/createPost', formData, {withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },});

      // Clear the form after successful submission
      document.getElementById('post').value = '';
      Cookies.remove('postText');
      setSelectedMedia([]);
      postLen();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };
  return (

    //Container, it will have a sidebar on the left at 25% of the screen, a container with a dashboard that will take up 50% and another sidebar taking up the last 25%
    <div className='full-page'>
      <title>SociArt</title>
      <label>Dark Mode</label>
      <input
        type="checkbox"
        checked={isDarkMode}
        onChange={toggleTheme}
        className="theme-toggle-checkbox"
      />
      <div>
        <input id='post' type='textarea' maxLength={512} rows={8} cols={64}
          onChange={postLen}
        ></input>
        <span id='charLen'>0/512</span>
        <div className='imageUpload'>
          <input
            id='postBtn'
            type='file'
            accept='image/*,video/*'
            multiple
            hidden
            onChange={handleSelect}
            style={{ display: 'none' }} />
          <label htmlFor='postBtn'
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              padding: '8px 12px',
              cursor: 'pointer',
              position: 'absolute',
              bottom: '10%'
            }}>
            Add Image</label>
        </div>
        <button type='button'
          onClick={clearPost}>Clear</button>
        <button type='button'
          onClick={createPost}>Post</button>
      </div>
      <div className="media-preview"
        style={{ width: '50%', height: '25%' }}>
        {selectedMedia.map((media, index) => (
          <div key={index} className="media-container">
            <button className="close-button" onClick={() => removeMedia(media)}>
              X
            </button>
            <img src={URL.createObjectURL(media)} alt={`Preview ${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
export default NewPost