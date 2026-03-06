'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Calendar, ChefHat, CheckSquare, Heart, MessageCircle, Sparkles, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  { icon: ChefHat, title: 'Meal Planning', desc: 'AI-powered weekly meal plans with smart shopping lists' },
  { icon: Calendar, title: 'Family Calendar', desc: 'Keep everyone on the same page with shared scheduling' },
  { icon: CheckSquare, title: 'Task Management', desc: 'Kanban boards to organize chores, errands, and more' },
  { icon: MessageCircle, title: 'AI Assistant', desc: 'Your personal parenting co-pilot, available 24/7' },
  { icon: Heart, title: 'Health Tracking', desc: 'Monitor sleep, mood, and wellness for the whole family' },
  { icon: Users, title: 'Community', desc: 'Connect with other moms, share tips, and celebrate wins' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">MomBrain</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      <section className="text-center px-6 py-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Your family&apos;s{' '}
            <span className="text-primary">second brain</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered productivity for busy moms. Plan meals, manage schedules, track health, and keep your family organized — all in one place.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-6">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Free
            </Button>
          </Link>
        </motion.div>
      </section>

      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow"
            >
              <f.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="text-center px-6 py-16 bg-primary/5">
        <h2 className="text-3xl font-bold mb-4">Ready to get organized?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Join thousands of moms who are simplifying their family life with MomBrain.
        </p>
        <Link href="/register">
          <Button size="lg">Create Free Account</Button>
        </Link>
      </section>

      <footer className="text-center py-8 text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} MomBrain. Made with love for moms everywhere.</p>
      </footer>
    </div>
  )
}
