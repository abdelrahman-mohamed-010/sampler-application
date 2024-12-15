import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import OpenFile from "./pages/OpenFile";
import WorkFlow from "./pages/WorkFlow";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/chooseFile",
    element: <OpenFile />,
  },
  {
    path: "/workFlow",
    element: <WorkFlow />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
