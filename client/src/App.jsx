import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import '../styles/App.css'

import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<ProtectedRoute element={<HomePage />} />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>  
  )
}

export default App
