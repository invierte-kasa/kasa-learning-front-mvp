import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function mapUsers(list: any[]) {
    return list.slice(0, 10).map((user: any, index: number) => {
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
}

export async function GET(_request: NextRequest) {
    const supabase = await createClient()

    const { data, error } = await supabase.functions.invoke('get-leaderboard', {
        method: 'GET',
    })

    if (error) {
        console.error('❌ [API/ranking] Error calling get-leaderboard:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        by_xp: mapUsers(data.by_xp || []),
        by_streak: mapUsers(data.by_streak || []),
    })
}
