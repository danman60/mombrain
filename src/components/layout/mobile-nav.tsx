'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ChefHat, Calendar, CheckSquare, MessageCircle, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Brain } from 'lucide-react'
import { AppSidebar } from './app-sidebar'

const bottomNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/meals', icon: ChefHat, label: 'Meals' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/ai', icon: MessageCircle, label: 'AI' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">MomBrain</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <AppSidebar />
          </SheetContent>
        </Sheet>
      </header>

      {/* Bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t flex justify-around py-2 px-1">
        {bottomNavItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex-1">
            <div className={cn(
              'flex flex-col items-center gap-0.5 py-1 text-xs',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'text-primary'
                : 'text-muted-foreground'
            )}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </div>
          </Link>
        ))}
      </nav>
    </>
  )
}
