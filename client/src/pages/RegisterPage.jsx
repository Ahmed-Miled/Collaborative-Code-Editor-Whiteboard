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
        console.log("User registered:", result);
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
    <div>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="text"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Register</button>
        {errors && <p style={{ color: "red" }}>{errors}</p>}
      </form>
      <h5>i have already an account</h5>
      <button onClick={() => navigate("/")}>Login</button>
    </div>
  );
}

export default RegisterPage;
