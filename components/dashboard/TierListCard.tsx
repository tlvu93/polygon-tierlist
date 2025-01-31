import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Heart, BarChart, User } from "lucide-react";
import { TierListWithStats } from "./types";

interface TierListCardProps {
  tierList: TierListWithStats;
  isSelected: boolean;
}

export function TierListCard({ tierList, isSelected }: TierListCardProps) {
  return (
    <Card
      role="button"
      className={`group overflow-hidden border-2 shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? "border-blue-500 shadow-blue-200" : "border-transparent hover:border-gray-200"
      }`}
    >
      <div className="relative w-full h-32">
        <Image src={tierList.image || "/placeholder.svg"} alt={tierList.title} fill className="object-cover" />
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-lg mb-1">{tierList.title}</h3>
        <div className="flex items-center text-sm text-gray-500 mb-1">
          <User className="w-4 h-4 mr-1" />
          {tierList.creator}
        </div>
      </CardContent>
      <CardFooter className="bg-white p-3 flex justify-between items-center border-t">
        <div className="flex space-x-3 text-sm text-gray-500">
          <span className="flex items-center">
            <Heart className="w-4 h-4 mr-1" />
            {tierList.likes}
          </span>
          <span className="flex items-center">
            <BarChart className="w-4 h-4 mr-1" />
            {tierList.views}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
