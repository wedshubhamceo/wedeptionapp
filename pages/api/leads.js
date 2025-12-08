import { supabase } from '../../lib/supabase_server'
export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  const { vendor_id, name, contact_phone, event_date, budget, details } = req.body
  const { data, error } = await supabase.from('leads').insert([{ vendor_id, name, contact_phone, event_date, budget_range: budget, details }]).select().single()
  if(error) return res.status(500).json({ error: error.message })
  // In production, notify vendor via FCM/email
  return res.json({ ok:true, lead: data })
}
