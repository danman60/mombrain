import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://netbsyvxrhrqxyzqflmd.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function seed() {
  console.log('[seed] Starting...')

  // 1. Create test user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'test@mombrain.app',
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: { full_name: 'Sarah Johnson' },
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('[seed] Test user already exists, looking up...')
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const existing = users.find(u => u.email === 'test@mombrain.app')
      if (!existing) { console.error('[seed] Cannot find existing user'); return }
      await seedData(existing.id)
    } else {
      console.error('[seed] Auth error:', authError.message)
      return
    }
  } else {
    console.log('[seed] Test user created:', authUser.user.id)
    // Wait for trigger to create profile + gamification
    await new Promise(r => setTimeout(r, 2000))
    await seedData(authUser.user.id)
  }

  console.log('[seed] Done!')
}

async function seedData(userId: string) {
  // 2. Update profile
  await supabase
    .from('mb_profiles')
    .update({
      display_name: 'Sarah Johnson',
      timezone: 'America/New_York',
      measurement_unit: 'imperial',
      tone_preference: 'supportive',
      onboarding_completed: true,
    })
    .eq('id', userId)
  console.log('[seed] Profile updated')

  // 3. Create family
  const { data: family } = await supabase
    .from('mb_families')
    .insert({ name: 'The Johnson Family', created_by: userId })
    .select()
    .single()

  if (!family) { console.error('[seed] Failed to create family'); return }
  console.log('[seed] Family created:', family.id, 'code:', family.invite_code)

  // 4. Add as family member
  await supabase
    .from('mb_family_members')
    .insert({ family_id: family.id, profile_id: userId, role: 'admin' })
  console.log('[seed] Family member added')

  // 5. Add children
  const { data: children } = await supabase
    .from('mb_children')
    .insert([
      {
        family_id: family.id,
        name: 'Emma',
        date_of_birth: '2021-04-15',
        dietary_preferences: { allergies: ['peanuts'], likes: ['pasta', 'strawberries'] },
        medical_history: { vaccinations_up_to_date: true },
        notes: 'Loves drawing and animals',
      },
      {
        family_id: family.id,
        name: 'Liam',
        date_of_birth: '2023-09-22',
        dietary_preferences: { allergies: [], likes: ['bananas', 'chicken nuggets'] },
        medical_history: { vaccinations_up_to_date: true },
        notes: 'Starting to walk, very curious',
      },
    ])
    .select()
  console.log('[seed] Children created:', children?.length)

  // 6. Add meals
  const { data: meals } = await supabase
    .from('mb_meals')
    .insert([
      {
        family_id: family.id,
        title: 'One-Pan Lemon Herb Chicken',
        description: 'A simple weeknight dinner with roasted chicken thighs and seasonal vegetables.',
        ingredients: ['4 chicken thighs', '2 cups broccoli florets', '1 lemon', '2 tbsp olive oil', 'Salt, pepper, Italian herbs'],
        instructions: ['Preheat oven to 425°F', 'Season chicken with herbs, salt and pepper', 'Arrange chicken and broccoli on sheet pan', 'Squeeze lemon over everything', 'Roast 25-30 min until chicken reaches 165°F'],
        prep_time: 10,
        servings: 4,
        tags: ['dinner', 'quick', 'kid-friendly'],
        ai_generated: false,
        is_favorite: true,
      },
      {
        family_id: family.id,
        title: 'Overnight Oats with Berries',
        description: 'Prep the night before for an effortless breakfast. Emma loves this one.',
        ingredients: ['1 cup rolled oats', '1 cup milk', '1/2 cup Greek yogurt', '2 tbsp honey', '1/2 cup mixed berries', 'Chia seeds'],
        instructions: ['Combine oats, milk, yogurt, and honey in a jar', 'Stir in chia seeds', 'Refrigerate overnight', 'Top with berries in the morning'],
        prep_time: 5,
        servings: 2,
        tags: ['breakfast', 'meal-prep', 'kid-friendly'],
        ai_generated: false,
        is_favorite: false,
      },
      {
        family_id: family.id,
        title: 'Turkey Taco Bowl',
        description: 'AI-generated weeknight dinner — healthy twist on taco night.',
        ingredients: ['1 lb ground turkey', '1 can black beans', '1 cup rice', 'Salsa', 'Avocado', 'Cheese', 'Lettuce'],
        instructions: ['Cook rice per package directions', 'Brown turkey with taco seasoning', 'Warm black beans', 'Assemble bowls with rice, turkey, beans', 'Top with salsa, avocado, cheese, lettuce'],
        prep_time: 20,
        servings: 4,
        tags: ['dinner', 'quick', 'healthy'],
        ai_generated: true,
        is_favorite: false,
      },
      {
        family_id: family.id,
        title: 'Banana Pancakes',
        description: 'Weekend treat. Liam goes crazy for these.',
        ingredients: ['2 ripe bananas', '2 eggs', '1/2 cup flour', '1 tsp baking powder', 'Maple syrup'],
        instructions: ['Mash bananas', 'Whisk in eggs', 'Add flour and baking powder', 'Cook on griddle until golden', 'Serve with maple syrup'],
        prep_time: 15,
        servings: 3,
        tags: ['breakfast', 'weekend', 'kid-favorite'],
        ai_generated: false,
        is_favorite: true,
      },
      {
        family_id: family.id,
        title: 'Veggie Stir-Fry with Tofu',
        description: 'Quick vegetarian option for busy Mondays.',
        ingredients: ['1 block firm tofu', '2 cups mixed vegetables', '3 tbsp soy sauce', '1 tbsp sesame oil', '1 clove garlic', 'Rice'],
        instructions: ['Press and cube tofu', 'Stir-fry tofu until golden', 'Add vegetables and garlic', 'Add soy sauce and sesame oil', 'Serve over rice'],
        prep_time: 25,
        servings: 4,
        tags: ['dinner', 'vegetarian', 'quick'],
        ai_generated: true,
        is_favorite: false,
      },
    ])
    .select()
  console.log('[seed] Meals created:', meals?.length)

  // 7. Add events
  const now = new Date()
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
  const dayAfter = new Date(now); dayAfter.setDate(now.getDate() + 2)

  await supabase
    .from('mb_events')
    .insert([
      {
        family_id: family.id,
        title: 'Emma Dance Class',
        description: 'Ballet at Sunshine Studio',
        start_time: new Date(tomorrow.setHours(16, 0, 0)).toISOString(),
        end_time: new Date(tomorrow.setHours(17, 0, 0)).toISOString(),
        location: 'Sunshine Dance Studio',
        color: '#FF6B8A',
        created_by: userId,
      },
      {
        family_id: family.id,
        title: 'Pediatrician — Liam Checkup',
        description: '18-month wellness visit',
        start_time: new Date(dayAfter.setHours(10, 30, 0)).toISOString(),
        end_time: new Date(dayAfter.setHours(11, 30, 0)).toISOString(),
        location: 'Dr. Patel Pediatrics',
        color: '#10B981',
        created_by: userId,
      },
      {
        family_id: family.id,
        title: 'Grocery Run',
        start_time: new Date(now.setHours(14, 0, 0)).toISOString(),
        color: '#F59E0B',
        created_by: userId,
      },
    ])
  console.log('[seed] Events created')

  // 8. Add tasks
  await supabase
    .from('mb_tasks')
    .insert([
      { family_id: family.id, title: 'Organize playroom', priority: 'medium', status: 'todo', category: 'chores', assigned_to: userId, created_by: userId },
      { family_id: family.id, title: 'Buy Emma new shoes', priority: 'high', status: 'todo', category: 'errands', created_by: userId },
      { family_id: family.id, title: 'Schedule dentist for kids', priority: 'medium', status: 'in_progress', category: 'health', assigned_to: userId, created_by: userId },
      { family_id: family.id, title: 'Meal prep for the week', priority: 'high', status: 'in_progress', category: 'chores', assigned_to: userId, created_by: userId },
      { family_id: family.id, title: 'Return library books', priority: 'low', status: 'done', category: 'errands', created_by: userId },
    ])
  console.log('[seed] Tasks created')

  // 9. Add health logs
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  await supabase
    .from('mb_health_logs')
    .insert([
      { profile_id: userId, log_type: 'sleep', log_data: { hours: 6.5, quality: 3, notes: 'Liam woke up at 3am' } },
      { profile_id: userId, log_type: 'mood', log_data: { mood: 1, journal: 'Good day overall. Emma made me a drawing.' } },
      { profile_id: userId, log_type: 'cycle', log_data: { type: 'start' } },
    ])
  console.log('[seed] Health logs created')

  // 10. Add community posts
  const { data: posts } = await supabase
    .from('mb_community_posts')
    .insert([
      {
        author_id: userId,
        category: 'tip',
        title: 'Game-changer: prep snack boxes on Sunday',
        body: 'I started prepping individual snack boxes for the week every Sunday. Each box has a fruit, a protein, and a crunchy snack. The kids grab them from the fridge and I save at least 20 minutes a day.',
      },
      {
        author_id: userId,
        category: 'win',
        title: 'Emma slept through the night!',
        body: 'After 3 weeks of the new bedtime routine, Emma finally slept through the night without waking up once. The consistent routine really worked. So grateful.',
      },
    ])
    .select()
  console.log('[seed] Community posts created:', posts?.length)

  // Add a comment on the first post
  if (posts?.[0]) {
    await supabase
      .from('mb_community_comments')
      .insert({ post_id: posts[0].id, author_id: userId, body: 'This is such a great idea! Going to try it this weekend.' })
  }

  // 11. Add shopping list
  await supabase
    .from('mb_shopping_lists')
    .insert({
      family_id: family.id,
      title: 'Weekly Groceries',
      items: [
        { name: 'Chicken thighs (2 lbs)', qty: '1 pack', category: 'Meat', checked: false },
        { name: 'Broccoli', qty: '2 heads', category: 'Produce', checked: false },
        { name: 'Bananas', qty: '1 bunch', category: 'Produce', checked: true },
        { name: 'Greek yogurt', qty: '32 oz', category: 'Dairy', checked: false },
        { name: 'Mixed berries', qty: '1 pint', category: 'Produce', checked: false },
        { name: 'Ground turkey', qty: '1 lb', category: 'Meat', checked: false },
        { name: 'Black beans', qty: '2 cans', category: 'Pantry', checked: true },
        { name: 'Rolled oats', qty: '1 canister', category: 'Pantry', checked: false },
      ],
    })
  console.log('[seed] Shopping list created')

  // 12. Update gamification
  await supabase
    .from('mb_gamification')
    .update({ points: 145, streak_days: 7, level: 2, badges: ['meal_prep_queen'] })
    .eq('profile_id', userId)

  await supabase
    .from('mb_gamification_log')
    .insert([
      { profile_id: userId, action: 'task_completed', points_earned: 10 },
      { profile_id: userId, action: 'meal_plan_created', points_earned: 25 },
      { profile_id: userId, action: 'community_post', points_earned: 15 },
      { profile_id: userId, action: 'health_log', points_earned: 5 },
      { profile_id: userId, action: 'daily_login', points_earned: 5 },
    ])
  console.log('[seed] Gamification updated')
}

seed().catch(console.error)
