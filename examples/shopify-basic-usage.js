/**
 * Shopify API - Basic Usage Example
 */

const { ShopifyAPI, ShopifyAPIError, ShopifyErrorHandler } = require('../lib/shopify')

/**
 * Example 1: Initialize and get products
 */
async function exampleGetProducts() {
  console.log('\n=== Example 1: Get Products ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx'
  })

  const errorHandler = new ShopifyErrorHandler()

  try {
    const result = await shopify.get('/products')
    console.log(`Found ${result.products.length} products`)
    console.log(result.products.slice(0, 2))
  } catch (error) {
    const response = errorHandler.handle(error, {
      endpoint: '/products',
      method: 'GET'
    })
    console.error('Error response:', response)
  }
}

/**
 * Example 2: Create a new product
 */
async function exampleCreateProduct() {
  console.log('\n=== Example 2: Create Product ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx'
  })

  const productData = {
    product: {
      title: 'New Amazing Product',
      productType: 'Electronics',
      vendor: 'My Vendor',
      handle: 'amazing-product',
      bodyHtml: '<p>This is an amazing product!</p>',
      tags: ['electronics', 'new']
    }
  }

  try {
    const result = await shopify.post('/products', productData)
    console.log('Product created successfully!')
    console.log('Product ID:', result.product.id)
    console.log('Title:', result.product.title)
  } catch (error) {
    if (error instanceof ShopifyAPIError) {
      console.error(`Error [${error.code}]: ${error.message}`)
    }
  }
}

/**
 * Example 3: Update a product
 */
async function exampleUpdateProduct() {
  console.log('\n=== Example 3: Update Product ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx'
  })

  const productId = 12345
  const updateData = {
    product: {
      id: productId,
      title: 'Updated Product Title',
      bodyHtml: '<p>Updated description</p>'
    }
  }

  try {
    const result = await shopify.put(`/products/${productId}`, updateData)
    console.log('Product updated successfully!')
    console.log('New title:', result.product.title)
  } catch (error) {
    console.error('Update failed:', error.message)
  }
}

/**
 * Example 4: Get specific customer
 */
async function exampleGetCustomer() {
  console.log('\n=== Example 4: Get Customer ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx'
  })

  const customerId = 98765
  try {
    const result = await shopify.get(`/customers/${customerId}`)
    console.log('Customer found!')
    console.log('Name:', result.customer.first_name, result.customer.last_name)
    console.log('Email:', result.customer.email)
  } catch (error) {
    console.error('Failed to fetch customer:', error.message)
  }
}

/**
 * Example 5: Error handling with retry logic
 */
async function exampleErrorHandling() {
  console.log('\n=== Example 5: Error Handling ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx',
    maxRetries: 3,
    retryDelay: 1000
  })

  const errorHandler = new ShopifyErrorHandler()

  // Listen for rate limit events
  shopify.on('rateLimit', (info) => {
    console.log('Rate limit detected:', info.limit)
    console.log('Reset time:', new Date(info.resetTime * 1000))
  })

  try {
    // This might hit rate limiting
    const results = await Promise.all([
      shopify.get('/products'),
      shopify.get('/customers'),
      shopify.get('/orders')
    ])
    console.log('All requests completed successfully')
  } catch (error) {
    const errorResponse = errorHandler.handle(error)
    console.error('Error occurred:', errorResponse.error)
    console.error('Suggested action:', errorResponse.error.suggestedAction)

    // Get error statistics
    const stats = errorHandler.getErrorStats()
    console.log('Error statistics:', stats)
  }
}

/**
 * Example 6: List all orders with filtering
 */
async function exampleListOrders() {
  console.log('\n=== Example 6: List Orders ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx'
  })

  try {
    // Get all orders
    const result = await shopify.get('/orders?status=any&limit=50')
    console.log(`Found ${result.orders.length} orders`)

    // Get paid orders only
    const paidOrders = await shopify.get('/orders?status=any&financial_status=paid')
    console.log(`Found ${paidOrders.orders.length} paid orders`)
  } catch (error) {
    console.error('Failed to fetch orders:', error.message)
  }
}

/**
 * Example 7: Delete a product
 */
async function exampleDeleteProduct() {
  console.log('\n=== Example 7: Delete Product ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx'
  })

  const productId = 12345

  try {
    await shopify.delete(`/products/${productId}`)
    console.log(`Product ${productId} deleted successfully`)
  } catch (error) {
    if (error.code === 404) {
      console.error('Product not found')
    } else {
      console.error('Delete failed:', error.message)
    }
  }
}

/**
 * Example 8: Using multiple credentials
 */
async function exampleMultipleStores() {
  console.log('\n=== Example 8: Multiple Stores ===')

  // Store 1
  const store1 = new ShopifyAPI({
    store: 'store-one',
    accessToken: 'shpat_store1token'
  })

  // Store 2
  const store2 = new ShopifyAPI({
    store: 'store-two',
    accessToken: 'shpat_store2token'
  })

  try {
    const products1 = await store1.get('/products')
    const products2 = await store2.get('/products')

    console.log(`Store 1 has ${products1.products.length} products`)
    console.log(`Store 2 has ${products2.products.length} products`)
  } catch (error) {
    console.error('Multi-store error:', error.message)
  }
}

// Run examples (uncomment to test)
// exampleGetProducts()
// exampleCreateProduct()
// exampleUpdateProduct()
// exampleGetCustomer()
// exampleErrorHandling()
// exampleListOrders()
// exampleDeleteProduct()
// exampleMultipleStores()

module.exports = {
  exampleGetProducts,
  exampleCreateProduct,
  exampleUpdateProduct,
  exampleGetCustomer,
  exampleErrorHandling,
  exampleListOrders,
  exampleDeleteProduct,
  exampleMultipleStores
}
