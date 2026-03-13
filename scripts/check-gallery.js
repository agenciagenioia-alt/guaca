const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8')
    env.split('\n').forEach(line => {
      const match = line.match(/^([^=#]+)=(.*)$/)
      if (match) {
        process.env[match[1].trim()] = match[2].trim()
      }
    })
  }
}

async function run() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('No credentials found')
    return
  }

  console.log('URL:', url)
  const supabase = createClient(url, key)

  // Test if gallery_images table exists by trying to select from it
  const { data, error } = await supabase.from('gallery_images').select('id').limit(1)
  
  if (error) {
    console.log('Table gallery_images does not exist yet.')
    console.log('You need to run the following SQL in Supabase SQL Editor:')
    console.log('---')
    const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260311_gallery_images.sql'), 'utf8')
    console.log(sql)
    console.log('---')
    console.log('Go to: ' + url.replace('.co', '.co/project/') + ' > SQL Editor')
  } else {
    console.log('Table gallery_images already exists! Found', data.length, 'rows')
  }
}

run()
