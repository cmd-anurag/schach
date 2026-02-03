// TODO - Investigate the time lag in production

import FinishedGame from "@/components/FinishedGame";
import { Skeleton } from "@/components/ui/skeleton";

export default function Test() {


  return (
    <div className="p-4">
      <Skeleton className="w-full h-20" />    
    </div>
  )
}
