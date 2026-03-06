'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/stores/useAppStore'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const setProfile = useAppStore((s) => s.setProfile)
  const setFamily = useAppStore((s) => s.setFamily)

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load profile
      const { data: profile } = await supabase
        .from('mb_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) setProfile(profile)

      // Load family
      const { data: membership } = await supabase
        .from('mb_family_members')
        .select('family_id')
        .eq('profile_id', user.id)
        .single()

      if (membership) {
        const { data: family } = await supabase
          .from('mb_families')
          .select('*')
          .eq('id', membership.family_id)
          .single()

        const { data: members } = await supabase
          .from('mb_family_members')
          .select('id, profile_id, role, mb_profiles(display_name, avatar_url)')
          .eq('family_id', membership.family_id)

        const { data: children } = await supabase
          .from('mb_children')
          .select('*')
          .eq('family_id', membership.family_id)

        if (family) {
          setFamily({
            ...family,
            members: (members || []).map((m: Record<string, unknown>) => ({
              id: m.id as string,
              profile_id: m.profile_id as string,
              display_name: (m.mb_profiles as Record<string, unknown>)?.display_name as string || '',
              avatar_url: (m.mb_profiles as Record<string, unknown>)?.avatar_url as string | null,
              role: m.role as string,
            })),
            children: children || [],
          })
        }
      }
    }

    loadUserData()
  }, [setProfile, setFamily])

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <div className="flex-1 flex flex-col min-h-screen">
        <MobileNav />
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
