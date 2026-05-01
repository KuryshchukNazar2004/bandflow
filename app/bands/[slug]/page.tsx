import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookingModal } from "@/components/booking-modal"
import { MapPin, Music2, Star, ArrowLeft, Users, Mic2, Guitar, Drum, Piano } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BandAvailabilityCalendar } from "@/components/band-availability-calendar"
import { ReviewsSection } from "@/components/reviews-section"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const band = await prisma.band.findUnique({ 
    where: { slug },
    include: { photos: true }
  })
  
  if (!band) return { title: "Band Not Found" }
  
  return {
    title: `${band.name} | BandFlow`,
    description: band.bio?.slice(0, 160) || `Book ${band.name}, a ${band.genre} band from ${band.city}, for your next event on BandFlow.`,
    openGraph: {
      title: band.name,
      description: band.bio?.slice(0, 160) || `Book ${band.name} for your event.`,
      images: band.photos[0] ? [band.photos[0].url] : [],
    }
  }
}

export default async function BandProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const band = await prisma.band.findUnique({
    where: { slug },
    include: {
      members: true,
      photos: true,
      reviews: true,
      services: true,
      instruments: true,
    }
  })

  if (!band) notFound()

  await prisma.band.update({
    where: { id: band.id },
    data: { profileViews: { increment: 1 } },
  })

  const avgRating = band.reviews.length > 0
    ? band.reviews.reduce((s, r) => s + r.rating, 0) / band.reviews.length
    : null
  const ratingDisplay = avgRating ? avgRating.toFixed(1) : null
  const filledStars = avgRating ? Math.round(avgRating) : 0

  // Helper to get icon for instrument
  const getInstrumentIcon = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('vocal') || n.includes('sing') || n.includes('вокал')) return <Mic2 className="h-4 w-4" />
    if (n.includes('guitar') || n.includes('bass') || n.includes('гітара')) return <Guitar className="h-4 w-4" />
    if (n.includes('drum') || n.includes('percussion') || n.includes('барабан')) return <Drum className="h-4 w-4" />
    if (n.includes('piano') || n.includes('key') || n.includes('клавіш')) return <Piano className="h-4 w-4" />
    return <Music2 className="h-4 w-4" />
  }


  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/marketplace" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Маркетплейс</span>
          </Link>
          
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Logo size="md" />
          </Link>

          <BookingModal 
            bandId={band.id} 
            price={band.price} 
            trigger={<Button className="bg-[#2D1B69] hover:bg-[#1a0f40] text-white">Забронювати</Button>}
          />
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative">
        {/* Gradient Background */}
        <div className="h-64 md:h-80 bg-gradient-to-r from-[#E8532A] to-[#F8A488] w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5" />
            <div className="container mx-auto px-4 h-full relative">
                <div className="absolute bottom-8 left-4 md:left-44 lg:left-[280px] text-white space-y-2">
                    <div className="flex gap-2 mb-3">
                        <Badge variant="secondary" className="bg-black/20 hover:bg-black/30 text-white border-none backdrop-blur-md">
                            {band.genre}
                        </Badge>
                        <Badge variant="secondary" className="bg-black/20 hover:bg-black/30 text-white border-none backdrop-blur-md flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {band.city}
                        </Badge>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-medium">{band.name}</h1>
                    {ratingDisplay ? (
                      <div className="flex items-center gap-2 text-white/90">
                        <div className="flex text-amber-300">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < filledStars ? "fill-current" : "text-white/40"}`} />
                          ))}
                        </div>
                        <span className="font-medium">{ratingDisplay}</span>
                        <span className="text-white/70 text-sm">({band.reviews.length} відгуків)</span>
                      </div>
                    ) : (
                      <div className="text-white/60 text-sm">Відгуків ще немає</div>
                    )}
                </div>
            </div>
        </div>

        {/* Band Image overlapping */}
        <div className="container mx-auto px-4 relative">
             <div className="absolute -top-24 left-4 md:left-4 w-32 h-32 md:w-48 md:h-48 rounded-3xl border-4 border-[#FDFCFB] overflow-hidden bg-white shadow-lg z-10">
                {band.photos[0] ? (
                  <img src={band.photos[0].url} alt={band.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 text-white">
                      <Music2 className="h-16 w-16 opacity-50" />
                  </div>
                )}
             </div>
             
             {/* Mobile Spacer for overlapping image */}
             <div className="h-24 md:h-0" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:pl-56">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                {/* Tabs Navigation */}
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="w-full justify-start bg-transparent border-b border-gray-200 rounded-none h-auto p-0 mb-8 gap-8 overflow-x-auto flex flex-nowrap">
                        <TabsTrigger 
                            value="info" 
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#2D1B69] data-[state=active]:text-[#2D1B69] data-[state=active]:shadow-none rounded-none px-0 py-3 font-medium text-base text-gray-500 hover:text-gray-900 flex-none shrink-0"
                        >
                            Про гурт
                        </TabsTrigger>
                        <TabsTrigger 
                            value="members" 
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#2D1B69] data-[state=active]:text-[#2D1B69] data-[state=active]:shadow-none rounded-none px-0 py-3 font-medium text-base text-gray-500 hover:text-gray-900 flex-none shrink-0"
                        >
                            Учасники
                        </TabsTrigger>
                        <TabsTrigger 
                            value="calendar" 
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#2D1B69] data-[state=active]:text-[#2D1B69] data-[state=active]:shadow-none rounded-none px-0 py-3 font-medium text-base text-gray-500 hover:text-gray-900 flex-none shrink-0"
                        >
                            Календар
                        </TabsTrigger>
                        <TabsTrigger 
                            value="reviews" 
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#2D1B69] data-[state=active]:text-[#2D1B69] data-[state=active]:shadow-none rounded-none px-0 py-3 font-medium text-base text-gray-500 hover:text-gray-900 flex-none shrink-0"
                        >
                            Відгуки
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-8 mt-0">
                        {/* Bio Section */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold font-display text-[#1A1A1A] mb-4">Про гурт</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {band.bio || `${band.name} — це професійний музичний колектив, який створить незабутню атмосферу на вашому святі. Ми виконуємо найкращі хіти та авторські композиції, адаптуючи репертуар під ваш захід.`}
                            </p>
                        </div>

                        {/* Instruments Section */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold font-display text-[#1A1A1A] mb-6">Інструменти</h2>
                            <div className="flex flex-wrap gap-3">
                                {band.instruments.length > 0 ? (
                                    band.instruments.map(inst => (
                                        <div key={inst.id} className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium border border-orange-100">
                                            {getInstrumentIcon(inst.name)}
                                            {inst.name}
                                        </div>
                                    ))
                                ) : (
                                    // Default instruments if none listed
                                    <>
                                        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium border border-orange-100">
                                            <Mic2 className="h-4 w-4" /> Вокал
                                        </div>
                                        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium border border-orange-100">
                                            <Guitar className="h-4 w-4" /> Електрогітара
                                        </div>
                                        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium border border-orange-100">
                                            <Guitar className="h-4 w-4" /> Бас-гітара
                                        </div>
                                        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium border border-orange-100">
                                            <Drum className="h-4 w-4" /> Барабани
                                        </div>
                                        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium border border-orange-100">
                                            <Piano className="h-4 w-4" /> Клавіші
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Gallery Section */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold font-display text-[#1A1A1A] mb-6">Фото галерея</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {band.photos.length > 0 ? (
                                    band.photos.map((photo) => (
                                        <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group">
                                            <img src={photo.url} alt="Band photo" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                                        </div>
                                    ))
                                ) : (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center text-white/50">
                                            <Music2 className="h-8 w-8" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="members" className="mt-0">
                         <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold font-display text-[#1A1A1A] mb-6">Учасники гурту</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {band.members.length > 0 ? band.members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                        <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden shrink-0">
                                            {member.photo ? (
                                                <img src={member.photo} alt={member.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-400">
                                                    <Users className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                                            <p className="text-sm text-gray-500">{member.role}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-gray-500 italic">Інформація про учасників відсутня.</p>
                                )}
                            </div>
                         </div>
                    </TabsContent>

                    <TabsContent value="calendar" className="mt-0">
                        <BandAvailabilityCalendar bandSlug={slug} />
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-0">
                        <ReviewsSection
                          bandId={band.id}
                          initialReviews={band.reviews.map(r => ({
                            ...r,
                            createdAt: r.createdAt.toISOString(),
                          }))}
                          ratingDisplay={ratingDisplay}
                          filledStars={filledStars}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="p-8 space-y-6">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Від</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-display font-medium text-[#2D1B69]">
                                        {band.price.toLocaleString('uk-UA').replace(/,/g, ' ')} ₴
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm mt-1">за виступ</p>
                            </div>

                            <BookingModal bandId={band.id} price={band.price} />

                            <div className="text-xs text-center text-gray-400 pt-2">
                                Безкоштовне скасування за 7 днів
                            </div>

                            <div className="pt-6 border-t border-gray-100 space-y-4">
                                <h3 className="font-bold text-[#1A1A1A]">Деталі</h3>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Guitar className="h-4 w-4 text-[#E8532A]" />
                                        <span>Жанр</span>
                                    </div>
                                    <span className="font-medium text-gray-900">{band.genre}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <MapPin className="h-4 w-4 text-[#E8532A]" />
                                        <span>Місто</span>
                                    </div>
                                    <span className="font-medium text-gray-900">{band.city}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Users className="h-4 w-4 text-[#2D1B69]" />
                                        <span>Учасників</span>
                                    </div>
                                    <span className="font-medium text-gray-900">{band.members.length > 0 ? `${band.members.length} осіб` : '4 осіб'}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                        <span>Рейтинг</span>
                                    </div>
                                    <span className="font-medium text-gray-900">
                                        {ratingDisplay ? `${ratingDisplay} (${band.reviews.length} відг.)` : "Немає відгуків"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}