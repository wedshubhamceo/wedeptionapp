import { supabase } from '../../lib/supabase_server'
export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  const { post_id, user_id, post_type = 'portfolio' } = req.body
  
  // Get user_id from auth if available
  let userId = user_id
  if (!userId && req.headers.authorization) {
    // Try to extract user from token if needed
    // For now, we'll use the provided user_id or null for anonymous
  }
  
  if (post_type === 'inspiration') {
    // Handle inspiration feed likes
    const { data, error } = await supabase.rpc('increment_like', { 
      p_id: post_id, 
      p_user_id: userId 
    })
    if(error) return res.status(500).json({ error: error.message })
    return res.json(data)
  } else {
    // Handle portfolio/feed likes
    const { data, error } = await supabase.rpc('increment_like', { 
      p_id: post_id, 
      p_user_id: userId 
    })
  if(error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }
}
