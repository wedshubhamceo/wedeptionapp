import { supabase } from '../../lib/supabase_server'
import { verifyFirebaseTokenFromHeader } from '../../lib/firebase_server'
export default async function handler(req,res){
  try {
    const userId = await verifyFirebaseTokenFromHeader(req)
    const { data: vendor } = await supabase.from('vendors').select('*').eq('user_id', userId).single()
    if(!vendor) return res.json({ chats: [] })
    // For demo, fetch leads as chats
    const { data: leads } = await supabase.from('leads').select('*').eq('vendor_id', vendor.id).order('created_at',{ascending:false})
    const chats = leads.map(l=> ({ id: l.id, user_name: l.name, contact_phone: l.contact_phone, last_message: l.details && JSON.stringify(l.details) }))
    return res.json({ chats })
  } catch(e){
    return res.status(401).json({ error: e.message })
  }
}
