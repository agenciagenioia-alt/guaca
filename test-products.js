const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://sllcurjevhuatfudggvn.supabase.co', 'sb_publishable_qEbmbedSOMbRSvHDH4iMqw_5YTVvDfF');

async function testFetchAndRls() {
  // Try to use a known user from 'user_roles' table directly if we could figure it out, but
  // since this is a protected API we can't do much without valid credentials.

  // As a workaround to debug the app state, we'll fetch just one public product 
  // and see if all nested relations resolve correctly without auth.
  const { data: rawProducts, error: rawError } = await supabase
    .from('products')
    .select(`
      id, name, sku, slug, price, original_price, is_active,
      category:categories(name),
      images:product_images(image_url)
    `)
    .limit(3);

  console.log('--- TEST FETCH ---');
  console.log('Error:', rawError);
  console.log('Data:', JSON.stringify(rawProducts, null, 2));
}

testFetchAndRls();
