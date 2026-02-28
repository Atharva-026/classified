import { Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import CustomerPage from "./pages/CustomerPage"
import StorePage from "./pages/StorePage"
import StoreLogin from "./pages/StoreLogin"
import StoreRegister from "./pages/StoreRegister"

function PrivateRoute({ children }) {
  const token = localStorage.getItem("staff_token")
  return token ? children : <Navigate to="/store/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/customer" element={<CustomerPage />} />
      <Route path="/store/login" element={<StoreLogin />} />
      <Route path="/store/register" element={<StoreRegister />} />
      <Route path="/store" element={
        <PrivateRoute><StorePage /></PrivateRoute>
      } />
    </Routes>
  )
}