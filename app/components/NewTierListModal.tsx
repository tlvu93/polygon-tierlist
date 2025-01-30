import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function NewTierListModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">New Tier List</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Tier List</DialogTitle>
          <DialogDescription>Choose a template or start from scratch to create your new tier list.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" className="h-20">
              Blank
            </Button>
            <Button variant="outline" className="h-20">
              Tech
            </Button>
            <Button variant="outline" className="h-20">
              Fashion
            </Button>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create Tier List</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

