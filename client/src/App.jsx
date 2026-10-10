
import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./components/page/LoginPage/Login";
import Register from "./components/page/Register/Register";
import Dashboard from "./components/page/Dashboard/Dashboard";
import Meeting from "./components/page/Meeting/Meeting";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/meeting/:roomId" element={<Meeting />} />
    </Routes>
  );
}

export default App;