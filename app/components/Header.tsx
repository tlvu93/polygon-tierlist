import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronRight, Plus, User } from "lucide-react"

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-blue-600">PolyChart</h1>
        <div className="flex items-center text-sm text-slate-500">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span>Headphone Comparison</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="default">
          <Plus className="w-4 h-4 mr-2" />
          New Tier List
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-8 h-8 rounded-full p-0">
              <User className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

