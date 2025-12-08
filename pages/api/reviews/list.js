import { supabase } from '../../../lib/supabase_server'
export default async function handler(req,res){
  const vendor_id = req.query.vendor_id
  const { data } = await supabase.from('reviews').select('*, users:users(id, name)').eq('vendor_id', vendor_id).eq('approved', true).order('created_at',{ascending:false})
  return res.json({ reviews: data })
}
