import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const { data: photos, error } = await supabase
    .from('photos')
    .select(`
      id,
      title,
      image_url,
      created_at,
      user_id,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(photos);
}