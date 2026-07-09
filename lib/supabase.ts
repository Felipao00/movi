import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bmssvvbyqrikgvieobzq.supabase.co';
const supabaseKey = 'sb_publishable_qS18whv6h6mFtZUEZ66waw_yPQZ72R6';

export const supabase = createClient(supabaseUrl, supabaseKey);