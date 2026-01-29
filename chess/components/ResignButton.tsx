import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"

export function ResignButton({onResign, canResign} : {onResign? : () => void, canResign: boolean}) {

    

  return (
    <AlertDialog>
      <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button disabled={!canResign} size='lg' className="cursor-pointer border group" variant="ghost"><Flag className="group-hover:text-red-500" /></Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Resign</p>
          </TooltipContent>
        </Tooltip>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resign?</AlertDialogTitle>
          <AlertDialogDescription>
            Certain you want to tip your king over? This ends the game and hands the win to your opponent.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Never Mind</AlertDialogCancel>
          <AlertDialogAction onClick={onResign} className="bg-red-700 text-white hover:bg-red-800">Resign</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
