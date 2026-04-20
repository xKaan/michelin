import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Michelin</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">shadcn + Tailwind v4 opérationnel.</p>
          <Button>Primaire</Button>
          <Button variant="outline">Outline</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
