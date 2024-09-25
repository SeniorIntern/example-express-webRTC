import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

type UserInfo = {
  email: string;
  room: number;
};

type UserOffer = {
  to: string;
  offer: RTCSessionDescriptionInit;
};

type UserCallAcceptPaylod = {
  to: string;
  ans: RTCSessionDescriptionInit;
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

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("client connected. ID===", socket.id);

  socket.on("room:join", (data: UserInfo) => {
    const { email, room } = data;

    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    // emit event to existing users in the room
    io.to(String(room)).emit("user:joined", { email, id: socket.id });

    socket.join(String(room));
    io.to(socket.id).emit("room:join", data);
  });

  // recieve stream from caller and send to call reciever
  socket.on("user:call", (data: UserOffer) => {
    console.log("recieved stream", data);

    const { to, offer } = data;
    io.to(to).emit("incoming:call", {
      from: socket.id,
      offer,
    });
  });

  //
  socket.on("call:accepted", (data: UserCallAcceptPaylod) => {
    const { to, ans } = data;
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });
});

httpServer.listen(port, () => {
  console.log(`listening on port: ${port}...`);
});
