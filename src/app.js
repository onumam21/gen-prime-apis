import 'dotenv/config';
import express from 'express';
import db from './prisma-client.js';

const PORT = process.env.PORT;
const app = express();

//ถ้าคอนเทนเป็น application/json
//จะเอา json ใส่
app.use(express.json());

app.get('/', (request, response) => {
  return response.json({ message: 'Hi' });
});

// GET /users
app.get('/users', async (req, res, next) => {
  // หา users ใน db
  const users = await db.user.findMany();
  return res.json(users);
});

app.post('/users', async (req, res, next) => {
    console.log(req.body);
    res.json('register');
  });

  app.post('/users', async (req, res, next) => {
    const { email, name, password, confirmPassword, isAdmin = false } = req.body;
    // Step-1 : Validate exist
    if (!email || !name || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All field required' });
    }
    // Step-2 : Validate password
    if(password !== confirmPassword) {
        return res.status(400).json ({message: 'password mismatch'});
    }

    if (!email.includes('@')) {
        return res.status(400).json ({message: 'invalid email address'});
    }
    const existingUser = await db.user.findUnique({
        where: { email: email }
    });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
    }
    // Step-3 : Create NewUser
    const newUser = await db.user.create({
      data: {
        email: email,
        name: name,
        password: password,
        isAdmin: isAdmin,
      },
    });
    res.status(201).json(newUser);
  });

// GET /users/2
app.get('/users/:userId', async (req, res, next) => {
  // Step-1 : แกะ path parameter จาก request object
  const params = req.params; // {userId : "1"}
  const userId = params.userId;
  console.log(userId);

  const user = await db.user.findUnique({ where : {id: +userId} });
  //Step3 : เจอ user ใน db ถ้าไม่เจอ => 404?
  if (!user) {
    return res.status(404).json ({ message: 'User not found'});
  }
  //ถ้าเจอ
  res.json(user); //status 200
});

app.listen(PORT, () => {
  console.log('server running at port', PORT);
});