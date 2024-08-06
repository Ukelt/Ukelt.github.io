import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './settings.css';

function Settings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [userRooms, setUserRooms] = useState([]);
    const [userInvitations, setUserInvitations] = useState([]);

    useEffect(() => {
        const userCookie = Cookies.get('userCookie');
        const parsedCookie = JSON.parse(userCookie);
        const theme = parsedCookie.theme;
        if (theme === 'dark') {
            setIsDarkMode(true);
            toggleTheme();
        }

        // Fetch user's rooms and invitations
        fetchUserRooms();

        // Check if the userCookie exists
        const userUuid = userCookie ? parsedCookie.uuid : null;
        if (userCookie && userUuid !== null) {
            // Construct the URL with the UUID
            const dashboardURL = `../settings`;
            // Navigate to the dashboard with the UUID
            navigate(dashboardURL);
        } else {
            // If the userCookie doesn't exist or doesn't have a UUID, navigate to the userprofile page
            navigate('/');
        }
    }, [navigate]);

    // Function to fetch user's rooms
    const fetchUserRooms = async () => {
        const userCookie = Cookies.get('userCookie');
        const parsedCookie = JSON.parse(userCookie);
        try {
            const response = await axios.get(`http://localhost:3001/api/user/${parsedCookie.uuid}/rooms`, { withCredentials: true });
            setUserRooms(response.data.roomsArr);
            console.log(response.data.roomsArr);
            // Extract user invitations from user's rooms
            const invitations = response.data.roomsArr.filter(room => room.invitedUsers.includes(parsedCookie.handle));
            setUserInvitations(invitations);
            console.log(invitations);
        } catch (error) {
            console.error('Error fetching user rooms:', error);
        }
    };

    const acceptInvitation = async (roomId) => {
        try {
            // Make a request to your backend API to accept the invitation
            const userCookie = Cookies.get('userCookie');
            const parsedCookie = JSON.parse(userCookie);
            await axios.post(`http://localhost:3001/api/user/${parsedCookie.uuid}/rooms/${roomId}/accept-invitation`, {}, { withCredentials: true });

            // Update user rooms and invitations after accepting invitation
            await fetchUserRooms();
        } catch (error) {
            console.error('Error accepting invitation:', error);
        }
    };

    const denyInvitation = async (roomId) => {
        try {
            // Make a request to your backend API to deny the invitation
            const userCookie = Cookies.get('userCookie');
            const parsedCookie = JSON.parse(userCookie);
            await axios.post(`http://localhost:3001/api/user/${parsedCookie.uuid}/rooms/${roomId}/deny-invitation`, {}, { withCredentials: true });

            // Update user rooms and invitations after denying invitation
            await fetchUserRooms();
        } catch (error) {
            console.error('Error denying invitation:', error);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);

        // Get the existing userCookie
        const userCookie = Cookies.get('userCookie');

        if (userCookie) {
            // Parse the cookie value to an object
            const parsedCookie = JSON.parse(userCookie);

            // Update the theme property
            parsedCookie.theme = isDarkMode ? 'dark' : 'light';

            // Convert the updated object back to a string
            const updatedCookieValue = JSON.stringify(parsedCookie);
            const userUuid = parsedCookie.uuid;
            const theme = parsedCookie.theme;

            // Set the new cookie value
            Cookies.set('userCookie', updatedCookieValue);
            console.log('Theme update request sending...');
            axios.put(`http://localhost:3001/api/${userUuid}/update-theme/${theme}`, {withCredentials: true})
                .then(response => {
                    console.log(response.data.message);
                })
                .catch(error => {
                    console.error('Error updating theme:', error);
                });
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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettings />;
            case 'notifications':
                return <NotificationSettings />;
            case 'appearance':
                return <AppearanceSettings toggleTheme={toggleTheme} isDarkMode={isDarkMode} />;
            case 'rooms':
                return <RoomsSettings userRooms={userRooms} userInvitations={userInvitations} acceptInvitation={acceptInvitation} denyInvitation={denyInvitation} navigate={navigate} />;
            default:
                return null;
        }
    };

    return (
        <div className="full-page">
            <div className="topbar">
                <h1>SociArt</h1>
                <input className="search-bar search-input" type="search" placeholder="Search" />
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
                    <h1>Settings</h1>
                    <div className="settings-menu">
                        <button
                            className={`settings-button ${activeTab === 'general' ? 'active' : ''}`}
                            onClick={() => handleTabChange('general')}
                        >
                            General
                        </button>
                        <button
                            className={`settings-button ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => handleTabChange('notifications')}
                        >
                            Notifications
                        </button>
                        <button
                            className={`settings-button ${activeTab === 'appearance' ? 'active' : ''}`}
                            onClick={() => handleTabChange('appearance')}
                        >
                            Appearance
                        </button>
                        <button
                            className={`settings-button ${activeTab === 'rooms' ? 'active' : ''}`}
                            onClick={() => handleTabChange('rooms')}
                        >
                            Rooms
                        </button>
                    </div>
                </div>

                <div className="sidebar">
                    <div className="settings-tab-content">{renderTabContent()}</div>
                </div>
            </div>
        </div>
    );
}

// Components for each settings tab
const GeneralSettings = () => {
    // Render general settings options
    return <div>General Settings</div>;
};

const NotificationSettings = () => {
    // Render notification settings options
    return <div>Notification Settings</div>;
};

const AppearanceSettings = ({ toggleTheme, isDarkMode }) => {
    // Render appearance settings options
    return (
        <div>
            <h2>Appearance Settings</h2>
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
    );
};

// Component to render rooms settings
const RoomsSettings = ({ userRooms, userInvitations, acceptInvitation, denyInvitation, navigate }) => {
    return (
        <div>
            <h2>Rooms Settings</h2>
            <h3>Your Rooms</h3>
            <ul>
                {userRooms.map(room => (
                    <li key={room._id}>
                        {room.name} - <button onClick={() => {
                            const artPostURL = `../artpost/${room._id}`;
                            navigate(artPostURL);
                        }}>Join</button>
                    </li>
                ))}
            </ul>
            <h3>Invitations</h3>
            {userInvitations.length > 0 ? (
                <ul>
                    {userInvitations.map(room => (
                        <li key={room._id}>
                            {room.name} - <button onClick={() => acceptInvitation(room._id)}>Accept</button>
                            <button onClick={() => denyInvitation(room._id)}>Deny</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No invitations</p>
            )}
        </div>
    );
};

export default Settings;
