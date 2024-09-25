import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/socketProvider";
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";

type PaylodOnJoin = {
  email: string;
  id: string;
};

type PayloadOnIncomingCall = {
  from: string;
  offer: RTCSessionDescriptionInit;
};

type UserCallAcceptPaylod = {
  to: string;
  ans: RTCSessionDescriptionInit;
};

export default function Room() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState("");
  const [myStream, setMyStream] = useState<MediaStream | null>(null);

  const handleUserJoined = useCallback((data: PaylodOnJoin) => {
    const { email, id } = data;
    console.log(`Email: ${email} joined`);
    setRemoteSocketId(id);
  }, []);

  const handleIncomingCall = useCallback(
    async (data: PayloadOnIncomingCall) => {
      const { from, offer } = data;
      setRemoteSocketId(from);

      // get reciever stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log("incoming call===", from, offer);

      const ans = await peer.getAnswer(offer);
      socket?.emit("call:accepted", { to: from, ans });
    },
    [],
  );

  const handleCallAccepted = useCallback((data: UserCallAcceptPaylod) => {
    const { ans } = data;
    peer.setLocalDescription(ans);
    console.log("Call accepted");
  }, []);

  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);
    socket?.on("incoming:call", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);

    return () => {
      socket?.off("user:joined", handleUserJoined);
      socket?.off("incoming:call", handleIncomingCall);
      socket?.off("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncomingCall]);

  const handleCallUser = useCallback(async () => {
    // get caller stream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    // send user stream. from caller to target
    const offer = await peer.getOffer();
    console.log("user:call payload===", {
      to: remoteSocketId,
      offer,
    });

    socket?.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  return (
    <div>
      <h1 className="text-center">Chat Room</h1>
      <p>Remote socket Id: {remoteSocketId}</p>
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
