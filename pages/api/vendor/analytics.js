import { supabase } from '../../lib/supabase_server'
import { verifyFirebaseTokenFromHeader } from '../../lib/firebase_server'

export default async function handler(req, res) {
  try {
    const userId = await verifyFirebaseTokenFromHeader(req)
    const { data: vendor } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (!vendor) return res.status(400).json({ error: 'vendor not found' })

    // Leads Statistics
    const { data: allLeads, count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendor.id)
    
    const leadsByStatus = {
      new: allLeads?.filter(l => l.status === 'new').length || 0,
      in_progress: allLeads?.filter(l => l.status === 'in_progress').length || 0,
      booked: allLeads?.filter(l => l.status === 'booked').length || 0,
      rejected: allLeads?.filter(l => l.status === 'rejected').length || 0
    }
    
    const recentLeads = allLeads?.slice(0, 5) || []
    const conversionRate = totalLeads > 0 
      ? ((leadsByStatus.booked / totalLeads) * 100).toFixed(1) 
      : 0

    // Reviews Statistics
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, approved')
      .eq('vendor_id', vendor.id)
    
    const approvedReviews = reviews?.filter(r => r.approved) || []
    const pendingReviews = reviews?.filter(r => !r.approved).length || 0
    const avgRating = approvedReviews.length > 0
      ? (approvedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / approvedReviews.length).toFixed(1)
      : 0
    const totalReviews = approvedReviews.length

    // Portfolio Statistics
    const { data: portfolio } = await supabase
      .from('vendor_portfolio')
      .select('id, likes, approved')
      .eq('vendor_id', vendor.id)
    
    const totalLikes = portfolio?.reduce((s, v) => s + (v.likes || 0), 0) || 0
    const approvedPortfolio = portfolio?.filter(p => p.approved).length || 0
    const pendingPortfolio = portfolio?.filter(p => !p.approved).length || 0

    // Revenue/Subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    const subscriptionStatus = subscription?.status || 'none'
    const subscriptionPlan = subscription?.plan || 'free'

    // Recent Activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: recentLeadsActivity } = await supabase
      .from('leads')
      .select('created_at, status')
      .eq('vendor_id', vendor.id)
      .gte('created_at', sevenDaysAgo.toISOString())
    
    const { data: recentReviewsActivity } = await supabase
      .from('reviews')
      .select('created_at, rating')
      .eq('vendor_id', vendor.id)
      .gte('created_at', sevenDaysAgo.toISOString())

    // Monthly Trends (last 6 months)
    const monthlyStats = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const { count: monthLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendor.id)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())
      
      monthlyStats.push({
        month: date.toLocaleString('default', { month: 'short' }),
        leads: monthLeads || 0
      })
    }

    return res.json({
      overview: {
        totalLeads,
        leadsByStatus,
        conversionRate: parseFloat(conversionRate),
        totalReviews,
        avgRating: parseFloat(avgRating),
        pendingReviews,
        totalLikes,
        approvedPortfolio,
        pendingPortfolio,
        subscriptionStatus,
        subscriptionPlan
      },
      recentLeads: recentLeads.slice(0, 5),
      monthlyTrends: monthlyStats,
      recentActivity: {
        leads: recentLeadsActivity?.length || 0,
        reviews: recentReviewsActivity?.length || 0
      }
    })
  } catch (e) {
    return res.status(401).json({ error: e.message })
  }
}
