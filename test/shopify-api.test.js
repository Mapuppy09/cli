/**
 * Shopify API Tests
 * Unit tests for the Shopify API module
 */

const assert = require('assert')
const { ShopifyAPI, ShopifyAPIError, SHOPIFY_ERRORS } = require('../lib/shopify')

describe('ShopifyAPI', () => {
  let shopify

  beforeEach(() => {
    shopify = new ShopifyAPI({
      store: 'test-store',
      accessToken: 'test-token',
      maxRetries: 2,
      retryDelay: 100
    })
  })

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const api = new ShopifyAPI()
      assert.strictEqual(api.store, null)
      assert.strictEqual(api.accessToken, null)
      assert.strictEqual(api.apiVersion, '2024-01')
      assert.strictEqual(api.maxRetries, 3)
    })

    it('should initialize with custom options', () => {
      assert.strictEqual(shopify.store, 'test-store')
      assert.strictEqual(shopify.accessToken, 'test-token')
      assert.strictEqual(shopify.maxRetries, 2)
    })
  })

  describe('setCredentials', () => {
    it('should set store and access token', () => {
      shopify.setCredentials('new-store', 'new-token')
      assert.strictEqual(shopify.store, 'new-store')
      assert.strictEqual(shopify.accessToken, 'new-token')
    })
  })

  describe('validateCredentials', () => {
    it('should throw error if credentials not set', () => {
      const api = new ShopifyAPI()
      assert.throws(() => {
        api.validateCredentials()
      }, ShopifyAPIError)
    })

    it('should not throw error if credentials are set', () => {
      assert.doesNotThrow(() => {
        shopify.validateCredentials()
      })
    })
  })

  describe('Error Definitions', () => {
    it('should have all error types defined', () => {
      assert(SHOPIFY_ERRORS.UNAUTHORIZED)
      assert(SHOPIFY_ERRORS.FORBIDDEN)
      assert(SHOPIFY_ERRORS.RATE_LIMITED)
      assert(SHOPIFY_ERRORS.BAD_REQUEST)
      assert(SHOPIFY_ERRORS.UNPROCESSABLE_ENTITY)
      assert(SHOPIFY_ERRORS.NOT_FOUND)
      assert(SHOPIFY_ERRORS.SERVER_ERROR)
      assert(SHOPIFY_ERRORS.SERVICE_UNAVAILABLE)
    })

    it('should have correct error codes', () => {
      assert.strictEqual(SHOPIFY_ERRORS.UNAUTHORIZED.code, 401)
      assert.strictEqual(SHOPIFY_ERRORS.FORBIDDEN.code, 403)
      assert.strictEqual(SHOPIFY_ERRORS.RATE_LIMITED.code, 429)
      assert.strictEqual(SHOPIFY_ERRORS.BAD_REQUEST.code, 400)
    })
  })

  describe('ShopifyAPIError', () => {
    it('should create error with correct properties', () => {
      const error = new ShopifyAPIError(SHOPIFY_ERRORS.UNAUTHORIZED)
      assert.strictEqual(error.name, 'AuthenticationError')
      assert.strictEqual(error.code, 401)
      assert.strictEqual(error.type, 'AuthenticationError')
      assert.strictEqual(error.retryable, false)
    })

    it('should support retryable errors', () => {
      const errorDef = { ...SHOPIFY_ERRORS.RATE_LIMITED, retryable: true }
      const error = new ShopifyAPIError(errorDef)
      assert.strictEqual(error.retryable, true)
    })
  })

  describe('Helper Methods', () => {
    it('should have GET, POST, PUT, DELETE methods', () => {
      assert(typeof shopify.get === 'function')
      assert(typeof shopify.post === 'function')
      assert(typeof shopify.put === 'function')
      assert(typeof shopify.delete === 'function')
    })
  })

  describe('Event Emitter', () => {
    it('should emit rateLimit events', (done) => {
      shopify.on('rateLimit', (info) => {
        assert(info.limit)
        assert(info.resetTime)
        done()
      })

      shopify.emit('rateLimit', {
        limit: '40/40',
        resetTime: 1234567890
      })
    })
  })
})
