/**
 * Shopify Extended Features Module
 * Webhooks and batch operations
 */

const { EventEmitter } = require('events')

/**
 * Shopify Webhooks Manager
 */
class ShopifyWebhooksManager extends EventEmitter {
  constructor(shopifyAPI) {
    super()
    this.shopify = shopifyAPI
    this.webhooks = new Map()
    this.webhookHandlers = new Map()
  }

  /**
   * Register a webhook
   */
  async registerWebhook(topic, callbackUrl, options = {}) {
    try {
      const webhookData = {
        webhook: {
          topic,
          address: callbackUrl,
          format: options.format || 'json',
          fields: options.fields || []
        }
      }

      const result = await this.shopify.post('/webhooks', webhookData)
      const webhookId = result.webhook.id

      this.webhooks.set(webhookId, {
        id: webhookId,
        topic,
        url: callbackUrl,
        createdAt: new Date()
      })

      this.emit('webhook:registered', {
        id: webhookId,
        topic,
        url: callbackUrl
      })

      return result.webhook
    } catch (error) {
      this.emit('webhook:error', {
        action: 'register',
        topic,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Unregister a webhook
   */
  async unregisterWebhook(webhookId) {
    try {
      await this.shopify.delete(`/webhooks/${webhookId}`)
      this.webhooks.delete(webhookId)

      this.emit('webhook:unregistered', { id: webhookId })
      return true
    } catch (error) {
      this.emit('webhook:error', {
        action: 'unregister',
        webhookId,
        error: error.message
      })
      throw error
    }
  }

  /**
   * List all webhooks
   */
  async listWebhooks() {
    try {
      const result = await this.shopify.get('/webhooks')
      return result.webhooks
    } catch (error) {
      this.emit('webhook:error', {
        action: 'list',
        error: error.message
      })
      throw error
    }
  }

  /**
   * Get webhook by ID
   */
  async getWebhook(webhookId) {
    try {
      const result = await this.shopify.get(`/webhooks/${webhookId}`)
      return result.webhook
    } catch (error) {
      this.emit('webhook:error', {
        action: 'get',
        webhookId,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Handle incoming webhook
   */
  handleWebhookRequest(req, res) {
    try {
      const topic = req.headers['x-shopify-topic']
      const payload = req.body

      this.emit('webhook:received', {
        topic,
        timestamp: new Date(),
        payload
      })

      const handler = this.webhookHandlers.get(topic)
      if (handler) {
        handler(payload)
      }

      res.status(200).send('Webhook received')
    } catch (error) {
      this.emit('webhook:error', {
        action: 'handle',
        error: error.message
      })
      res.status(500).send('Internal server error')
    }
  }

  /**
   * Register webhook handler
   */
  onWebhook(topic, handler) {
    this.webhookHandlers.set(topic, handler)
  }
}

/**
 * Shopify Batch Operations Manager
 */
class ShopifyBatchOperationsManager {
  constructor(shopifyAPI) {
    this.shopify = shopifyAPI
    this.batchSize = 250 // Shopify max batch size
    this.activeBatches = new Map()
  }

  /**
   * Execute batch query
   */
  async executeBatchQuery(query, variables = {}) {
    try {
      const batchData = {
        query: `
          mutation {
            graphqlBatch(input: {
              queries: [
                ${query}
              ]
            }) {
              results {
                data
                errors
              }
            }
          }
        `,
        variables
      }

      const result = await this.shopify.post('/graphql.json', batchData)
      return result
    } catch (error) {
      throw error
    }
  }

  /**
   * Batch create products
   */
  async batchCreateProducts(products) {
    const batches = this.chunkArray(products, this.batchSize)
    const results = []

    for (const batch of batches) {
      const mutations = batch.map(product => ({
        product
      }))

      try {
        const batchResult = await Promise.all(
          mutations.map(m => this.shopify.post('/products', m))
        )
        results.push(...batchResult)
      } catch (error) {
        console.error('Batch creation error:', error.message)
      }
    }

    return results
  }

  /**
   * Batch update products
   */
  async batchUpdateProducts(products) {
    const batches = this.chunkArray(products, this.batchSize)
    const results = []

    for (const batch of batches) {
      try {
        const batchResult = await Promise.all(
          batch.map(product =>
            this.shopify.put(`/products/${product.id}`, { product })
          )
        )
        results.push(...batchResult)
      } catch (error) {
        console.error('Batch update error:', error.message)
      }
    }

    return results
  }

  /**
   * Batch delete products
   */
  async batchDeleteProducts(productIds) {
    const batches = this.chunkArray(productIds, this.batchSize)
    const results = []

    for (const batch of batches) {
      try {
        const batchResult = await Promise.all(
          batch.map(id => this.shopify.delete(`/products/${id}`))
        )
        results.push(...batchResult)
      } catch (error) {
        console.error('Batch delete error:', error.message)
      }
    }

    return results
  }

  /**
   * Batch get orders
   */
  async batchGetOrders(options = {}) {
    try {
      const limit = options.limit || 250
      const status = options.status || 'any'

      const orders = await this.shopify.get(
        `/orders?limit=${limit}&status=${status}`
      )
      return orders.orders || []
    } catch (error) {
      throw error
    }
  }

  /**
   * Helper: Split array into chunks
   */
  chunkArray(array, chunkSize) {
    const chunks = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }
}

module.exports = {
  ShopifyWebhooksManager,
  ShopifyBatchOperationsManager
}
