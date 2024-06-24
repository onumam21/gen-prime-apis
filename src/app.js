import 'dotenv/config';
import express from 'express';
import db from './prisma-client.js';
import movieRoute from './movie-route.js'; // Correct the import path

const PORT = process.env.PORT;
const app = express();

// If content is application/json, parse the JSON
app.use(express.json());

// Root endpoint
app.get('/', (request, response) => {
  return response.json({ message: 'Hi' });
});

// Users endpoints
app.get('/users', async (req, res, next) => {
  try {
    const users = await db.user.findMany();
    return res.json(users);
  } catch (error) {
    next(error);
  }
});

app.post('/users', async (req, res, next) => {
  const { email, name, password, confirmPassword, isAdmin = false } = req.body;
  // Step-1 : Validate exist
  if (!email || !name || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  // Step-2 : Validate password
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Password mismatch' });
  }
  // Step-3 : Create New User
  try {
    const newUser = await db.user.create({
      data: {
        email: email,
        name: name,
        password: password,
        isAdmin: isAdmin,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

app.get('/users/:userId', async (req, res, next) => {
  const params = req.params; // {userId : "1"}
  const userId = params.userId;
  try {
    const user = await db.user.findUnique({ where: { id: +userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user); // status 200
  } catch (error) {
    next(error);
  }
});

// Use movieRoute for /movies endpoint
app.use('/movies', movieRoute);

// Start the server
app.listen(PORT, () => {
  console.log('Server running at port', PORT);
});