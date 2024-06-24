import 'dotenv/config';
import express from 'express';
import usersRoute from './routers/user-route.js';

const PORT = process.env.PORT;
const app = express();

// ถ้า content เป็น application/json
// จะเอา json ใส่ req.body ให้
app.use(express.json());

app.get('/', (request, response) => {
  return response.json({ message: 'Hi' });
});

app.use('/users', usersRoute);
// app.use("/movies",moviesRoute)

app.listen(PORT, () => {
  console.log('server running at port', PORT);
});
