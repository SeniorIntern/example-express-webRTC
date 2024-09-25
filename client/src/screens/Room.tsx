import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/socketProvider";
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

type PaylodOnJoin = { email: string; id: string };

export default function Room() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState("");
  const [myStream, setMyStream] = useState<MediaStream | null>(null);

  const handleUserJoined = useCallback((data: PaylodOnJoin) => {
    const { email, id } = data;
    console.log(`Email: ${email} joined`);
    setRemoteSocketId(id);
  }, []);

  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);

    return () => {
      socket?.off("user:joined", handleUserJoined);
    };
  }, [socket, handleUserJoined]);

  const handleCallUser = useCallback(async () => {
    // get user stream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
  }, []);

  return (
    <div>
      <h1 className="text-center">Chat Room</h1>
      {remoteSocketId ? (
        <div>
          <p>Connected</p>
          <Button onClick={handleCallUser}>Call</Button>
        </div>
      ) : (
        <p>No one in room</p>
      )}
      {myStream && (
        <ReactPlayer playing height="260px" width="600px" url={myStream} />
      )}
    </div>
  );
}
