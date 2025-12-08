import { bucket } from '../../lib/firebase'
export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  if(!bucket) return res.status(500).json({ error: 'firebase not configured' })
  const { filename, contentType } = req.body
  const file = bucket.file('uploads/' + Date.now() + '-' + filename)
  const expiresAt = Date.now() + 1000 * 60 * 15 // 15 min
  const [url] = await file.getSignedUrl({ action: 'write', expires: expiresAt, contentType })
  // Make a public read URL after upload (but in production, set proper rules)
  const publicUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${file.name}`
  return res.json({ uploadUrl: url, publicUrl })
}
