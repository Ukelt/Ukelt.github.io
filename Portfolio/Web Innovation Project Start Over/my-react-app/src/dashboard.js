import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import './dashboard.css'; // Import the CSS file for styling

function Dashboard() {
  // console.log(Cookies.get('userCookie'))
  const navigate = useNavigate();
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Check if the userCookie exists
    const userCookie = Cookies.get('userCookie');
    const userUuid = userCookie ? JSON.parse(userCookie).uuid : null;

    if (userCookie && userUuid !== null) {
      // Construct the URL with the UUID
      //   console.log(userCookie)
      const dashboardURL = `/dashboard/${userUuid}`;
      getRecommendedPosts();
      // Navigate to the dashboard with the UUID
      navigate(dashboardURL);
      //Text axios
      axios.get(`http://localhost:3001/api/test`, { withCredentials: true }
      ).then((response) => {
        console.log('Response:', response);
      }).catch((error) => {
        console.error('Error fetching test:', error);
      });
    } else {
      // If the userCookie doesn't exist or doesn't have a UUID, navigate to the userprofile page
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(updatePostLikesAndReposts, 30000); // Update likes and reposts every 30 seconds
    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, []);

  function getRecommendedPosts() {
    const userCookie = Cookies.get('userCookie');
    const user = JSON.parse(userCookie);
    const userId = user.uuid;

    axios.get(`http://localhost:3001/api/recommended-posts?userId=${userId}`, { withCredentials: true })
      .then((response) => {
        const recommendedPosts = response.data.recommendedPosts.map(post => ({
          ...post,
          selectedLike: post.postLikes.includes(userId),
          selectedRepost: post.postReposts.includes(userId)
        }));
        setRecommendedPosts(recommendedPosts);
      })
      .catch((error) => {
        console.error('Error fetching recommended posts:', error);
      });
  }

  function updatePostLikesAndReposts() {
    const userCookie = Cookies.get('userCookie');
    const user = JSON.parse(userCookie);
    const userId = user.uuid;

    recommendedPosts.forEach((post, index) => {
      axios.get(`http://localhost:3001/api/posts/${post._id}/likes`, { withCredentials: true })
        .then(response => {
          const likes = response.data.likes || [];
          const isLiked = likes.includes(userId);
          setRecommendedPosts(prevPosts => {
            const updatedPosts = [...prevPosts];
            updatedPosts[index].selectedLike = isLiked;
            updatedPosts[index].statistics.likes = likes.length;
            return updatedPosts;
          });
        })
        .catch(error => {
          console.error('Error fetching post likes:', error);
        });

      axios.get(`http://localhost:3001/api/posts/${post._id}/reposts`, { withCredentials: true })
        .then(response => {
          const reposts = response.data.reposts || [];
          const isReposted = reposts.includes(userId);
          setRecommendedPosts(prevPosts => {
            const updatedPosts = [...prevPosts];
            updatedPosts[index].selectedRepost = isReposted;
            updatedPosts[index].statistics.reposts = reposts.length;
            return updatedPosts;
          });
        })
        .catch(error => {
          console.error('Error fetching post reposts:', error);
        });
    });
  }


  const handleLogout = () => {
    // Implement the logout functionality here
    Cookies.remove('userCookie');
    navigate('/');
  };

  const handleSelect = (e, type, index) => {
    e.stopPropagation();
    const newPosts = [...recommendedPosts];
    const selectedPost = newPosts[index];
    const userCookie = Cookies.get('userCookie');
    const user = JSON.parse(userCookie);
    const userId = user.uuid;

    if (type === 'like') {
      const isLiked = !selectedPost.postLikes.includes(userId);
      selectedPost.statistics.likes += isLiked ? 1 : -1;

      // Send a request to the server to create or remove the like
      axios.post(`http://localhost:3001/api/posts/${selectedPost._id}/like`, { userId, isLiked }, { withCredentials: true })
        .then((response) => {
          console.log('Like updated:', response.data);
          // Update the like status in the local state
          if (isLiked) {
            selectedPost.postLikes.push(userId);

          } else {
            selectedPost.postLikes = selectedPost.postLikes.filter(id => id !== userId);
          }
          selectedPost.selectedLike = isLiked;
          setRecommendedPosts(newPosts);
        })
        .catch((error) => {
          console.error('Error updating like:', error);
        });
    } else if (type === 'repost') {
      const isReposted = !selectedPost.postReposts.includes(userId);
      selectedPost.statistics.reposts += isReposted ? 1 : -1;
      // Send a request to the server to create or remove the repost
      axios.post(`http://localhost:3001/api/posts/${selectedPost._id}/repost`, { userId, isReposted }, { withCredentials: true })
        .then((response) => {
          console.log('Repost updated:', response.data);
          // Update the repost status in the local state
          if (isReposted) {
            selectedPost.postReposts.push(userId);
          } else {
            selectedPost.postReposts = selectedPost.postReposts.filter(id => id !== userId);
          }
          selectedPost.selectedRepost = isReposted;
          setRecommendedPosts(newPosts);
        })
        .catch((error) => {
          console.error('Error updating repost:', error);
        });
    }
  };

  // Function to update post data on the server
  const updatePost = (postId, postData) => {
    axios.put(`http://localhost:3001/api/posts/${postId}`, postData, { withCredentials: true })
      .then((response) => {
        console.log('Post updated successfully:', response);
      })
      .catch((error) => {
        console.error('Error updating post:', error);
      });
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


  // Function to create a room for art post
  const handleCreateArtPostRoom = () => {
    // Make a request to the backend to create a room
    axios.post('http://localhost:3001/api/rooms', { type: 'art' }, { withCredentials: true })
      .then(response => {
        console.log('Room created successfully:', response.data);
        // Navigate to the newly created room
        navigate(`../artpost/${response.data.roomId}`);
      })
      .catch(error => {
        console.error('Error creating room:', error);
      });
  };

  const handleSearchUser = async (e) => {
    try {
      const searchInput = e.target.value;
      setSearchResults([]); // Clear previous search results
      if (searchInput) {
        const response = await axios.get(`http://localhost:3001/api/users/${searchInput}`, { withCredentials: true });
        setSearchResults(response.data.users.slice(0, 10)); // Limit search results to the first 10 options
      }
    } catch (error) {
      console.error('Error searching for users:', error);
    }
  };

  return (

    //Container, it will have a sidebar on the left at 25% of the screen, a container with a dashboard that will take up 50% and another sidebar taking up the last 25%
    <div className='full-page'>
      <div className='topbar' style={{ position: 'relative' }}>
        <h1>SociArt</h1>
        <input className='search-bar search-input' type='search' placeholder='Search' onChange={handleSearchUser} />
        {searchResults.length > 0 && (
          <div className='search-results'>
            {searchResults.map(user => (
                <a href={`/profile/${user.id}`} className="search-result" key={user._id}>
              <div className='search-result' key={user._id}>
                <img className='profile-picture' src={user.profilePic} alt="Profile" />
                <div className='user-info'>
                  <p className='username'>{user.username}</p>
                  <p className='handle'>@{user.handle}</p>
                </div>
              </div>
              </a>
            ))}
          </div>
        )}
      </div>


      <button type='button' onClick={handleLogout}>Logout</button>
      <hr />
      <div className='container full-page'>
        <div className='sidebar'>
          <ul className='sidebar-menu'>
            <li className='sidebar-button'>
              <a href="../dashboard" className="sidebar-link">Feed</a>
            </li>
            <li className='sidebar-button'>
              <a href="../profile" className="sidebar-link">Profile</a>
            </li>
            <li className='sidebar-button'>
              <a href="../bookmarks" className="sidebar-link">Bookmarks</a>
            </li>
            <li className='sidebar-button'>
              <a href="../settings" className="sidebar-link">Settings</a>
            </li>
          </ul>
        </div>

        <div className='dashboard'>
          <h1>Dashboard</h1>
          <option hidden>
            Select post type
          </option>
          <option>
            <button
              type='button'
              onClick={() => {
                const createPostURL = './newpost';
                navigate(createPostURL);
              }}
            >
              Create Post
            </button>
          </option>
          <option>
            <button
              type='button'
              onClick={handleCreateArtPostRoom}
            >
              Create Art Post
            </button>
          </option>
          <hr />
          <div className='dashboard-content'>
            {recommendedPosts.map((post, index) => {
              return (
                <div className='post' key={index}
                  onClick={() => navigate(`/post/view/${post._id}`)}>
                  <div className='post-header'>
                    <div className="profile-picture-post">
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
                  </div>
                  <div className='post-body'>
                    <p>{post.postText}</p>
                  </div>
                  <br></br>
                  <div className='post-attachment-container'>
                    {post.attachments.map((attachment, attachmentIndex) => {
                      // Log the attachment and its URL
                      console.log("Attachment:", attachment);
                      console.log("Attachment URL:", attachment.url);

                      let src;
                      // Check if attachment.url is null or undefined
                      if (attachment.url === null) {
                        console.log("Null or undefined URL detected for attachment:", attachment);
                        return null; // Skip rendering this image
                      } else if (attachment.url === undefined) {
                        src = `../placeholder_image_url.jpg`;
                      } else {
                        src = `../${attachment.url}`;
                        console.log("Image source:", src); // Log the src attribute
                      }
                      return (
                        <img
                          className='post-attachment'
                          key={attachmentIndex}
                          src={src}
                          alt={`Attachment ${attachmentIndex}`}
                        />
                      );
                    })}
                  </div>
                  <div className='post-footer'>
                    <div className='post-footer-left'>
                      <button className={`post-button ${post.selectedLike ? 'selected' : ''}`} onClick={(e) => handleSelect(e, 'like', index)}>
                        <span role="img" aria-label="like">❤️</span> Like ({post.statistics.likes})
                      </button>
                      <button className={`post-button ${post.selectedRepost ? 'selected' : ''}`} onClick={(e) => handleSelect(e, 'repost', index)}>
                        <span role="img" aria-label="repost">🔄</span> Repost ({post.statistics.reposts})
                      </button>
                      <button className={`post-button ${post.selectedComment ? 'selected' : ''}`} onClick={() => handleSelect('comment', index)}>
                        <span role="img" aria-label="comment">💬</span> Comment
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className='sidebar'>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
