import { create } from 'zustand'

interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  timezone: string
  measurement_unit: string
  tone_preference: string
  is_premium: boolean
  onboarding_completed: boolean
  dark_mode: boolean
}

interface Family {
  id: string
  name: string
  invite_code: string
  members: FamilyMember[]
  children: Child[]
}

interface FamilyMember {
  id: string
  profile_id: string
  display_name: string
  avatar_url: string | null
  role: string
}

interface Child {
  id: string
  name: string
  date_of_birth: string | null
  avatar_url: string | null
  dietary_preferences: Record<string, unknown>
  medical_history: Record<string, unknown>
}

interface AppState {
  profile: Profile | null
  family: Family | null
  sidebarOpen: boolean
  notifications: number

  setProfile: (profile: Profile | null) => void
  setFamily: (family: Family | null) => void
  toggleSidebar: () => void
  setNotifications: (count: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  family: null,
  sidebarOpen: true,
  notifications: 0,

  setProfile: (profile) => set({ profile }),
  setFamily: (family) => set({ family }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setNotifications: (count) => set({ notifications: count }),
}))
