import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  let band = await prisma.band.findUnique({
    where: { userId },
  });

  if (!band) {
     try {
        band = await prisma.band.create({
          data: {
            userId,
            name: "My New Band",
            slug: `band-${userId.slice(-8)}`,
            genre: "Unspecified",
            city: "Unspecified",
          }
        })
     } catch (e) {
        console.error("Failed to auto-create band", e);
     }
  }

  return (
    <div className="h-full relative flex">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-50">
        <Sidebar bandSlug={band?.slug || ""} user={session?.user} />
      </div>
      <main className="md:pl-72 w-full min-h-screen bg-background">
        {children}
      </main>
    </div>
  )
}
