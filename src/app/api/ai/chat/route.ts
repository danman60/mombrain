import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { messages, conversation_id } = await request.json()
  const familyId = await getUserFamilyId(supabase, user!.id)

  // Gather context
  const [profileRes, eventsRes, tasksRes, childrenRes] = await Promise.all([
    supabase.from('mb_profiles').select('*').eq('id', user!.id).single(),
    familyId
      ? supabase.from('mb_events').select('title, start_time').eq('family_id', familyId)
          .gte('start_time', new Date().toISOString()).order('start_time').limit(5)
      : Promise.resolve({ data: [] }),
    familyId
      ? supabase.from('mb_tasks').select('title, priority, status, due_date').eq('family_id', familyId)
          .neq('status', 'done').limit(10)
      : Promise.resolve({ data: [] }),
    familyId
      ? supabase.from('mb_children').select('name, date_of_birth, dietary_preferences, medical_history')
          .eq('family_id', familyId)
      : Promise.resolve({ data: [] }),
  ])

  const profile = profileRes.data
  const tone = profile?.tone_preference || 'supportive'

  const contextStr = `
User: ${profile?.display_name || 'Mom'}
Tone preference: ${tone}
Upcoming events: ${JSON.stringify(eventsRes.data || [])}
Pending tasks: ${JSON.stringify(tasksRes.data || [])}
Children: ${JSON.stringify(childrenRes.data || [])}
  `.trim()

  const systemPrompt = `You are MomBrain, a warm and ${tone} AI assistant for moms. You have access to the user's family data:

${contextStr}

Help with meal planning, scheduling, task management, parenting advice, and general family organization. Keep responses concise and actionable. Use the user's family context to personalize your responses.`

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ''
          fullResponse += text
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        }

        // Save conversation
        if (conversation_id) {
          await supabase
            .from('mb_ai_conversations')
            .update({
              messages: [...messages, { role: 'assistant', content: fullResponse }],
            })
            .eq('id', conversation_id)
        } else {
          await supabase
            .from('mb_ai_conversations')
            .insert({
              profile_id: user!.id,
              messages: [...messages, { role: 'assistant', content: fullResponse }],
              context_type: 'chat',
            })
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    })
  } catch (err) {
    console.error('AI chat error:', err)
    return jsonResponse({ error: 'Failed to generate response' }, 500)
  }
}
