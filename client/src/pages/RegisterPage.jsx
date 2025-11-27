import { useState } from "react";
import { registerUser } from "../api/api";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setErrors("");

    try {
      const result = await registerUser({ username, email, password });

      if (result.token) {
        localStorage.setItem("token", result.token);
        navigate("/home");
      } else {
        setErrors(result.message || result.error || "Registration failed");
      }
    } catch (err) {
      setErrors(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="title">Create Account</h1>

        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="Username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn-primary">
            Register
          </button>

          {errors && <p className="error">{errors}</p>}
        </form>

        <p className="register-text">Already have an account?</p>
        <button className="btn-outline" onClick={() => navigate("/")}>
          Login
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;
