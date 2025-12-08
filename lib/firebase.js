import { initializeApp, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { firebaseConfig } from './config'
import fs from 'fs'
const SERVICE_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json'
let app
if (fs.existsSync(SERVICE_PATH)) {
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_PATH,'utf8'))
  app = initializeApp({ 
    credential: cert(serviceAccount), 
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket 
  })
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT_PATH not set and firebase-service-account.json not found')
}
export const bucket = app ? getStorage().bucket() : null
