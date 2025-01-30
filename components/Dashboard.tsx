import Header from "@/app/components/Header";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";

interface DashboardProps {
  tierListName?: string;
}

export default function Dashboard({ tierListName = "Headphone Comparison" }: DashboardProps) {
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header tierListName={tierListName} isLoggedIn={true} />
      <div className="flex flex-1 overflow-hidden">
        <MainContent />
        <Sidebar />
      </div>
    </div>
  );
}
