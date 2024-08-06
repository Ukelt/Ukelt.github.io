import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import './styles/artpost.css';
import io from 'socket.io-client';


const ArtPost = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const canvasRef = useRef(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const userCookie = Cookies.get('userCookie');
  const user = userCookie ? JSON.parse(userCookie) : null;
  const [canvasData, setCanvasData] = useState(null);
  const [newComment, setNewComment] = useState('');

  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState('brush'); // 'brush'

  const isRoomOwner = roomUsers.some((user) => user.usersDetails.id === user.usersDetails.uuid);

  const roomUrlId = window.location.pathname.split('/').pop();
  const socket = io(`http://localhost:3001/artpost/${roomUrlId}`); // Replace with your server URL


  useEffect(() => {
    // Fetch room users and canvas data from the server
    const fetchRoomData = async () => {
      try {
        const roomId = window.location.pathname.split('/').pop();
        const response = await axios.get(`http://localhost:3001/api/rooms/${roomId}`, { withCredentials: true });
        console.log('Room data:', response.data);

        // Fetch user details for each user in the room
        const usersWithDetails = await Promise.all(
          response.data.map(async (user) => {
            const userDetails = await fetchUserDetails(user);
            console.log('User details:', userDetails);
            return userDetails;
          })
        );

        setRoomUsers(usersWithDetails);
        console.log('Room users:', usersWithDetails);
      } catch (error) {
        console.error('Error fetching room data:', error);
      }
    };
    fetchRoomData();
  }, [roomId]);

  useEffect(() => {
    const fetchCanvasData = async () => {
      try {
        const roomId = window.location.pathname.split('/').pop();
        const response = await axios.get(`http://localhost:3001/api/rooms/${roomId}/get-canvas`, { withCredentials: true });
        const canvasData = response.data.canvasData;
        setCanvasData(canvasData);
        loadCanvasData(canvasData);
      } catch (error) {
        console.error('Error fetching canvas data:', error);
      }
    };

    fetchCanvasData();
  }, [roomId]);

  const loadCanvasData = (data) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = data;
    img.onload = () => {
      context.drawImage(img, 0, 0);
    };
  };

  const fetchUserDetails = async (handle) => {
    try {
      const roomId = window.location.pathname.split('/').pop();
      const response = await axios.get(`http://localhost:3001/api/rooms/${roomId}/users/${handle}`, { withCredentials: true });
      console.log('User details:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (drawing) {
      context.strokeStyle = color;
      context.fillStyle = color;
      context.lineWidth = brushSize;
    }

    const handleMouseMove = (event) => {
      if (!drawing) return;
      const x = event.offsetX;
      const y = event.offsetY;
      switch (tool) {
        case 'brush':
          drawBrush(context, x, y);
          break;
        default:
          break;
      }
    };



    const handleMouseDown = (event) => {
      setDrawing(true);
      const x = event.offsetX;
      const y = event.offsetY;
      switch (tool) {
        case 'brush':
          context.beginPath();
          context.moveTo(x, y);
          break;
        default:
          break;
      }
    };

    const handleMouseUp = () => {
      if (tool === 'brush') {
        context.closePath();
      }
      setDrawing(false);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [drawing, brushSize, color, tool]);

  useEffect(() => {
    socket.on('drawing', (data) => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      context.strokeStyle = data.color;
      context.lineWidth = data.brushSize;
      context.beginPath();
      context.moveTo(data.prevX, data.prevY);
      context.lineTo(data.x, data.y);
      context.stroke();
    });

    return () => {
      socket.off('drawing');
    };
  }, []);

  const drawBrush = (context, x, y, prevX, prevY) => {
    context.lineTo(x, y);
    context.stroke();

    // Emit drawing data to the server
    socket.emit('drawing', {
      x,
      y,
      prevX,
      prevY,
      color,
      brushSize,
    });
  };

  const handleLogout = async () => {
    Cookies.remove('userCookie');
    navigate('/login');
  }

  const handleSelectUser = async (userId) => {
    try {
      const roomId = window.location.pathname.split('/').pop();
      await axios.post(`http://localhost:3001/api/rooms/${roomId}/invite`, { userId }, { withCredentials: true });
      console.log('User invited successfully');
      setSearchResults([]); // Clear search results after inviting user
      setSearchInput(''); // Clear search input
      // Fetch updated room users
      const response = await axios.get(`http://localhost:3001/api/rooms/${roomId}`, { withCredentials: true });
      setRoomUsers(response.data.users);
    } catch (error) {
      console.error('Error inviting user:', error);
    }
  };

  const handleSaveCanvas = async () => {
    const canvas = canvasRef.current;
    const canvasImage = canvas.toDataURL(); // Convert canvas to base64 image
    console.log(canvasImage)
    const roomId = window.location.pathname.split('/').pop();
    try {
      await axios.put(`http://localhost:3001/api/rooms/${roomId}/canvas`, { canvasImage }, { withCredentials: true });
      console.log('Canvas data saved successfully');
    } catch (error) {
      console.error('Error saving canvas data:', error);
    }
  };

  const handleSubmitPost = async () => {
    try {
      // Convert canvas data to image and get the JPEG data
      const jpegData = await handleCanvasToImage();
  
      // Create post with canvas image as attachment
      const response = await axios.post(
        `http://localhost:3001/api/createArtPost`,
        {
          postText: newComment, // Add the comment as post text
          canvasData: jpegData // Send jpegData as canvasData in the request body
        },
        { withCredentials: true }
      );
  
      console.log('Post created successfully:', response.data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };
  
  const handleCanvasToImage = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  
    // Create a new canvas element with the same dimensions
    const newCanvas = document.createElement('canvas');
    const newContext = newCanvas.getContext('2d');
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
  
    // Set background color (optional)
    newContext.fillStyle = '#ffffff'; // White background
    newContext.fillRect(0, 0, newCanvas.width, newCanvas.height);
  
    // Put the image data onto the new canvas
    newContext.putImageData(imageData, 0, 0);
  
    // Convert canvas to JPEG
    const jpegData = newCanvas.toDataURL('image/jpg', 0.9); // Quality set to 90%
    console.log('JPEG data:', jpegData);
  
    return jpegData; // Return the JPEG data
  };

  const handleSearchUser = async (e) => {
    try {
      const searchInput = e.target.value;
      setSearchResults([]); // Clear previous search results
      if (searchInput) {
        const response = await axios.get(`http://localhost:3001/api/users/${searchInput}`, { withCredentials: true });
        setSearchResults(response.data.users); // Update searchResults state with response data
      }
    } catch (error) {
      console.error('Error searching for users:', error);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await axios.delete(`/api/rooms/${roomId}/remove/${userId}`, { withCredentials: true });
      console.log('User removed successfully');
      // Fetch updated room users
      const response = await axios.get(`/api/rooms/${roomId}`, { withCredentials: true });
      setRoomUsers(response.data.users);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  return (
    <div className='full-page'>
      <div className='topbar'>
        <h1>SociArt</h1>


        <button type='button' onClick={handleLogout}>Logout</button>
      </div>
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
          <h1>Art Post</h1>
          <div>
            <h2>Room Users</h2>
            <div className='room-users-container'>
              {roomUsers.map((user) => (
                <div key={user.usersDetails.id} className='room-user-item'>
                  <img src={`../${user.usersDetails.profilePic || 'Profile/default.png'}`} alt={user.usersDetails.username} />
                  <div>
                    <p>{user.usersDetails.username}</p>
                    <p>@{user.usersDetails.handle}</p>
                  </div>
                  {user.usersDetails.id !== user.usersDetails.uuid && (
                    <button onClick={() => handleRemoveUser(user.usersDetails.id)}>Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <input type='text' value={searchInput} onChange={handleSearchUser} placeholder='Search users...' />
          <div className='search-results-container'>
            {searchResults.map((user) => (
              <div key={user.id} className='search-result-item'>
                <img src={`../${user.profilePic || 'Profile/default.png'}`} alt={user.username} />
                <div>
                  <p>{user.username}</p>
                  <p>@{user.handle}</p>
                </div>
                <button onClick={() => handleSelectUser(user.id)}>Invite</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2>Canvas</h2>
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            style={{ border: '1px solid black', cursor: `url(${getCursor(brushSize)}) ${brushSize / 2} ${brushSize / 2}, auto` }}
          />
          <div>
            <label>Brush Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
            />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          {isRoomOwner && <button onClick={handleSaveCanvas}>Save Progress</button>}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder='Add a comment...'
          />
          <button onClick={handleSubmitPost}>Submit Post</button>
        </div>
      </div>
    </div>
  );
};

const getCursor = (size) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = size;
  canvas.height = size;
  context.beginPath();
  context.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  context.fill();
  return canvas.toDataURL();
};

export default ArtPost;
