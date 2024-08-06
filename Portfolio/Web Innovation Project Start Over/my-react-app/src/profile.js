import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './profile.css'; // Import the CSS file for styling

function Profile() {
    const navigate = useNavigate();
    const [profileInfo, setProfileInfo] = useState(null);
    const [likedPosts, setLikedPosts] = useState([]);
    const [repostedPosts, setRepostedPosts] = useState([]); // New state for reposted posts
    const [activeTab, setActiveTab] = useState('likes'); // Default active tab is 'likes'
    const [activeIndex, setActiveIndex] = useState(1); // Default active index is 1

    useEffect(() => {
        const userCookie = Cookies.get('userCookie');
        const userUuid = userCookie ? JSON.parse(userCookie).uuid : null;

        if (userCookie && userUuid) {
            axios.get(`http://localhost:3001/api/profile?userId=${userUuid}`, { withCredentials: true })
                .then(response => {
                    setProfileInfo(response.data.profileData);
                })
                .catch(error => {
                    console.error('Error fetching profile info:', error);
                });

            // Fetch liked posts
            axios.get(`http://localhost:3001/api/liked-posts?userId=${userUuid}`, { withCredentials: true })
                .then(response => {
                    setLikedPosts(response.data.likedPostsData.map(post => ({
                        ...post,
                        isLiked: true // Add isLiked property to each post
                    })));
                })
                .catch(error => {
                    console.error('Error fetching liked posts:', error);
                });

            // Fetch reposted posts
            axios.get(`http://localhost:3001/api/reposted-posts?userId=${userUuid}`, { withCredentials: true })
                .then(response => {
                    setRepostedPosts(response.data.repostedPostsData.map(post => ({
                        ...post,
                        isReposted: true // Add isReposted property to each post
                    })));
                })
                .catch(error => {
                    console.error('Error fetching reposted posts:', error);
                });
        } else {
            navigate('/');
        }
    }, [navigate]);

    const handleProfileLink = (e, uuid) => {
        e.preventDefault(); // Prevent the default link behavior
        navigate(`/profile/${uuid}`);
    };

    const handleLogout = () => {
        Cookies.remove('userCookie');
        navigate('/');
    };

    const handleLike = async (postId, index) => {
        const newLikedPosts = [...likedPosts];
        const likedPost = newLikedPosts[index];
        const userCookie = Cookies.get('userCookie');
        const user = JSON.parse(userCookie);
        const userId = user.uuid;

        try {
            const response = await axios.post(
                `http://localhost:3001/api/posts/${postId}/like`,
                { userId, isLiked: !likedPost.isLiked },
                { withCredentials: true }
            );

            // Update like status in local state
            likedPost.isLiked = !likedPost.isLiked;
            likedPost.statistics.likes = response.data.likesCount;
            setLikedPosts(newLikedPosts);
        } catch (error) {
            console.error('Error updating like:', error);
        }
    };



    // Function to set the class for profile content based on the selected tab
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setActiveIndex({ likes: 1, reposts: 2, comments: 3 }[tab]); // Set active index based on the selected tab
    };

    const handleEditProfile = () => {
        toggleEditMode();
    };

    const [isEditMode, setIsEditMode] = useState(false);

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
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

    return (
        <div className={`full-page ${isDarkMode ? 'dark-theme' : ''}`}>
            <div className="topbar">
                <h1>SociArt</h1>
                <input className="search-bar search-input" type="search" placeholder="Search" />
                <button type="button" onClick={handleLogout}>Logout</button>
                <button type="button" onClick={toggleTheme}>Toggle Theme</button>
            </div>
            <hr />
            <div className="container full-page">
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
                <div className="dashboard">
                    {profileInfo && (
                        <>
                            <div className="profile-info">
                                <div className="banner-picture">
                                    <img src="../placeholder_image_url.jpg" alt="Banner" />
                                </div>
                                <div className="profile-picture">
                                    <img src="../placeholder_image_url.jpg" alt="Profile" />
                                </div>
                                {isEditMode ? (
                                    <>

                                        <input
                                            type="text"
                                            value={`${profileInfo.username}`}
                                            onChange={(e) =>
                                                setProfileInfo({ ...profileInfo, username: e.target.value.slice(1) })
                                            }
                                        />
                                        <textarea
                                            value={profileInfo.bio}
                                            onChange={(e) =>
                                                setProfileInfo({ ...profileInfo, bio: e.target.value })
                                            }
                                        />
                                        <button onClick={toggleEditMode}>Save</button>
                                    </>
                                ) : (
                                    <>
                                        <h2>@{profileInfo.handle}</h2>
                                        <p>{profileInfo.username}</p>
                                        <p>{profileInfo.bio}</p>
                                        <button onClick={handleEditProfile}>Edit Profile</button>
                                    </>
                                )}
                            </div>
                            <div className="profile-tabs">
                                <button
                                    className={activeTab === 'likes' ? 'active' : ''}
                                    onClick={() => handleTabChange('likes')}
                                >
                                    Likes
                                </button>
                                <button
                                    className={activeTab === 'reposts' ? 'active' : ''}
                                    onClick={() => handleTabChange('reposts')}
                                >
                                    Reposts
                                </button>
                                <button
                                    className={activeTab === 'comments' ? 'active' : ''}
                                    onClick={() => handleTabChange('comments')}
                                >
                                    Comments
                                </button>
                            </div>

                            <div className="profile-content" style={{ '--active-index': activeIndex }}>
                                {activeTab === 'likes' && (
                                    <div className="profile-likes">
                                        <h3>Likes</h3>
                                        {likedPosts.map((post, index) => (
                                            <div className="post" key={index}>
                                                <div className="post-header-left">
                                                    <div className="profile-picture-post">
                                                        <img
                                                            src={'../' + post.profilePic}
                                                            alt="Profile"
                                                            className="profile-picture-post"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="username">{post.poster.username}</div>
                                                        <div className="handle">@{post.poster.handle}</div>
                                                    </div>
                                                </div>
                                                <div className="post-body">
                                                    <p>{post.postText}</p>
                                                </div>
                                                <br></br>
                                                <div className='post-attachments'>
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
                                                <div className="post-footer">
                                                    <div className="post-footer-left">
                                                        <button
                                                            className={`post-button ${post.isLiked ? 'selected' : ''}`}
                                                            onClick={() => handleLike(post._id, index)}
                                                        >
                                                            <span role="img" aria-label="like">❤️</span> Like ({post.statistics.likes})
                                                        </button>
                                                        <button className={`post-button ${post.isReposted ? 'selected' : ''}`}>Repost</button>
                                                        <button className="post-button">Comment</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'reposts' && (
                                    <div className="profile-reposts">
                                        <h3>Reposts</h3>
                                        {repostedPosts.map((post, index) => (
                                            <div className="post" key={index}>
                                                <div className="post-header-left">
                                                    <div className="profile-picture-post">
                                                        <img
                                                            src={'../' + post.profilePic}
                                                            alt="Profile"
                                                            className="profile-picture-post"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="username">{post.poster.username}</div>
                                                        <div className="handle">@{post.poster.handle}</div>
                                                    </div>
                                                </div>
                                                <div className="post-body">
                                                    <p>{post.postText}</p>
                                                </div>
                                                <div className='post-attachments'>
                                                    {post.attachments.map((attachment, attachmentIndex) => {
                                                        let src;
                                                        if (attachment.url === null) {
                                                            return null;
                                                        } else if (attachment.url === undefined) {
                                                            src = `../placeholder_image_url.jpg`;
                                                        } else {
                                                            src = `../${attachment.url}`;
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
                                                <div className="post-footer">
                                                    <div className="post-footer-left">
                                                        <button
                                                            className={`post-button ${post.isLiked ? 'selected' : ''}`}
                                                            onClick={() => handleLike(post._id, index)}
                                                        >
                                                            <span role="img" aria-label="like">❤️</span> Like ({post.statistics.likes})
                                                        </button>
                                                        <button className="post-button selected">Repost</button>
                                                        <button className="post-button">Comment</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'comments' && (
                                    <div className="profile-comments">
                                        <h3>Comments</h3>
                                        {/* Display commented posts */}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <div className="sidebar">
                    {/* Sidebar content */}
                </div>
            </div>
        </div>
    );
}

export default Profile;
