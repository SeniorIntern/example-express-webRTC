import { useSocket } from "@/context/socketProvider";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

type UserInfo = {
  email: string;
  room: number;
};

export default function Lobby() {
  const [userInfo, setUserInfo] = useState<UserInfo>({} as UserInfo);

  const socket = useSocket();

  const navigate = useNavigate();

  const handleJoinRoom = useCallback(
    (data: UserInfo) => {
      const { room, email } = data;
      console.log(room, email);
      navigate(`/room/${room}`);
    },
    [navigate],
  );

  useEffect(() => {
    socket?.on("room:join", handleJoinRoom);

    return () => {
      socket?.off("room:join", handleJoinRoom);
    };
  }, [socket]);

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log("userInfo===", userInfo);
      socket?.emit("room:join", userInfo);
      setUserInfo({} as UserInfo);
    },

    [userInfo, socket],
  );

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleFormSubmit}
        className="border w-1/3 rounded-lg p-8 space-y-8"
      >
        <div className="grid gap-2">
          <label htmlFor="email">Enter your email</label>
          <input
            value={userInfo.email || ""}
            onChange={(e) => {
              setUserInfo({ ...userInfo, email: e.target.value });
            }}
            id="email"
            type="email"
            placeholder="abc@gmail.com"
            className="border rounded-lg p-2"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="room">Enter your room Id</label>
          <input
            value={userInfo.room || 0}
            onChange={(e) =>
              setUserInfo({ ...userInfo, room: +e.target.value })
            }
            id="room"
            placeholder="123"
            className="border rounded-lg p-2"
          />
        </div>
        <Button variant="outline" className="w-full">
          JOIN
        </Button>
      </form>
    </div>
  );
}
