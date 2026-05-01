import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { MembersManager } from "@/components/dashboard/members-manager"

export default async function MembersPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/")
  }

  const band = await prisma.band.findFirst({
    where: { userId },
    include: { members: true }
  })

  if (!band) {
    return redirect("/")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Members</h2>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <MembersManager initialMembers={band.members} bandId={band.id} />
      </div>
    </div>
  )
}
