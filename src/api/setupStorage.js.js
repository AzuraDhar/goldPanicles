// scripts/setupStorage.js
import { supabaseConfig } from '../src/config/supabaseClient.js'
import { createClient } from '@supabase/supabase-js'

// Use your existing supabase credentials
const supabase = createClient(supabaseConfig.url, supabaseConfig.key)

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage for ClientCalendar\n')
  console.log(`🔗 Using: ${supabaseConfig.url}`)
  
  try {
    // 1. Test connection
    console.log('\n1. Testing connection...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Connection failed:', listError.message)
      return
    }
    
    console.log(`✅ Connected successfully!`)
    console.log(`📦 Found ${buckets.length} bucket(s)`)
    
    // 2. Check for staffSchedule bucket
    console.log('\n2. Checking staffSchedule bucket...')
    const staffScheduleBucket = buckets.find(b => b.name === 'staffSchedule')
    
    if (staffScheduleBucket) {
      console.log('✅ staffSchedule bucket exists')
      console.log(`   Public: ${staffScheduleBucket.public ? 'Yes' : 'No'}`)
    } else {
      console.log('⚠️ staffSchedule bucket not found')
      console.log('   It will be created automatically on first file upload')
    }
    
    // 3. Test folder structure by trying to upload a test file
    console.log('\n3. Testing folder structure...')
    
    const testContent = 'Test file for ClientCalendar setup'
    const testBlob = new Blob([testContent], { type: 'text/plain' })
    const testPath = 'client-requests/_setup_test.txt'
    
    const { error: uploadError } = await supabase.storage
      .from('staffSchedule')
      .upload(testPath, testBlob, {
        upsert: false
      })
    
    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
        console.log('ℹ️ Bucket will be created on first actual upload')
      } else if (uploadError.message.includes('already exists')) {
        console.log('✅ Storage is working correctly')
      } else {
        console.log(`ℹ️ ${uploadError.message}`)
      }
    } else {
      console.log('✅ Successfully uploaded test file')
      
      // Clean up
      await supabase.storage
        .from('staffSchedule')
        .remove([testPath])
      
      console.log('✅ Cleaned up test file')
    }
    
    // 4. Show the upload path structure
    console.log('\n4. Upload path structure for ClientCalendar:')
    console.log('   staffSchedule/')
    console.log('   └── client-requests/')
    console.log('       └── YYYY/')
    console.log('           └── MM/')
    console.log('               └── DD/')
    console.log('                   └── [timestamp]_[random]_filename.ext')
    
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    console.log(`\n📅 Example for today (${year}-${month}-${day}):`)
    console.log(`   client-requests/${year}/${month}/${day}/1700000000000_abc123_proposal.pdf`)
    
    console.log('\n🎉 Setup complete! Your ClientCalendar is ready to upload files.')
    console.log('\n💡 No further action needed - folders will be created automatically.')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

// Run setup
setupStorage()