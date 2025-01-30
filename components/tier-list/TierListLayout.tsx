"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";

interface TierListLayoutProps {
  tierListName?: string;
}

export default function TierListLayout({ tierListName = "Headphone Comparison" }: TierListLayoutProps) {
  const [propertyCount, setPropertyCount] = useState(3);
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header tierListName={tierListName} isLoggedIn={true} />
      <div className="flex flex-1 overflow-hidden">
        <MainContent propertyCount={propertyCount} />
        <Sidebar propertyCount={propertyCount} onPropertyCountChange={setPropertyCount} />
      </div>
    </div>
  );
}
