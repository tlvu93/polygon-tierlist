import Header from "../components/Header"
import MainContent from "../components/MainContent"
import Sidebar from "../components/Sidebar"

export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <MainContent />
        <Sidebar />
      </div>
    </div>
  )
}

