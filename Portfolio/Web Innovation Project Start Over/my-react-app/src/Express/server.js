const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const path = require('path');
const ipinfo = require('ipinfo');
const requestIp = require('request-ip');
const fs = require('fs');
const { profile } = require('console');


const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(requestIp.mw())

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors({
  origin: 'http://localhost:3000',  // Allow requests from this origin
  methods: 'GET,POST,PUT',  // Allow these HTTP methods
  allowedHeaders: 'Content-Type',  // Allow these headers
  credentials: true  // Allow cookies and other credentials to be included in the request
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your client's URL
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT'); // Add PUT method
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});


app.use((req, res, next) => {
  console.log("Request received:", req.url);
  next();
});


const uri = 'mongodb://127.0.0.1:27017/';
const dbName = 'WebInnoProj';

//Post route
app.post('/api/users', async (req, res) => {
  console.log('Received POST to /api/users');
  const { email, password, username } = req.body;

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('users');
    const saltRounds = 10;
    const plaintextPassword = password;
    const hashedPassword = await bcrypt.hash(plaintextPassword, saltRounds);

    const newUser = {
      id: uuidv4(),
      email: email,
      password: hashedPassword,
      role: 'user',
      handle: username,
      username: username
    };

    await collection.insertOne(newUser);
    client.close();

    res.json({
      created: true,
      handle: newUser.handle,
      role: newUser.role,
      uuid: newUser.id
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/users/:handle', async (req, res) => {
  console.log('Received GET to /api/users');
  const handle = req.params.handle;
  console.log(handle)
  try {

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('users');

    const users = await collection.find({ handle: { $regex: handle, $options: 'i' } }).toArray();
    client.close();
    console.log('Users:', users)

    res.json({ users });
  } catch (error) {
    console.error('Error searching for users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post('/api/createPost', upload.fields([{ name: 'media', maxCount: 4 }]), async (req, res) => {
  console.log('Received POST to /api/createPost');
  // Get user data from cookies
  const userCookie = req.cookies.userCookie;
  const user = JSON.parse(userCookie);



  //Get username from database based on user.uuid
  const client1 = new MongoClient(uri);
  await client1.connect();
  const db1 = client1.db(dbName);
  const users = db1.collection('users');
  const userQuery = await users.findOne({ id: user.uuid });
  client1.close();
  let username = userQuery.username;


  const userFolder = path.join(__dirname, '../../public/Uploads', user.uuid);
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder);
  }

  const clientIp = requestIp.getClientIp(req);
  const locationData = await ipinfo(clientIp);
  console.log(locationData)
  // Create post object
  const newPost = {
    _id: uuidv4(),
    userId: user.uuid,
    postText: req.body.text,
    poster: {
      handle: user.handle,
      // Get username from database based on user.uuid
      username: username,


    },
    timestamp: new Date(),
    location: {
      city: locationData.city,
      region: locationData.region,
      country: locationData.country

    },
    statistics: {
      views: 0,
      reposts: 0,
      likes: 0
    },
    attachments: []
    ,
    comments: [
      {id:'' ,
      comment: ''
      }
    ]
  };
  // Save media files to the user's folder and generate unique filenames
  if (req.files && req.files.media) {
    req.files.media.forEach((file, index) => {
      // Create a folder for the post based on its UUID
      const postFolder = path.join(userFolder, newPost._id);
      if (!fs.existsSync(postFolder)) {
        fs.mkdirSync(postFolder);
      }


      const fileName = `${file.originalname}`;
      const filePath = path.join(postFolder, fileName);

      fs.writeFileSync(filePath, file.buffer);

      newPost.attachments.push({
        attachmentType: file.mimetype.includes('image') ? 'image' : file.mimetype.includes('video') ? 'video' : 'file',
        url: path.join(__dirname + '/Uploads', user.uuid, 'posts', newPost._id, fileName)
      });
    });
  }
  // Save to MongoDB
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const posts = db.collection('posts');
  await posts.insertOne(newPost);

  client.close();

  res.json({
    message: 'Post created successfully'
  });

});

app.post('/api/createArtPost', async (req, res) => {
  console.log('Received POST to /api/createPost');
  // Get user data from cookies
  const userCookie = req.cookies.userCookie;
  const user = JSON.parse(userCookie);
  console.log('Data URL:' + JSON.stringify(req.body));

  // Get username from database based on user.uuid
  const client1 = new MongoClient(uri);
  await client1.connect();
  const db1 = client1.db(dbName);
  const users = db1.collection('users');
  const userQuery = await users.findOne({ id: user.uuid });
  client1.close();
  let username = userQuery.username;

  const userFolder = path.join(__dirname, '../../public/Uploads', user.uuid);
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder);
  }

  const clientIp = requestIp.getClientIp(req);
  const locationData = await ipinfo(clientIp);
  console.log(locationData);

  // Create post object
  const newPost = {
    _id: uuidv4(),
    userId: user.uuid,
    postText: req.body.postText,
    poster: {
      handle: user.handle,
      username: username,
    },
    timestamp: new Date(),
    location: {
      city: locationData.city,
      region: locationData.region,
      country: locationData.country
    },
    statistics: {
      views: 0,
      reposts: 0,
      likes: 0
    },
    attachments: [
      {
        attachmentType: 'image',
        url: '' // Placeholder for now, we'll save the image to disk later
      }
    ],
    comments: [
      {
        id: '',
        comment: ''
      }
    ]
  };

  const postFolder = path.join(userFolder, newPost._id);
  if (!fs.existsSync(postFolder)) {
    fs.mkdirSync(postFolder);
  }

  // Write canvas data to file
  const fileName = `artpost_${user.uuid}_${newPost._id}.jpg`;
  const filePath = path.join(postFolder, fileName);
  const data = req.body.canvasData.replace(/^data:image\/\w+;base64,/, '');
  const buf = Buffer.from(data, 'base64');
  fs.writeFileSync(filePath, buf);
  console.log(filePath)

  // Update the URL in the post object
  newPost.attachments[0].url = filePath;

  // Save to MongoDB
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const posts = db.collection('posts');
  await posts.insertOne(newPost);

  client.close();

  res.json({
    message: 'Post created successfully'
  });
});

