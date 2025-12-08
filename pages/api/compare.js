import { supabase } from '../../lib/supabase_server'
export default async function handler(req,res){
  const ids = (req.query.ids || '').split(',').map(s=>s.trim()).filter(Boolean)
  if(ids.length===0) return res.json({ vendors: [] })
  // use vendor_summary view
  const { data } = await supabase.from('vendor_summary').select('*').in('id', ids)
  return res.json({ vendors: data })
}
