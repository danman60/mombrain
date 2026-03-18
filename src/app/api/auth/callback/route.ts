import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('[auth/callback GET] called')
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if onboarding completed
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('mb_profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        if (profile && !profile.onboarding_completed) {
          console.log('[auth/callback GET] redirecting to onboarding')
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      console.log('[auth/callback GET] success, redirecting to:', next)
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[auth/callback GET] error exchanging code:', error.message)
  }

  console.error('[auth/callback GET] no code or exchange failed, redirecting to login')
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
