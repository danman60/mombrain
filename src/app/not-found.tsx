import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-md">
        <Brain className="h-12 w-12 text-muted-foreground mx-auto" />
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">
          This page doesn&apos;t exist. Maybe it wandered off like a toddler.
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
