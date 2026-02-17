import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'xp'

    const supabase = await createClient()

    const orderField = tab === 'xp' ? 'xp' : 'streak'

    const { data, error } = await supabase
        .schema('kasa_learn_journey')
        .from('user')
        .select('id, user_id, display_name, xp, streak, current_level')
        .order(orderField, { ascending: false })
        .limit(10)

    if (error) {
        console.error('❌ [API/ranking] Error fetching rankings:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch profile data (names, avatars) for all ranked users
    const userIds = (data || []).map((u: any) => u.user_id)

    const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, names_first, names_last, url_profile')
        .in('user_id', userIds)

    const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
    )

    const rankings = (data || []).map((user: any, index: number) => {
        const profile = profileMap.get(user.user_id) as any
        const name = profile?.names_first
            ? `${profile.names_first}${profile.names_last ? ' ' + profile.names_last.charAt(0) + '.' : ''}`
            : user.display_name || 'User'

        return {
            id: user.id,
            user_id: user.user_id,
            name,
            avatar: profile?.url_profile || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E293B&color=94A3B8`,
            rank: index + 1,
            xp: user.xp || 0,
            streak: user.streak || 0,
            level: `Lvl ${user.current_level || 1}`,
            title: `LEVEL ${user.current_level || 1}`,
        }
    })

    return NextResponse.json(rankings)
}
