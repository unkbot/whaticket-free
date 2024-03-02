import openSocket from "socket.io-client";
import { getBackendUrl } from "../config";
function connectToSocket() {
  const token = localStorage.getItem("token");
  const socket = openSocket(getBackendUrl(), {
    query: {
      token: JSON.parse(token),
    },
  });

  return socket;
}

export default connectToSocket;
