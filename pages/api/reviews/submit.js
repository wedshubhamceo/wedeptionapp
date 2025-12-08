import { supabase } from '../../../lib/supabase_server'
import { verifyFirebaseTokenFromHeader } from '../../../lib/firebase_server'

// Submit a review - only if the user has a lead with this vendor (as per choice 2A)
export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  try {
    const userId = await verifyFirebaseTokenFromHeader(req)
    const { vendor_id, rating, comment, photos } = req.body
    // check if user had a lead with this vendor
    const { data: lead } = await supabase.from('leads').select('*').eq('vendor_id', vendor_id).eq('user_id', userId).limit(1).single()
    if(!lead) return res.status(403).json({ error: 'You can review only after contacting/vendor interaction' })
    const { data, error } = await supabase.from('reviews').insert([{ vendor_id, user_id: userId, rating, comment, photos, approved: false }]).select().single()
    if(error) return res.status(500).json({ error: error.message })
    return res.json({ ok:true, review: data })
  } catch(e){
    return res.status(401).json({ error: e.message })
  }
}
