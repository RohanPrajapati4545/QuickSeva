import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AllRoutes from "./pages/Routes/AllRoutes";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <AllRoutes />
    </>
  );
}

export default App;