import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    const { data: config, error } = await supabase
        .from('trading_config')
        .select('iol_username, iol_password, iol_api_key, iol_api_secret')
        .limit(1)
        .maybeSingle()

    return NextResponse.json({
        hasConfig: !!config,
        hasUsername: !!config?.iol_username,
        hasPassword: !!config?.iol_password,
        hasApiKey: !!config?.iol_api_key,
        hasApiSecret: !!config?.iol_api_secret,
        error: error?.message || null
    })
}
