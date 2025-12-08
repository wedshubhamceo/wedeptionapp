import { verifyFirebaseTokenFromHeader } from '../../../lib/firebase_server'
import { supabase } from '../../../lib/supabase_server'
export default async function handler(req,res){
  try {
    const userId = await verifyFirebaseTokenFromHeader(req)
    const vendor_id = req.query.vendor_id
    const { data } = await supabase.from('leads').select('*').eq('vendor_id', vendor_id).eq('user_id', userId).limit(1)
    return res.json({ canReview: (data && data.length>0) })
  } catch(e){
    return res.json({ canReview: false })
  }
}
