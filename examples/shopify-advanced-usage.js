/**
 * Shopify API - Advanced Usage Examples
 * Webhooks and Batch Operations
 */

const { ShopifyAPI } = require('../lib/shopify')
const {
  ShopifyWebhooksManager,
  ShopifyBatchOperationsManager
} = require('../lib/shopify/extended-features')

/**
 * Example 1: Register and manage webhooks
 */
async function exampleWebhooks() {
  console.log('\n=== Example 1: Webhooks ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx'
  })

  const webhooksManager = new ShopifyWebhooksManager(shopify)

  // Listen for webhook events
  webhooksManager.on('webhook:registered', (info) => {
    console.log('Webhook registered:', info.id)
  })

  webhooksManager.on('webhook:error', (error) => {
    console.error('Webhook error:', error)
  })

  try {
    // Register a webhook for order creation
    const webhook = await webhooksManager.registerWebhook(
      'orders/create',
      'https://your-domain.com/webhooks/order-created',
      {
        fields: ['id', 'email', 'total_price']
      }
    )
    console.log('Webhook registered with ID:', webhook.id)

    // List all webhooks
    const allWebhooks = await webhooksManager.listWebhooks()
    console.log(`Total webhooks: ${allWebhooks.length}`)

    // Set up webhook handler
    webhooksManager.onWebhook('orders/create', (payload) => {
      console.log('New order received:', payload)
    })
  } catch (error) {
    console.error('Webhook setup failed:', error.message)
  }
}

/**
 * Example 2: Batch create products
 */
async function exampleBatchCreateProducts() {
  console.log('\n=== Example 2: Batch Create Products ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx'
  })

  const batchOps = new ShopifyBatchOperationsManager(shopify)

  const products = [
    {
      title: 'Product 1',
      productType: 'Type A',
      vendor: 'Vendor 1'
    },
    {
      title: 'Product 2',
      productType: 'Type B',
      vendor: 'Vendor 2'
    },
    {
      title: 'Product 3',
      productType: 'Type A',
      vendor: 'Vendor 3'
    }
  ]

  try {
    const results = await batchOps.batchCreateProducts(products)
    console.log(`Successfully created ${results.length} products`)
    results.forEach((result, index) => {
      console.log(`Product ${index + 1}: ID ${result.product.id}`)
    })
  } catch (error) {
    console.error('Batch creation failed:', error.message)
  }
}

/**
 * Example 3: Batch update products
 */
async function exampleBatchUpdateProducts() {
  console.log('\n=== Example 3: Batch Update Products ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx'
  })

  const batchOps = new ShopifyBatchOperationsManager(shopify)

  const productsToUpdate = [
    {
      id: 123,
      title: 'Updated Product 1',
      bodyHtml: '<p>New description</p>'
    },
    {
      id: 456,
      title: 'Updated Product 2',
      bodyHtml: '<p>Another new description</p>'
    }
  ]

  try {
    const results = await batchOps.batchUpdateProducts(productsToUpdate)
    console.log(`Successfully updated ${results.length} products`)
  } catch (error) {
    console.error('Batch update failed:', error.message)
  }
}

/**
 * Example 4: Batch delete products
 */
async function exampleBatchDeleteProducts() {
  console.log('\n=== Example 4: Batch Delete Products ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx'
  })

  const batchOps = new ShopifyBatchOperationsManager(shopify)

  const productIds = [123, 456, 789, 1011]

  try {
    const results = await batchOps.batchDeleteProducts(productIds)
    console.log(`Successfully deleted ${results.length} products`)
  } catch (error) {
    console.error('Batch delete failed:', error.message)
  }
}

/**
 * Example 5: Batch get orders
 */
async function exampleBatchGetOrders() {
  console.log('\n=== Example 5: Batch Get Orders ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx'
  })

  const batchOps = new ShopifyBatchOperationsManager(shopify)

  try {
    // Get all orders
    const allOrders = await batchOps.batchGetOrders()
    console.log(`Total orders: ${allOrders.length}`)

    // Get paid orders
    const paidOrders = await batchOps.batchGetOrders({
      status: 'any',
      limit: 250
    })
    console.log(`Paid orders: ${paidOrders.length}`)

    // Process orders in batches
    const batchSize = 50
    for (let i = 0; i < allOrders.length; i += batchSize) {
      const batch = allOrders.slice(i, i + batchSize)
      console.log(`Processing batch: ${batch.length} orders`)
    }
  } catch (error) {
    console.error('Batch get orders failed:', error.message)
  }
}

/**
 * Example 6: Combined webhook and batch operations
 */
async function exampleCombinedOperations() {
  console.log('\n=== Example 6: Combined Operations ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx'
  })

  const webhooksManager = new ShopifyWebhooksManager(shopify)
  const batchOps = new ShopifyBatchOperationsManager(shopify)

  try {
    // Register product update webhook
    const webhook = await webhooksManager.registerWebhook(
      'products/update',
      'https://your-domain.com/webhooks/product-updated'
    )

    console.log('Webhook registered:', webhook.id)

    // Set up handler for webhook
    webhooksManager.onWebhook('products/update', async (payload) => {
      console.log('Product updated:', payload.id)

      // Get related products and batch update them
      const relatedProducts = [
        { id: payload.id, status: 'updated' }
      ]

      try {
        await batchOps.batchUpdateProducts(relatedProducts)
        console.log('Related products updated')
      } catch (error) {
        console.error('Failed to update related products:', error.message)
      }
    })
  } catch (error) {
    console.error('Combined operations failed:', error.message)
  }
}

/**
 * Example 7: Error handling in batch operations
 */
async function exampleBatchErrorHandling() {
  console.log('\n=== Example 7: Batch Error Handling ===')

  const shopify = new ShopifyAPI({
    store: 'my-store',
    accessToken: 'shpat_xxxxxxxxxxxxx',
    maxRetries: 2
  })

  const batchOps = new ShopifyBatchOperationsManager(shopify)

  const largeProductSet = Array.from({ length: 1000 }, (_, i) => ({
    title: `Product ${i + 1}`,
    productType: 'Generic',
    vendor: 'Vendor X'
  }))

  try {
    console.log(`Creating ${largeProductSet.length} products in batches...`)
    const results = await batchOps.batchCreateProducts(largeProductSet)
    console.log(`Successfully created ${results.length} products`)
  } catch (error) {
    console.error('Batch operation failed:', {
      error: error.message,
      code: error.code,
      retryable: error.retryable
    })
  }
}

// Run examples (uncomment to test)
// exampleWebhooks()
// exampleBatchCreateProducts()
// exampleBatchUpdateProducts()
// exampleBatchDeleteProducts()
// exampleBatchGetOrders()
// exampleCombinedOperations()
// exampleBatchErrorHandling()

module.exports = {
  exampleWebhooks,
  exampleBatchCreateProducts,
  exampleBatchUpdateProducts,
  exampleBatchDeleteProducts,
  exampleBatchGetOrders,
  exampleCombinedOperations,
  exampleBatchErrorHandling
}
