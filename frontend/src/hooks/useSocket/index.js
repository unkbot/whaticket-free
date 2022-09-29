import React, { useMemo } from "react";
import openSocket from "socket.io-client";
import { getBackendUrl } from "../../config";

const useProvideSocket = () => {
  const socket = useMemo(() => {
    const token = localStorage.getItem("token");
    const socket = openSocket(getBackendUrl() + "1", {
      query: {
        token: JSON.parse(token),
      },
      transports: ["websocket"],
    });
    return socket;
  }, []);

  React.useMemo(() => {
    socket.on("connect", () => {
      console.log("connected");
    });
  }, [socket]);

  return socket;
};

export default useProvideSocket;
