import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'xp'

    const supabase = await createClient()

    const orderField = tab === 'xp' ? 'xp' : 'streak'

    // Use the user_public VIEW (bypasses RLS, returns all users)
    const { data, error } = await supabase
        .schema('kasa_learn_journey')
        .from('user_public')
        .select('id, display_name, profile_url, xp, streak')
        .order(orderField, { ascending: false, nullsFirst: false })
        .limit(10)

    console.log('📊 [API/ranking] Raw user_public query:', { tab, orderField, count: data?.length, data, error })

    if (error) {
        console.error('❌ [API/ranking] Error fetching rankings:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rankings = (data || []).map((user: any, index: number) => {
        const name = user.display_name || 'User'

        return {
            id: user.id,
            name,
            avatar: user.profile_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E293B&color=94A3B8`,
            rank: index + 1,
            xp: user.xp || 0,
            streak: user.streak || 0,
            level: `${user.xp || 0} XP`,
            title: `${user.xp || 0} XP`,
        }
    })

    console.log('📊 [API/ranking] tab:', tab, '| results:', JSON.stringify(rankings, null, 2))

    return NextResponse.json(rankings)
}
