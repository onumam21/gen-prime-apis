import express from 'express';
import db from '../prisma-client.js';

// ติดตั้ง router
const router = express.Router();

// router ทำงานได้เหมือน app

router.get('/', async (req, res, next) => {
  const users = await db.user.findMany();
  return res.json(users);
});
router.get('/:userId', async (req, res, next) => {
  // Step-1 : แกะ path parameter จาก request object
  const params = req.params; // {userId : "1"}
  const userId = params.userId;

  // Step-2 : หาของใน DB
  // SELECT * FROM users WHERE id=2
  const user = await db.user.findUnique({ where: { id: +userId } });

  // Step-3 : เจอ user ใน db ไหม ถ้าไม่เจอ => 404 ?
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // ถ้าเจอ
  res.json(user); // status 200
});
router.post('/', async (req, res, next) => {
  const { email, name, password, confirmPassword, isAdmin = false } = req.body;
  // Step-1 : Validate exist
  if (!email || !name || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All field required' });
  }
  // Step-2 : Validate password
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'password mismatch' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ message: 'invalid email address' });
  }

  // HW : Check ว่าอีเมลล์ถูกสมัครไปรึยัง
  const existUser = await db.user.findUnique({ where: { email: email } });
  if (existUser) {
    return res.status(400).json({ message: 'email already in use' });
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

export default router;
