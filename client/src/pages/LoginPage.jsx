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

  return(
    <div className="register page">
      <h1>login</h1>
       <form onSubmit={handleLogin}>
         <input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
         <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
         <button type="submit">Login</button>
         {errors && <p>{errors}</p>}
       </form>

       <h3>Don't have an account !</h3>
       <button onClick={() => navigate("/register")}>Register</button>
    </div>
  ) 
}

export default LoginPage
