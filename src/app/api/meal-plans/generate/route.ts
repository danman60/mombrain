import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

export async function POST(request: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const { family_size, dietary_restrictions, preferences, budget, time_constraints } = await request.json()

  // Fetch children dietary preferences
  const { data: children } = await supabase
    .from('mb_children')
    .select('name, dietary_preferences')
    .eq('family_id', familyId)

  const childDiets = (children || [])
    .filter((c: { dietary_preferences: Record<string, unknown> }) => Object.keys(c.dietary_preferences || {}).length > 0)
    .map((c: { name: string; dietary_preferences: Record<string, unknown> }) => `${c.name}: ${JSON.stringify(c.dietary_preferences)}`)
    .join('\n')

  const prompt = `Generate a 7-day meal plan (Monday to Sunday) with Breakfast, Lunch, Dinner, and Snack for each day.

Family size: ${family_size || 'Not specified'}
Dietary restrictions: ${dietary_restrictions || 'None'}
Preferences: ${preferences || 'None'}
Budget: ${budget || 'Any'}
Time constraints: ${time_constraints || 'None'}
${childDiets ? `Children dietary needs:\n${childDiets}` : ''}

Return ONLY valid JSON in this exact format:
{
  "meals": [
    {
      "title": "Meal Name",
      "description": "Brief description",
      "ingredients": [{"name": "ingredient", "quantity": "amount"}],
      "instructions": ["Step 1", "Step 2"],
      "prep_time": 30,
      "servings": 4,
      "tags": ["quick", "healthy"]
    }
  ],
  "plan": {
    "monday": {"breakfast": 0, "lunch": 1, "dinner": 2, "snack": 3},
    "tuesday": {"breakfast": 4, "lunch": 5, "dinner": 6, "snack": 7}
  }
}
Where the numbers in "plan" are indexes into the "meals" array.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a meal planning assistant. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    // Create meals in DB
    const mealIds: string[] = []
    for (const meal of result.meals || []) {
      const { data: mealRecord } = await supabase
        .from('mb_meals')
        .insert({
          family_id: familyId,
          title: meal.title,
          description: meal.description,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          prep_time: meal.prep_time,
          servings: meal.servings,
          tags: meal.tags,
          ai_generated: true,
        })
        .select('id')
        .single()
      if (mealRecord) mealIds.push(mealRecord.id)
    }

    // Build plan_data with actual meal IDs
    const planData: Record<string, Record<string, string>> = {}
    for (const [day, slots] of Object.entries(result.plan || {})) {
      planData[day] = {}
      for (const [slot, idx] of Object.entries(slots as Record<string, number>)) {
        if (mealIds[idx]) planData[day][slot] = mealIds[idx]
      }
    }

    // Get Monday of current week
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - now.getDay() + 1)
    const weekStart = monday.toISOString().split('T')[0]

    const { data: mealPlan } = await supabase
      .from('mb_meal_plans')
      .insert({
        family_id: familyId,
        week_start_date: weekStart,
        plan_data: planData,
        created_by: user!.id,
      })
      .select()
      .single()

    return jsonResponse({ meal_plan: mealPlan, meals_created: mealIds.length })
  } catch (err) {
    console.error('AI meal plan generation error:', err)
    return jsonResponse({ error: 'Failed to generate meal plan' }, 500)
  }
}
