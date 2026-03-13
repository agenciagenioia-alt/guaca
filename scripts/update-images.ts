import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

async function run() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('No credentials')
    return
  }

  const supabase = createClient(url, key)

  const images = [
    { slug: 'on-running-cloud', urls: ['https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80', 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80'] },
    { slug: 'air-force-1-negro', urls: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'] },
    { slug: 'adidas-campus', urls: ['https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'] },
    { slug: 'camiseta-ndrg', urls: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80', 'https://images.unsplash.com/photo-1523398002811-999aa8d9511e?w=800&q=80'] },
    { slug: 'hoodie-saint-theory', urls: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80', 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&q=80'] },
    { slug: 'cargo-pants-clemont', urls: ['https://images.unsplash.com/photo-1559582798-978fd209ce25?w=800&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'] },
    { slug: 'gorra-la-guaca', urls: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80', 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=800&q=80'] },
    { slug: 'gorra-carhartt', urls: ['https://images.unsplash.com/photo-1556306535-0f09a536f01f?w=800&q=80', 'https://images.unsplash.com/photo-1574180045814-68f716d612e9?w=800&q=80'] },
    { slug: 'bucket-hat-safari', urls: ['https://images.unsplash.com/photo-1614252339474-1188fb8fa1dd?w=800&q=80', 'https://images.unsplash.com/photo-1614252262579-055ea84c4784?w=800&q=80'] },
    { slug: 'gorra-snapback-guaca', urls: ['https://images.unsplash.com/photo-1557161188-724e531ffeb2?w=800&q=80', 'https://images.unsplash.com/photo-1596458005374-2c7deca27dc0?w=800&q=80'] },
    { slug: 'rinonera-tactical-negra', urls: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80'] },
    { slug: 'medias-pack-x3-guaca', urls: ['https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&q=80', 'https://images.unsplash.com/photo-1587563871167-1e52f199da20?w=800&q=80'] }
  ]

  const { data: products, error } = await supabase.from('products').select('id, slug')
  
  if (error) {
    console.error('Error fetching', error)
    return
  }

  for (const p of products) {
    const map = images.find(i => i.slug === p.slug)
    if (map) {
      console.log(`Updating ${p.slug}`)
      await supabase.from('product_images').update({ image_url: map.urls[0] }).match({ product_id: p.id, is_primary: true })
      await supabase.from('product_images').update({ image_url: map.urls[1] }).match({ product_id: p.id, is_primary: false })
    }
  }

  console.log('Update finished')
}

run()
