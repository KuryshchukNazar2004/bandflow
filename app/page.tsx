import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { ArrowRight, Search, Music, Calendar, Star, DollarSign, Rocket, Music2 } from "lucide-react"

export default async function LandingPage() {
  const session = await auth()
  const userId = session?.user?.id

  const dbBands = await prisma.band.findMany({
    take: 3,
    orderBy: {
      reviews: {
        _count: 'desc'
      }
    },
    include: {
      reviews: true
    }
  })

  const popularBands = dbBands.map((band) => {
    const rating = band.reviews.length > 0
      ? band.reviews.reduce((acc, review) => acc + review.rating, 0) / band.reviews.length
      : 0
    
    return {
      id: band.id,
      slug: band.slug,
      name: band.name,
      genre: band.genre,
      city: band.city,
      rating: Number(rating.toFixed(1)),
      color: band.color || "#7C3AED",
    }
  })

  const features = [
    {
      title: "Каталог гуртів",
      desc: "Сотні перевірених музичних колективів різних жанрів та міст України.",
      icon: Music
    },
    {
      title: "Онлайн-бронювання",
      desc: "Обирайте дату та час, бачте доступність у реальному часі.",
      icon: Calendar
    },
    {
      title: "Відгуки та рейтинги",
      desc: "Чесні відгуки від реальних замовників допоможуть зробити вибір.",
      icon: Star
    },
    {
      title: "Прозорі ціни",
      desc: "Ніяких прихованих платежів. Ви бачите повну вартість заздалегідь.",
      icon: DollarSign
    }
  ]

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground">
      {/* Header */}
      <header className="px-6 h-20 flex items-center justify-between sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="flex items-center gap-2">
           <div className="bg-primary text-white p-1 rounded-md">
             <Music2 className="h-5 w-5" />
           </div>
           <span className="text-2xl font-display font-bold text-primary">BandFlow</span>
         </div>
          <nav className="flex items-center gap-4">
           {!userId ? (
             <>
               <Link href="/sign-in">
                 <Button variant="outline" className="text-foreground border-input hover:bg-accent hover:text-accent-foreground font-medium px-6">
                   Увійти
                 </Button>
               </Link>
               <Link href="/sign-up">
                 <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6">
                   Реєстрація гурту
                 </Button>
               </Link>
             </>
           ) : (
             <>
               <Link href="/dashboard">
                 <Button variant="outline" className="mr-2">Dashboard</Button>
               </Link>
             </>
           )}
         </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-20 lg:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="flex items-center space-x-2 text-primary font-medium">
                  <Rocket className="h-5 w-5" />
                  <span>Платформа для музикантів</span>
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-display text-foreground leading-[1.1]">
                    Знайди свій <br/>
                    <span className="italic font-normal">ідеальний гурт</span> <br/>
                    для свята
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                    BandFlow об'єднує замовників та музичні гурти. 
                    Бронюй живу музику для весілля, корпоративу чи вечірки за кілька кліків.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link href="/marketplace">
                    <Button size="lg" className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 text-lg rounded-xl w-full sm:w-auto gap-2">
                      <Search className="h-5 w-5" />
                      Знайти гурт
                    </Button>
                  </Link>
                  {!userId && (
                    <Link href="/sign-up">
                      <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-xl border-2 w-full sm:w-auto gap-2 group">
                        Я музикант
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  )}
                  {userId && (
                     <Link href="/dashboard">
                        <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-xl border-2 w-full sm:w-auto gap-2 group">
                          Я музикант
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                     </Link>
                  )}
                </div>
                <div className="flex items-center gap-8 pt-6 text-foreground/80">
                  <div className="flex flex-col">
                    <span className="text-2xl font-display font-medium">300+</span>
                    <span className="text-sm text-muted-foreground">гуртів</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-display font-medium">50+</span>
                    <span className="text-sm text-muted-foreground">міст</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-display font-medium">5 000+</span>
                    <span className="text-sm text-muted-foreground">бронювань</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Popular Card */}
              <div className="flex justify-center lg:justify-end">
                <div className="fade-in w-full max-w-md" style={{ position: "relative" }}> 
                  <div style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", borderRadius: 24, padding: 32, color: "#fff" }}> 
                    <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>Популярний цього тижня</div> 
                    {popularBands.slice(0, 3).map((b, i) => ( 
                      <Link key={b.id} href={`/bands/${b.slug}`} style={{ textDecoration: 'none' }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(255,255,255,0.1)", borderRadius: 12, marginBottom: 8, cursor: "pointer", transition: "background 0.2s", backdropFilter: "blur(4px)" }} 
                          className="hover:bg-white/20"
                        > 
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: b.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}> 
                            <Music className="text-white h-5 w-5" /> 
                          </div> 
                          <div style={{ flex: 1 }}> 
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>{b.name}</div> 
                            <div style={{ fontSize: 12, opacity: 0.7, color: "#fff" }}>{b.genre}</div> 
                          </div> 
                          <div style={{ textAlign: "right" }}> 
                            <div style={{ fontSize: 12, opacity: 0.6, color: "#fff" }}>⭐ {b.rating}</div> 
                            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2, color: "#fff" }}>{b.city}</div> 
                          </div> 
                        </div> 
                      </Link>
                    ))} 
                    <div style={{ textAlign: "center", marginTop: 16 }}> 
                      <Link href="/marketplace">
                        <button style={{ background: "#fff", color: "var(--primary)", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}> 
                          Переглянути всі гурти → 
                        </button> 
                      </Link>
                    </div> 
                  </div> 
                </div> 
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "80px 5%" }}> 
         <div style={{ maxWidth: 1200, margin: "0 auto" }}> 
           <div style={{ textAlign: "center", marginBottom: 56 }}> 
             <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, letterSpacing: "-0.02em" }}>Чому BandFlow?</h2> 
             <p style={{ color: "var(--text2)", marginTop: 12, fontSize: 16 }}>Все що потрібно для ідеального музичного заходу</p> 
           </div> 
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
             {features.map((f, i) => ( 
               <div key={i} 
                 className="group transition-all duration-200 border-[1.5px] border-[var(--border)] hover:border-[var(--accent2)] hover:-translate-y-[3px] hover:shadow-[var(--shadow-lg)]"
                 style={{ padding: 28, borderRadius: 14, background: "var(--bg)" }} 
               > 
                 <div style={{ width: 48, height: 48, background: "rgba(124, 58, 237, 0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}> 
                   <f.icon size={22} color="var(--accent2)" /> 
                 </div> 
                 <h3 style={{ fontWeight: 600,fontSize: 20, marginBottom: 8 }}>{f.title}</h3> 
                 <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{f.desc}</p> 
               </div> 
             ))} 
           </div> 
         </div> 
       </section>

        {/* CTA Section */}
        <section style={{ padding: "100px 5%", maxWidth: 1200, margin: "0 auto", textAlign: "center" }}> 
         <h2 style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: "-0.02em", marginBottom: 20 }}> 
           Готовий розпочати? 
         </h2> 
         <p style={{ color: "var(--text2)", fontSize: 17, marginBottom: 36 }}>Зареєструй свій гурт безкоштовно та починай отримувати замовлення</p> 
         {!userId ? (
            <Link href="/sign-up">
              <Button size="lg" style={{ fontSize: 17, padding: "16px 36px", height: "auto", background: "var(--primary)", color: "var(--primary-foreground)" }}> 
                Зареєструвати гурт — це безкоштовно 
              </Button>
            </Link>
         ) : (
            <Link href="/dashboard">
              <Button size="lg" style={{ fontSize: 17, padding: "16px 36px", height: "auto", background: "var(--primary)", color: "var(--primary-foreground)" }}> 
                Перейти в кабінет 
              </Button>
            </Link>
         )}
       </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 5%", background: "var(--surface)" }}> 
         <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}> 
           <div className="flex items-center gap-2">
             <div className="bg-primary text-white p-1 rounded-md">
               <Music2 className="h-4 w-4" />
             </div>
             <span className="text-xl font-display font-bold text-primary">BandFlow</span>
           </div>
           <p style={{ fontSize: 13, color: "var(--text2)" }}>© 2025 BandFlow. Всі права захищені.</p> 
         </div> 
      </footer>
    </div>
  )
}
