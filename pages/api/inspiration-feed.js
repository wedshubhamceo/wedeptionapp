import { supabase } from '../../lib/supabase_server'

// GET - Fetch inspiration feed posts
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { page = 1, limit = 20, category, vendor_id } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)
    
    let query = supabase
      .from('inspiration_feed')
      .select(`
        *,
        vendors!inspiration_feed_vendor_id_fkey (
          id,
          business_name,
          category,
          city,
          verified,
          subscription_level
        )
      `)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1)
    
    if (vendor_id) {
      query = query.eq('vendor_id', vendor_id)
    }
    
    if (category && category !== 'All') {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    
    // If join fails, fetch vendors separately
    if (error && error.message?.includes('relation')) {
      let fallbackQuery = supabase
        .from('inspiration_feed')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1)
      
      if (vendor_id) {
        fallbackQuery = fallbackQuery.eq('vendor_id', vendor_id)
      }
      if (category && category !== 'All') {
        fallbackQuery = fallbackQuery.eq('category', category)
      }
      
      const { data: postsData, error: postsError } = await fallbackQuery
      
      if (postsError) {
        return res.status(500).json({ error: postsError.message })
      }
      
      // Fetch vendors separately
      const vendorIds = [...new Set(postsData.map(p => p.vendor_id))]
      const { data: vendorsData } = await supabase
        .from('vendors')
        .select('id, business_name, category, city, verified, subscription_level')
        .in('id', vendorIds)
      
      const vendorsMap = {}
      vendorsData?.forEach(v => { vendorsMap[v.id] = v })
      
      const data = postsData.map(post => ({
        ...post,
        vendors: vendorsMap[post.vendor_id]
      }))
      
      // Apply ranking
      let ranked = data
      if (!vendor_id) {
        ranked = data.map(post => {
          const vendor = post.vendors || {}
          const isPremium = vendor.subscription_level && vendor.subscription_level !== 'free'
          const ageInDays = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24)
          
          const score = 
            (isPremium ? 500 : 0) +
            (vendor.verified ? 100 : 0) +
            (Math.log(1 + (post.likes || 0)) * 30) +
            Math.max(0, 100 - (ageInDays / 30) * 100)
          
          return { ...post, _score: score }
        }).sort((a, b) => b._score - a._score)
      }
      
      return res.json({ posts: ranked, page: parseInt(page), limit: parseInt(limit) })
    }
    
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    
    // Apply ranking algorithm (only if not vendor-specific)
    let ranked = data
    if (!vendor_id) {
      ranked = data.map(post => {
        const vendor = post.vendors || {}
        const isPremium = vendor.subscription_level && vendor.subscription_level !== 'free'
        const ageInDays = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24)
        
        // Calculate score
        const score = 
          (isPremium ? 500 : 0) + // Premium boost
          (vendor.verified ? 100 : 0) + // Verified boost
          (Math.log(1 + (post.likes || 0)) * 30) + // Engagement
          Math.max(0, 100 - (ageInDays / 30) * 100) // Recency decay
        
        return { ...post, _score: score }
      }).sort((a, b) => b._score - a._score)
    }
    
    return res.json({ posts: ranked, page: parseInt(page), limit: parseInt(limit) })
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}

