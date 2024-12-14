import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import OpenFile from "./pages/OpenFile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/chooseFile",
    element: <OpenFile />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
