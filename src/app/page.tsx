'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Brain, Calendar, ChefHat, CheckSquare, Heart,
  MessageCircle, Sparkles, Users, ArrowRight, Star, Shield, Zap
} from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  { icon: ChefHat, title: 'Meal Planning', desc: 'AI-powered weekly meal plans with smart shopping lists tailored to your family.', color: 'text-orange-500' },
  { icon: Calendar, title: 'Family Calendar', desc: 'Color-coded events, reminders, and shared scheduling everyone can see.', color: 'text-emerald-500' },
  { icon: CheckSquare, title: 'Task Management', desc: 'Kanban boards for chores, errands, and school — assign and track progress.', color: 'text-violet-500' },
  { icon: MessageCircle, title: 'AI Assistant', desc: 'Your 24/7 parenting co-pilot that knows your family and adapts to your style.', color: 'text-rose-500' },
  { icon: Heart, title: 'Health Tracking', desc: 'Sleep, mood, and cycle tracking with beautiful charts and insights.', color: 'text-pink-500' },
  { icon: Users, title: 'Mom Community', desc: 'Share tips, recipes, and wins with other moms. Upvote what helps most.', color: 'text-cyan-500' },
]

const steps = [
  { num: '01', title: 'Create your family', desc: 'Sign up, name your family, and invite your partner with a simple code.' },
  { num: '02', title: 'Set your preferences', desc: 'Tell us about your kids, dietary needs, and how you like your AI assistant to talk.' },
  { num: '03', title: 'Let MomBrain handle the rest', desc: 'Generate meal plans, organize tasks, track health — and earn badges along the way.' },
]

const stats = [
  { value: '7-day', label: 'AI meal plans' },
  { value: '24/7', label: 'AI assistant' },
  { value: '5+', label: 'family tools' },
  { value: '100%', label: 'free to start' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">MomBrain</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" className="cursor-pointer">Log In</Button>
          </Link>
          <Link href="/register">
            <Button className="cursor-pointer">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" /> AI-powered family productivity
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
            Your family&apos;s<br />
            <span className="text-primary">second brain</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Plan meals, manage schedules, track health, and keep your whole family organized — with an AI assistant that actually knows your kids.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6 cursor-pointer shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                Start Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 cursor-pointer">
                I have an account
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need, nothing you don&apos;t</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Built by parents, for parents. Every feature solves a real problem moms face daily.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all duration-200 cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <f.icon className={`h-6 w-6 ${f.color}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-card border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Up and running in 3 steps</h2>
            <p className="text-muted-foreground text-lg">No setup headaches. No learning curve.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 * i }}
                className="relative"
              >
                <span className="text-6xl font-bold text-primary/10">{step.num}</span>
                <h3 className="text-lg font-semibold mt-2 mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold">Private & Secure</h3>
            <p className="text-sm text-muted-foreground">Your family data stays yours. End-to-end security with Supabase.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Zap className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold">Blazing Fast</h3>
            <p className="text-sm text-muted-foreground">Built on Next.js for instant loads. Works great on your phone too.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Star className="h-6 w-6 text-violet-600" />
            </div>
            <h3 className="font-semibold">Gamified</h3>
            <p className="text-sm text-muted-foreground">Earn points, streaks, and badges. Staying organized has never been this fun.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center px-6 py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Brain className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get organized?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">
            Join moms who are simplifying family life with AI-powered productivity.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-10 py-6 cursor-pointer shadow-lg shadow-primary/20">
              Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} MomBrain. Made with love for moms everywhere.</p>
      </footer>
    </div>
  )
}
