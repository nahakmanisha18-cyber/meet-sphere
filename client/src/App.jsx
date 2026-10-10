
import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./components/page/LoginPage/Login";
import Register from "./components/page/Register/Register";
import Home from "./components/page/Home/Home";
import Meeting from "./components/page/Meeting/Meeting";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/meeting/:roomId" element={<Meeting />} />
    </Routes>
  );
}

export default App;