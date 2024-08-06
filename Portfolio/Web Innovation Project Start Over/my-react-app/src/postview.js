// PostDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './styles/postview.css'

function Post() {
    const navigate = useNavigate();
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Fetch post details

    const postId = window.location.pathname.split('/').pop();
    console.log(postId)
    axios.get(`http://localhost:3001/api/posts/${postId}/view`)
      .then(response => {
        setPost(response.data.post);
        const data = JSON.stringify(response.data)
        console.log('Data: ' + data)
        setComments(response.data.post.comments);
      })
      .catch(error => {
        console.error('Error fetching post:', error);
      });

  }, [postId]);


  const handleLogout = () => {
    // Implement the logout functionality here
    Cookies.remove('userCookie');
    navigate('/');
  };

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

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.style.setProperty('--bg-color', '#f0f0f0');
      document.documentElement.style.setProperty('--text-color', '#222');
      document.documentElement.style.setProperty('--container-bg', '#fff');
      document.documentElement.style.setProperty('--toggle-bg', '#c4c4c4');
      document.documentElement.style.setProperty('--toggle-thumb-bg', '#fff');
      document.documentElement.style.setProperty('--dashboard-bg', '#ffffffd6');
      document.documentElement.style.setProperty('--hover-bg', '#ddddddbb');
      document.documentElement.style.setProperty('--hover-text', '#bbbbbb');
    } else {
      document.documentElement.style.setProperty('--bg-color', '#222');
      document.documentElement.style.setProperty('--text-color', '#fff');
      document.documentElement.style.setProperty('--container-bg', '#333');
      document.documentElement.style.setProperty('--toggle-bg', '#888');
      document.documentElement.style.setProperty('--toggle-thumb-bg', '#fff');
      document.documentElement.style.setProperty('--dashboard-bg', '#555');
      document.documentElement.style.setProperty(' --hover-bg', '#393939bb');
      document.documentElement.style.setProperty('--hover-text', '#222');
    }
  }, [isDarkMode]);

  const handleSubmitComment = () => {
    // Send a request to add the new comment
    axios.post(`http://localhost:3001/api/posts/${postId}/new-comments`, { comment: newComment }, {withCredentials: true})
      .then(response => {
        window.location.reload();
        })
      .catch(error => {
        console.error('Error adding comment:', error);
      });
  };

  return (
    <div className='full-page'>
      <div className='topbar'>
        <h1>SociArt</h1>
        <input className='search-bar search-input' type='search' placeholder='Search' />
      </div>
      <button type='button' onClick={handleLogout}>Logout</button>
      <hr />
      <div className='container full-page'>
        <div className='sidebar'>
          <ul className='sidebar-menu'>
            <li className='sidebar-button'>
              <a href="/dashboard" className="sidebar-link">Feed</a>
            </li>
            <li className='sidebar-button'>
              <a href="/profile" className="sidebar-link">Profile</a>
            </li>
            <li className='sidebar-button'>
              <a href="/bookmarks" className="sidebar-link">Bookmarks</a>
            </li>
            <li className='sidebar-button'>
              <a href="/settings" className="sidebar-link">Settings</a>
            </li>
          </ul>
        </div>
        <div className='dashboard'>
          <div className='post-details'>
            {post && (
              <div className='post'>
                <div className='profile-picture-post'>
                <img
                        src={`../${post.profilePic}` || '../Profile/default.png'}
                        alt="Profile"
                        className="profile-picture-post"
                      />
                </div>
                <div>
                  <div className="username">{post.poster.username}</div>
                  <div className="handle">@{post.poster.handle}</div>
                </div>
                <div className='post-body'>
                  <p>{post.postText}</p>
                </div>
                </div>
            )}
                        <div className='add-comment'>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder='Add a comment...'
              />
              <button onClick={handleSubmitComment}>Submit</button>
            </div>
            <div className='comments'>
              <h2>Comments</h2>
              {comments.map((comment, index) => (
                <div key={index} className='comment'>
                    <div className='profile-picture-comment'>
                        <img
                        src={`../` + comment.profilePic}
                        alt="Profile"
                        className="profile-picture-comment"
                        />
                    <div>
                        <div className="username">{comment.username}</div>
                        <div className="handle">@{comment.handle}</div>
                    </div>
                    <div className='comment-body'>
                        <p>{comment.comment}</p>
                    </div>
                </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='sidebar'></div>
      </div>
    </div>
  );
}
export default Post;
