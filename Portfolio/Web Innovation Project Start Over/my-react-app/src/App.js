import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Switch } from 'react-router-dom';
import UserProfile from './userprofile';
import LoginPage from './login';
import DashboardPage from './dashboard';
import NewPost from './post'
import Profile from './profile';
import Settings from './settings';
import ArtPost from './artpost';
import Post from './postview';
import OtherProfile from './otherprofile';

function App() {
  return (
    <Router>
      <div className="App">


        {/* Route Configuration */}
        <Routes>
          <Route path="/login" element={<LoginPage/>}>
          </Route>
          <Route path="/dashboard/:uuid" element={<DashboardPage/>} />
          <Route path="/dashboard" element={<DashboardPage/>}>
          </Route>
          <Route path="/dashboard/:uuid/newpost" element={<NewPost/>}>
          </Route>
          <Route path="/artpost/:roomid" element={<ArtPost/>}>
            </Route>
          <Route path="/" element={<UserProfile/>}>
          </Route>
          <Route path="/post/view/:postId" element={<Post/>}>
          </Route>
          <Route path="profile/" element={<Profile/>}>
          </Route>
          <Route path="/profile/:uuid" element={<OtherProfile/>}>
          </Route>
          <Route path="/profile" element={<Profile/>}>
          </Route>
          <Route path="/settings" element={<Settings/>}>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
