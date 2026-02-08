// src/config/supabaseClient.js (updated)
import { createClient } from '@supabase/supabase-js'

// Your existing credentials
const supabaseUrl = 'https://lrbmsjehbkexbnsxdbxf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYm1zamVoYmtleGJuc3hkYnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2ODM5NDUsImV4cCI6MjA4NDI1OTk0NX0.RZoyXVRTwR9Up_QATKcI-6ejE8kBOKrNEZMi21OmRZQ'

// Export the regular client (for React components)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Export credentials for server-side scripts
export const supabaseConfig = {
  url: supabaseUrl,
  key: supabaseKey
}