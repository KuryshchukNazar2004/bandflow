import { Button } from "@/components/ui/button"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Search, MapPin, Star, Music, ArrowRight } from "lucide-react"
import { MarketplaceToolbar } from "@/components/marketplace/marketplace-toolbar"

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q : undefined
  const genre = typeof params.genre === 'string' ? params.genre : undefined
  const city = typeof params.city === 'string' ? params.city : undefined

  const where: any = {}
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { genre: { contains: query, mode: 'insensitive' } },
    ]
  }
  if (genre && genre !== 'all') {
    where.genre = genre
  }
  if (city && city !== 'all') {
    where.city = city
  }

  const bands = await prisma.band.findMany({
    where,
    include: { photos: true, reviews: true }
  })

  const genresResult = await prisma.band.findMany({ select: { genre: true }, distinct: ['genre'] })
  const citiesResult = await prisma.band.findMany({ select: { city: true }, distinct: ['city'] })
  
  const allGenres = genresResult.map(g => g.genre).filter(Boolean) as string[]
  const allCities = citiesResult.map(c => c.city).filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Navbar */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#2D1B69] text-white p-1.5 rounded-md">
              <Music className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold text-[#2D1B69]">BandFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-gray-600 hover:text-[#2D1B69] hover:bg-transparent">Увійти</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-[#2D1B69] text-white hover:bg-[#1a0f40] rounded-full px-6">Для гуртів</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-16">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-[#1A1A1A] mb-3">Знайди свій гурт</h1>
          <p className="text-muted-foreground text-lg font-light">Перевірені музиканти для вашого особливого заходу</p>
        </div>

        {/* Toolbar */}
        <div className="mb-8">
           <MarketplaceToolbar genres={allGenres} cities={allCities} />
        </div>

        {/* Results Count */}
        <div className="mb-8 text-muted-foreground text-sm">
          Знайдено: <span className="font-bold text-foreground">{bands.length}</span> гуртів
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bands.length > 0 ? (
            bands.map((band) => {
              // Determine gradient based on band name length or id to vary colors if no photo
              const gradients = [
                "bg-gradient-to-br from-orange-400 to-red-500",
                "bg-gradient-to-br from-blue-400 to-indigo-500",
                "bg-gradient-to-br from-amber-400 to-orange-500",
                "bg-gradient-to-br from-emerald-400 to-teal-500",
                "bg-gradient-to-br from-pink-400 to-rose-500",
                "bg-gradient-to-br from-slate-600 to-slate-800"
              ]
              // Simple deterministic choice
              const gradientClass = gradients[band.name.length % gradients.length]
              
              return (
                <Link href={`/bands/${band.slug}`} key={band.id} className="group">
                  <Card className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white h-full flex flex-col rounded-2xl">
                    {/* Image Section */}
                    <div className={`relative aspect-[4/3] ${!band.photos[0] ? gradientClass : 'bg-muted'}`}>
                      {band.photos[0] ? (
                         <img 
                           src={band.photos[0].url} 
                           alt={band.name} 
                           className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
                         />
                      ) : (
                         <div className="flex items-center justify-center h-full text-white/20">
                           <Music className="h-24 w-24" />
                         </div>
                      )}
                      
                      {/* Genre Badge */}
                      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                        {band.genre || "Music"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-display text-xl font-bold text-[#1A1A1A] group-hover:text-[#2D1B69] transition-colors">{band.name}</h3>
                        {band.reviews.length > 0 ? (
                          <div className="flex items-center gap-1 text-amber-500 text-sm font-medium bg-amber-50 px-2 py-1 rounded-md">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{(band.reviews.reduce((s, r) => s + r.rating, 0) / band.reviews.length).toFixed(1)}</span>
                            <span className="text-muted-foreground font-normal text-xs ml-0.5">({band.reviews.length})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400 text-xs bg-gray-50 px-2 py-1 rounded-md">
                            <Star className="h-3.5 w-3.5" />
                            <span>Нових</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {band.city || "Ukraine"}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1 leading-relaxed">
                        {band.bio || `${band.name} — це професійний музичний колектив, який створить незабутню атмосферу на вашому святі.`}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <div className="flex flex-col">
                          {band.price ? (
                            <span className="font-display text-lg font-bold text-[#2D1B69]">
                              від {band.price} ₴ <span className="text-xs font-normal text-muted-foreground font-sans">/ захід</span>
                            </span>
                          ) : (
                            <span className="font-display text-lg font-bold text-[#2D1B69]">
                              За запитом
                            </span>
                          )}
                        </div>
                        <Button size="sm" className="bg-[#2D1B69] hover:bg-[#1a0f40] text-white gap-2 rounded-lg pl-4 pr-3">
                          Детальніше <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="bg-gray-50 inline-flex p-6 rounded-full mb-4">
                <Search className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-display font-medium text-gray-900 mb-2">Нічого не знайдено</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Спробуйте змінити параметри пошуку або фільтри для отримання результатів.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
