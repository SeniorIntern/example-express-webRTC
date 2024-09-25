import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

type UserInfo = {
  email: string;
  room: number;
};

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.get("/", (_, res) => {
  res.status(200).json("Hello world");
});

const port = process.env.PORT || 3001;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("client connected. ID===", socket.id);
  socket.onAny((ev, { ...args }) => {
    console.log("got event===", ev);
    console.log("event args===", args);
  });
  socket.on("room:join", (data: UserInfo) => {
    console.log("payload===", data);
  });
});

httpServer.listen(port, () => {
  console.log(`listening on port: ${port}...`);
});
