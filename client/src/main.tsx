import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import Lobby from "./screens/Lobby";
import SocketProvider from "./context/socketProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },

  {
    path: "/lobby",
    element: <Lobby />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  </StrictMode>,
);