app.get('/api/users/:searchInput', async (req, res) => {
  console.log('Received GET to /api/users/searchInput');
  const { searchInput } = req.query;

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('users');

    const users = await collection.find({ $or: [{ username: { $regex: searchInput, $options: 'i' } }, { handle: { $regex: query, $options: 'i' } }] }).toArray();
    
    client.close();

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/images/:imageId', (req, res) => {

  const imageId = req.params.imageId;

  // Lookup image path for id from DB or filesystem

  const imagePath = getImagePath(imageId);

  res.sendFile(imagePath);
});

app.get('/api/test', async (req, res) => {
  console.log('Received GET to /api/test');
  res.json({ message: 'Test successful' });
});

app.put('/api/:userId/update-theme/:theme', async (req, res) => {
  console.log('Request params:', req.params);
  console.log('Theme update request received...');

  try {

    const userId = req.params.userId;
    console.log('User ID:', userId);

    const theme = req.params.theme;
    console.log('Theme:', theme);

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const users = db.collection('users');

    // Update the user's theme in the database
    const result = await users.updateOne({ id: userId }, { $set: { theme } });
    console.log('Update Result:', result);

    client.close();
    console.log('MongoDB connection closed');

    res.json({ message: 'Theme updated successfully', result });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/recommended-posts', async (req, res) => {
  console.log('Received GET to /api/recommended-posts');
  const userId = req.query.userId;

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const posts = db.collection('posts');
    const postLikes = db.collection('postLikes');
    const postReposts = db.collection('postReposts');
    const users = db.collection('users');

    const recommendedPosts = await posts.find({ userId: { $ne: userId } }).toArray();

    // Fetch like and repost information for each post
    for (const post of recommendedPosts) {
      const likes = await postLikes.find({ postId: post._id }).toArray();
      const reposts = await postReposts.find({ postId: post._id }).toArray();

      post.postLikes = likes.map(like => like.userId);
      post.postReposts = reposts.map(repost => repost.userId);

      // Fetch user data for the post
      const user = await users.findOne({ id: post.userId });
      if (user && user.profile && user.profile.profilePic) {
        post.profilePic = user.profile.profilePic;
      } else {
        post.profilePic = 'Profile/default.jpg'; // Assign a default profile picture if none is found
      }
    }

    client.close();

    res.json({ recommendedPosts });
  } catch (error) {
    console.error('Error fetching recommended posts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/check-email', async (req, res) => {
  const { email } = req.query;
  console.log(email)

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB')

    const db = client.db(dbName);
    const collection = db.collection('users');
    console.log('Found Collected')

    console.log('Querying for email:', email);
    const user = await collection.findOne({ email: email });
    console.log('Found User')
    client.close();
    console.log('Closed Client')

    if (user) {
      res.json({ exists: true });
      console.log('Email Exists')
    } else {
      res.json({ exists: false });
      console.log('Email Does Not Exist')
    }
  } catch (error) {
    console.error('Error checking email:', error);
    console.log('Error Checking Email', error)
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/check-username', async (req, res) => {
  const { username } = req.query;

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('users');

    console.log('Querying for username:', username);
    const user = await collection.findOne({ handle: username });
    client.close();

    if (user) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route handler to fetch profile data based on user UUID
app.get('/api/profile', async (req, res) => {
  const id = req.query.userId;
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('users');
    console.log(id); // Add this line for debugging
    console.log('Querying for user:', id); // Add this line for debugging
    const user = await collection.findOne({ id });
    console.log('Retrieved user:', user); // Add this line for debugging
    client.close();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const profileData = {
      profilePicture: user.profile.profilePic,
      bannerPicture: user.profile.bannerPic,
      username: user.username,
      handle: user.handle,
      bio: user.profile.bio || 'Add description here'
    };
    res.json({ profileData });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/login', async (req, res) => {
  console.log('Received POST to /api/login');
  const { email, password } = req.body;

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('users');

    // Find user by email
    const user = await collection.findOne({ email });

    // Check if user exists
    if (!user) {
      client.close();
      return res.status(404).json({ error: 'User not found' });
    }
    let BcryptCom = await bcrypt.hash(password, 10)
    console.log('Password:' + user.password + '\nBcrypt: ' + BcryptCom)
    // Compare hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);

    // Check if password is valid
    if (!isValidPassword) {
      client.close();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Set user data in cookies
    res.cookie('userCookie', JSON.stringify({ uuid: user.id, handle: user.handle, role: user.role, theme: user.theme }), { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    // Close MongoDB connection
    client.close();

    // Send success response
    res.json({ message: 'Login successful', user: { handle: user.handle, role: user.role, uuid: user.id } });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/posts/:postId', async (req, res) => {
  const postId = req.params.postId;
  const postData = req.body;

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const posts = db.collection('posts');

    // Update the post with the provided postId
    const result = await posts.updateOne({ _id: postId }, { $set: postData });

    client.close();

    res.json({ message: 'Post updated successfully', result });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/posts/:postId/view', async (req, res) => {
  const postId = req.params.postId;
  const postData = req.body;

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const posts = db.collection('posts');

    // Update the post with the provided postId
    const result = await posts.updateOne({ _id: postId }, { $set: postData });

    client.close();

    res.json({ message: 'Post updated successfully', result });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/posts/:postId/view', async (req, res) => {
  const postId = req.params.postId;
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const posts = db.collection('posts');
    const post = await posts.findOne({ _id: postId });

    if (!post) {
      // If the post doesn't exist, return a 404 status code
      client.close();
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the comments array exists and has length before iterating
    if (post.comments && post.comments.length > 0) {
      const users = db.collection('users');
      const comments = post.comments;
      for (let i = 0; i < comments.length; i++) {
        const user = await users.findOne({ id: comments[i].id });
        comments[i].username = user.username;
        comments[i].handle = user.handle;
        comments[i].profilePic = user.profile.profilePic;
      }
    }

    client.close();
    console.log(post);
    res.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/posts/:postId/like', async (req, res) => {
  const postId = req.params.postId;
  const { userId, isLiked } = req.body;

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const postLikes = db.collection('postLikes');
    const posts = db.collection('posts');

    // Update the postLikes collection
    if (isLiked) {
      await postLikes.insertOne({ postId, userId, isLiked });
      // Increment the post's like count by one
      await posts.updateOne({ _id: postId }, { $inc: { 'statistics.likes': 1 } });
    } else {
      await postLikes.deleteOne({ postId, userId });
      // Decrement the post's like count by one
      await posts.updateOne({ _id: postId }, { $inc: { 'statistics.likes': -1 } });
    }

    client.close();

    res.json({ message: `Post ${isLiked ? 'liked' : 'unliked'} successfully` });
  } catch (error) {
    console.error('Error updating like:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/posts/:postId/repost', async (req, res) => {
  const postId = req.params.postId;
  const { userId, isReposted } = req.body;

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const posts = db.collection('posts');
    const postReposts = db.collection('postReposts');

    // Update the post reposts array
    const result = await posts.updateOne(
      { _id: postId },
      isReposted ? { $addToSet: { reposts: userId } } : { $pull: { reposts: userId } }
    );

    // Update the postReposts collection
    if (isReposted) {
      await postReposts.insertOne({ postId, userId, isReposted });
      // Increment the post's repost count by one
      await posts.updateOne({ _id: postId }, { $inc: { 'statistics.reposts': 1 } });
    } else {
      await postReposts.deleteOne({ postId, userId });
      // Decrement the post's repost count by one
      await posts.updateOne({ _id: postId }, { $inc: { 'statistics.reposts': -1 } });
    }

    client.close();

    res.json({ message: `Post ${isReposted ? 'reposted' : 'unreposted'} successfully` });
  } catch (error) {
    console.error('Error updating repost:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/liked-posts', async (req, res) => {
  try {
    const userId = req.query.userId;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const likesCollection = db.collection('postLikes');
    const repostsCollection = db.collection('postReposts');

    // Find all liked posts by the user
    const likedPosts = await likesCollection.find({ userId }).toArray();

    // Fetch the actual post data for each liked post
    const postsCollection = db.collection('posts');
    const likedPostsData = await Promise.all(
      likedPosts.map(async ({ postId }) => {
        const post = await postsCollection.findOne({ _id: postId });
        // Fetch user data for the post
        const usersCollection = db.collection('users');
        const userData = await usersCollection.findOne({ id: post.userId });
        const profilePic = userData.profile ? userData.profile.profilePic : 'Profile/default.jpg'; // Assign a default value if userData.profile is null
        // Add profilePic to the post data
        post.profilePic = profilePic;

        // Check if the user has liked this post
        const hasLiked = await likesCollection.findOne({ postId, userId });
        post.isLiked = !!hasLiked; // Convert to boolean

        // Check if the user has reposted this post
        const hasReposted = await repostsCollection.findOne({ postId, userId });
        post.isReposted = !!hasReposted; // Convert to boolean

        return post;
      })
    );
    client.close();
    res.json({ likedPostsData });
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/reposted-posts', async (req, res) => {
  try {
    const userId = req.query.userId;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const repostsCollection = db.collection('postReposts');
    const likesCollection = db.collection('postLikes');

    // Find all reposted posts by the user
    const repostedPosts = await repostsCollection.find({ userId }).toArray();

    // Fetch the actual post data for each reposted post
    const postsCollection = db.collection('posts');
    const repostedPostsData = await Promise.all(
      repostedPosts.map(async ({ postId }) => {
        const post = await postsCollection.findOne({ _id: postId });
        // Fetch user data for the post
        const usersCollection = db.collection('users');
        const userData = await usersCollection.findOne({ id: post.userId });
        const profilePic = userData.profile ? userData.profile.profilePic : 'Profile/default.jpg'; // Assign a default value if userData.profile is null
        // Add profilePic to the post data
        post.profilePic = profilePic;

        // Check if the user has reposted this post
        const hasReposted = await repostsCollection.findOne({ postId, userId });
        post.isReposted = !!hasReposted; // Convert to boolean

        // Check if the user has liked this post
        const hasLiked = await likesCollection.findOne({ postId, userId });
        post.isLiked = !!hasLiked; // Convert to boolean

        return post;
      })
    );
    client.close();
    res.json({ repostedPostsData });
  } catch (error) {
    console.error('Error fetching reposted posts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post(`/api/posts/:postId/new-comments`, async (req, res) => {
  console.log('Received POST to /api/posts/:postId/new-comments');
  const postId = req.params.postId;
  const comment = req.body.comment;
  console.log(comment)
  const userCookie = req.cookies.userCookie;
  const userC = JSON.parse(userCookie);
  const userId = userC.uuid;
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('posts');
    const result = await collection.updateOne(
      { _id: postId },
      { $push: { comments: { id: userId, comment: comment } } }
    );
    client.close();
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//-----------Rooms/ArtPost----------------
app.post('/api/rooms', async (req, res) => {
  console.log('Received POST to /api/rooms');
  const userCookie = req.cookies.userCookie;
  const user = JSON.parse(userCookie);
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('rooms');

    // Create a new room object
    const newRoom = {
      name: user.handle,
      owner: user.uuid,
      users: [user.handle],
      contributors: [],
      invitedUsers: [],
      canvasData: null // Initialize canvas data as null
    };

    const result = await collection.insertOne(newRoom);
    client.close();

    res.status(201).json({ roomId: result.insertedId });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch room data
app.get('/api/rooms/:roomId', async (req, res) => {
  console.log('Received GET to /api/rooms/:roomId');
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('rooms');

    const roomId = req.params.roomId;
    console.log('Room ID:' + roomId)
    const room = await collection.findOne({ _id: new ObjectId(roomId) });
    console.log('Room:' + room.users)

    client.close();

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room.users);
  } catch (error) {
    console.error('Error fetching room data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to invite a user to the room
app.post('/api/rooms/:roomId/invite', async (req, res) => {
  console.log('Received POST to /api/rooms/:roomId/invite');
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('rooms');

    const roomId = req.params.roomId;
    const userId = req.body.userId;
    //Get handle from userId
    const users = db.collection('users');
    const user = await users.findOne({ id: userId });
    const userHandle = user.handle;

    // Find the room and add the invited user to the users array
    await collection.updateOne(
      { _id: new ObjectId(roomId) },
      { $addToSet: { invitedUsers: userHandle } }
    );

    client.close();

    res.status(200).json({ message: 'User invited successfully' });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to remove a user from the room
app.delete('/api/rooms/:roomId/remove/:userId', async (req, res) => {
  console.log('Received DELETE to /api/rooms/:roomId/remove/:userId');
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('rooms');

    const roomId = req.params.roomId;
    const userId = req.params.userId;

    // Find the room and remove the user from the users array
    await collection.updateOne(
      { _id: new ObjectId(roomId) },
      { $pull: { users: userId } }
    );

    client.close();

    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to save canvas data
app.put('/api/rooms/:roomId/canvas', async (req, res) => {
  console.log('Received PUT to /api/rooms/:roomId/canvas');
  const canvasImage = req.body.canvasImage
  console.log(canvasImage)
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('rooms');

    const roomId = req.params.roomId;

    // Update the room's canvasData with the new canvasData
    await collection.updateOne(
      { _id: new ObjectId(roomId) },
      { $set: { canvasData: canvasImage } }
    );

    client.close();

    res.status(200).json({ message: 'Canvas data saved successfully' });
  } catch (error) {
    console.error('Error saving canvas data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch canvas data
app.get('/api/rooms/:roomId/get-canvas', async (req, res) => {
  console.log('Received GET to /api/rooms/:roomId/get-canvas');
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('rooms');

    const roomId = req.params.roomId;
    const room = await collection.findOne({ _id: new ObjectId(roomId) });

    client.close();

    res.json({ canvasData: room.canvasData });
  } catch (error) {
    console.error('Error fetching canvas data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/user/:uuid/rooms', async (req, res) => {
  console.log('Received GET to /api/user/:uuid/rooms');
  const userId = req.params.uuid;
  const userCookie = req.cookies.userCookie;
  const user = JSON.parse(userCookie);
  try {
      const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      const db = client.db(dbName);
      const Room = db.collection('rooms');
      // Find rooms where the user is a member or has been invited
      const rooms = await Room.find({
          $or: [{ users: user.handle }, { invitedUsers: user.handle }]
      });
      const roomsArr = await rooms.toArray();
      console.log(roomsArr)

      res.json({ roomsArr });
  } catch (error) {
      console.error('Error fetching user rooms:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch users in a room
app.get('/api/users/:roomId', async (req, res) => {
  console.log('Received GET to /api/users/:roomId');
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const roomsCollection = db.collection('rooms');

    const roomId = req.params.roomId;
    const room = await roomsCollection.findOne({ _id: ObjectId(roomId) }); 
    const roomUsers = await usersCollection.find({ handle: room.users }).toArray();

    // Retrieve user information for each user ID in the room
    console.log(roomUsers)
    client.close();

    res.json(roomUsers);
  } catch (error) {
    console.error('Error fetching users in room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/rooms/:roomId/users/:handle', async (req, res) => {
  console.log('Received GET to /api/rooms/:roomId/users');
  try {
    const handle = req.params.handle;
    console.log('Handle:', handle)
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('users');

    const users = await collection.findOne({handle: handle } )
    client.close();
    const usersDetails = {
      handle: users.handle,
      username: users.username,
      profilePic: users.profile.profilePic
    };
    res.json({ usersDetails });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const port = 3001; // Replace with your desired port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});