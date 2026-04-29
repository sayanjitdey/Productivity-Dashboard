require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});


console.log('MONGO_URI:', process.env.MONGO_URI);


const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const { connectDb } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/users', require('./routes/user.routes'));
app.use('/tasks', require('./routes/task.routes'));
app.use('/dashboard', require('./routes/dashboard.routes'));

const port = process.env.PORT || 5000;

async function start() {
  await connectDb();
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
