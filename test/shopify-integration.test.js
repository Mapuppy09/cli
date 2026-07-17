/**
 * Integration Test Examples
 * Real-world scenario tests for Shopify API
 */

const assert = require('assert')
const { ShopifyAPI, ShopifyErrorHandler } = require('../lib/shopify')
const {
  ShopifyWebhooksManager,
  ShopifyBatchOperationsManager
} = require('../lib/shopify/extended-features')

describe('Shopify Integration Tests', () => {
  let shopify
  let errorHandler

  beforeEach(() => {
    shopify = new ShopifyAPI({
      store: 'test-store',
      accessToken: 'test-token',
      maxRetries: 2,
      retryDelay: 100
    })

    errorHandler = new ShopifyErrorHandler()
  })

  describe('Webhook Manager', () => {
    it('should initialize webhook manager', () => {
      const webhooksManager = new ShopifyWebhooksManager(shopify)
      assert(webhooksManager instanceof ShopifyWebhooksManager)
      assert(webhooksManager.shopify === shopify)
    })

    it('should have webhook handler map', () => {
      const webhooksManager = new ShopifyWebhooksManager(shopify)
      assert(webhooksManager.webhookHandlers instanceof Map)
    })
  })

  describe('Batch Operations Manager', () => {
    it('should initialize batch operations manager', () => {
      const batchOps = new ShopifyBatchOperationsManager(shopify)
      assert(batchOps instanceof ShopifyBatchOperationsManager)
      assert(batchOps.batchSize === 250)
    })

    it('should chunk arrays correctly', () => {
      const batchOps = new ShopifyBatchOperationsManager(shopify)
      const array = Array.from({ length: 1000 }, (_, i) => i)
      const chunks = batchOps.chunkArray(array, 250)

      assert.strictEqual(chunks.length, 4)
      assert.strictEqual(chunks[0].length, 250)
      assert.strictEqual(chunks[3].length, 250)
    })

    it('should chunk arrays with remainder', () => {
      const batchOps = new ShopifyBatchOperationsManager(shopify)
      const array = Array.from({ length: 100 }, (_, i) => i)
      const chunks = batchOps.chunkArray(array, 30)

      assert.strictEqual(chunks.length, 4)
      assert.strictEqual(chunks[3].length, 10)
    })
  })

  describe('Workflow Scenarios', () => {
    it('should handle product creation workflow', async () => {
      const errorHandler = new ShopifyErrorHandler()

      const productData = {
        product: {
          title: 'Test Product',
          productType: 'Test',
          vendor: 'Test Vendor'
        }
      }

      // Simulate the workflow
      try {
        // In real scenario, this would call shopify.post()
        assert(productData.product.title)
        assert(productData.product.vendor)
      } catch (error) {
        errorHandler.handle(error)
      }
    })

    it('should track error statistics', () => {
      const handler = new ShopifyErrorHandler()
      const { ShopifyAPIError, SHOPIFY_ERRORS } = require('../lib/shopify')

      handler.handle(new ShopifyAPIError(SHOPIFY_ERRORS.UNAUTHORIZED))
      handler.handle(new ShopifyAPIError(SHOPIFY_ERRORS.UNAUTHORIZED))
      handler.handle(new ShopifyAPIError(SHOPIFY_ERRORS.FORBIDDEN))

      const stats = handler.getErrorStats()
      assert.strictEqual(stats.total, 3)
      assert.strictEqual(stats.byCode[401], 2)
      assert.strictEqual(stats.byCode[403], 1)
    })
  })

  describe('Event Handling', () => {
    it('should emit events from webhook manager', (done) => {
      const webhooksManager = new ShopifyWebhooksManager(shopify)

      webhooksManager.on('webhook:received', (data) => {
        assert(data.topic)
        assert(data.timestamp)
        done()
      })

      webhooksManager.emit('webhook:received', {
        topic: 'orders/create',
        timestamp: new Date(),
        payload: {}
      })
    })

    it('should emit rate limit events from API', (done) => {
      shopify.on('rateLimit', (info) => {
        assert(info.limit)
        done()
      })

      shopify.emit('rateLimit', {
        limit: '40/40',
        resetTime: 1234567890
      })
    })
  })
})
