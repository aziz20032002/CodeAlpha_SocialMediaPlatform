import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RightSidebar from "./components/RightSidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import PostDetails from "./pages/PostDetails";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="social-layout">
        <main className="page-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/users/:id" element={<UserProfile />} />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <RightSidebar />
      </div>
      <Footer />
    </div>
  );
}

export default App;
