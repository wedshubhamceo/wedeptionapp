
import { supabase } from '../../lib/supabase_server'
import { verifyFirebaseTokenFromHeader } from '../../lib/firebase_server'

export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  try {
    const userId = await verifyFirebaseTokenFromHeader(req)
    const body = req.body
    // Normalize services
    const services = Array.isArray(body.services) ? body.services : (body.services ? body.services.split(',') : [])
    const price_range = { min: body.price_min || null, max: body.price_max || null }
    const vendorRow = {
      user_id: userId,
      business_name: body.business_name,
      contact_person: body.contact_person,
      email: body.email,
      phone: body.phone,
      whatsapp: body.whatsapp,
      business_address: body.business_address,
      city: body.city,
      years_experience: body.years_experience ? parseInt(body.years_experience) : null,
      services: services,
      price_range: price_range,
      website: body.website,
      instagram: body.instagram,
      facebook: body.facebook,
      youtube: body.youtube,
      brand_description: body.brand_description,
      why_choose: body.why_choose,
      deals: body.deals,
      gst_number: body.gst_number,
      pan_number: body.pan_number,
      other_services: body.other_services || null,
      verified: false
    }
    const { data, error } = await supabase.from('vendors').insert([vendorRow]).select().single()
    if(error) return res.status(500).json({ error: error.message })
    // store portfolio links if provided
    if(body.portfolio_urls && Array.isArray(body.portfolio_urls)){
      const posts = body.portfolio_urls.map(url=> ({ vendor_id: data.id, media_url: url, media_type: 'image', caption: 'Portfolio upload', approved: false }))
      await supabase.from('vendor_portfolio').insert(posts)
    }
    return res.json({ ok:true, vendor: data })
  } catch(e){
    return res.status(401).json({ error: e.message })
  }
}
