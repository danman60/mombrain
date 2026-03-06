import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'

export async function POST(request: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const { meal_plan_id } = await request.json()

  const { data: mealPlan } = await supabase
    .from('mb_meal_plans')
    .select('plan_data')
    .eq('id', meal_plan_id)
    .single()

  if (!mealPlan) return jsonResponse({ error: 'Meal plan not found' }, 404)

  // Collect all meal IDs from plan
  const mealIds = new Set<string>()
  for (const slots of Object.values(mealPlan.plan_data as Record<string, Record<string, string>>)) {
    for (const mealId of Object.values(slots)) {
      mealIds.add(mealId)
    }
  }

  // Fetch meals
  const { data: meals } = await supabase
    .from('mb_meals')
    .select('ingredients')
    .in('id', Array.from(mealIds))

  // Aggregate ingredients
  const ingredientMap = new Map<string, { name: string; qty: string; category: string }>()
  for (const meal of meals || []) {
    for (const ing of (meal.ingredients as Array<{ name: string; quantity: string }>) || []) {
      const key = ing.name.toLowerCase()
      if (!ingredientMap.has(key)) {
        ingredientMap.set(key, { name: ing.name, qty: ing.quantity, category: 'General' })
      }
    }
  }

  const items = Array.from(ingredientMap.values()).map((i) => ({ ...i, checked: false }))

  const { data: list } = await supabase
    .from('mb_shopping_lists')
    .insert({
      family_id: familyId,
      meal_plan_id,
      title: 'Shopping List',
      items,
    })
    .select()
    .single()

  return jsonResponse(list, 201)
}
