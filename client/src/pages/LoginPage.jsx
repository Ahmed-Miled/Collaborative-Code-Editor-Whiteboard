import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../api/api";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErrors("");

    try {
      const data = await loginUser({ username, password });

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/home");
      } else {
        setErrors(data.message || "Login failed");
      }
    } catch (err) {
      setErrors(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="title">Login</h1>
        <form className="auth-form" onSubmit={handleLogin}>
          <input
            className="input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn-primary" type="submit">
            Login
          </button>
        </form>
        {errors && <p className="error">{errors}</p>}
        <button
          className="btn-outline"
          type="button"
          onClick={() => navigate("/register")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
