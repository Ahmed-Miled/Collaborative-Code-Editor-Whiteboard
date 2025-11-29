import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import Document from "../components/Document"
import '../../styles/home.css'

function HomePage(){
  return (
    <div className="home">
      <NavBar/>
      <SideBar />
      <Document />
    </div>
  )
}

export default HomePage