import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { Swords } from "lucide-react"

export default function NoChallenges() {
  return (
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
        <Swords />
    </EmptyMedia>
    <EmptyTitle>No Challenges</EmptyTitle>
    <EmptyDescription>Wow. Truly a competitive ecosystem we have here.</EmptyDescription>
  </EmptyHeader>
</Empty>
  )
}
