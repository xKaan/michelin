import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { MapPin, Star, Users, ChevronDown } from 'lucide-react'

const features = [
  {
    icon: MapPin,
    title: 'Carte interactive',
    desc: 'Explorez les restaurants étoilés autour de vous sur une carte intuitive.',
  },
  {
    icon: Star,
    title: 'Établissements d\'exception',
    desc: 'Accédez aux fiches détaillées des tables distinguées par le Guide.',
  },
  {
    icon: Users,
    title: 'Communauté',
    desc: 'Partagez vos expériences avec les passionnés de gastronomie.',
  },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <section
        className="relative flex flex-col items-center justify-center px-6 py-10 text-center overflow-hidden bg-primary"
        style={{ minHeight: '42vh' }}
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full border-2 border-white/10" />
        <div className="absolute top-16 -right-6 w-24 h-24 rounded-full border border-white/8" />
        <div className="absolute -bottom-8 -left-10 w-56 h-56 rounded-full border-2 border-white/10" />
        <div className="absolute bottom-20 left-4 w-14 h-14 rounded-full border border-white/8" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-2 border-white/30 flex items-center justify-center mb-5 shadow-lg">
            <span className="text-4xl font-bold text-white tracking-tighter leading-none">M</span>
          </div>

          <div className="flex justify-center gap-2 mb-5">
            <Star className="w-4 h-4 fill-white text-white" />
            <Star className="w-4 h-4 fill-white text-white" />
            <Star className="w-4 h-4 fill-white text-white" />
          </div>

          <h1 className="text-4xl font-bold text-white tracking-tight mb-3 leading-tight">
            Guide Michelin
          </h1>
          <p className="text-white/75 text-sm max-w-[260px] leading-relaxed">
            Découvrez les meilleures tables et rejoignez la communauté gastronomique.
          </p>
        </div>

        <ChevronDown className="absolute bottom-6 text-white/50 w-6 h-6 animate-bounce" />
      </section>

      <section className="flex-1 px-6 py-10">
        <div className="flex flex-col gap-3 max-w-xs mx-auto mb-12">
          <Button size="lg" className="w-full" onClick={() => navigate('/login')}>
            Se connecter
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full border-primary/25 text-primary hover:bg-primary/5 hover:text-primary"
            onClick={() => navigate('/register')}
          >
            Créer un compte
          </Button>
        </div>

        <div className="max-w-xs mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground text-center mb-8">
            Pourquoi rejoindre
          </p>
          <div className="flex flex-col gap-7">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}