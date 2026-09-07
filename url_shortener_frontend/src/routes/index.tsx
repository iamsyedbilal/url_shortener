import { BrowserRouter, Route, Routes } from "react-router";
import ProtectedRoute from "@/components/protected-route";
import AdminRoute from "@/components/admin-route";
import Admin from "./admin";
import Home from "./home";
import Login from "./login";
import Register from "./register";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
