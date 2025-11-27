

function NavBar(){

  const handleLogout = () => {
    localStorage.removeItem("token");   
    window.location.href = "/";   
  };


  return(
    <div className="navbar">
      <h1>navigation bar</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default NavBar