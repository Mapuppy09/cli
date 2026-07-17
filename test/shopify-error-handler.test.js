/**
 * Shopify Error Handler Tests
 */

const assert = require('assert')
const ShopifyErrorHandler = require('../lib/shopify/error-handler')
const { ShopifyAPIError, SHOPIFY_ERRORS } = require('../lib/shopify')

describe('ShopifyErrorHandler', () => {
  let handler

  beforeEach(() => {
    handler = new ShopifyErrorHandler({
      maxLogSize: 10
    })
  })

  describe('handle', () => {
    it('should log and return error details', () => {
      const error = new ShopifyAPIError(SHOPIFY_ERRORS.UNAUTHORIZED)
      const result = handler.handle(error)

      assert.strictEqual(result.success, false)
      assert.strictEqual(result.error.code, 401)
      assert.strictEqual(result.error.type, 'AuthenticationError')
    })

    it('should maintain error log', () => {
      const error1 = new ShopifyAPIError(SHOPIFY_ERRORS.UNAUTHORIZED)
      const error2 = new ShopifyAPIError(SHOPIFY_ERRORS.FORBIDDEN)

      handler.handle(error1)
      handler.handle(error2)

      const log = handler.getErrorLog()
      assert.strictEqual(log.length, 2)
    })
  })

  describe('getSuggestedAction', () => {
    it('should return suggested action for 401 error', () => {
      const error = new ShopifyAPIError(SHOPIFY_ERRORS.UNAUTHORIZED)
      const action = handler.getSuggestedAction(error)
      assert(action.includes('credentials'))
    })

    it('should return suggested action for 429 error', () => {
      const error = new ShopifyAPIError(SHOPIFY_ERRORS.RATE_LIMITED)
      const action = handler.getSuggestedAction(error)
      assert(action.includes('Rate limit'))
    })
  })

  describe('formatErrorResponse', () => {
    it('should format error without details', () => {
      const error = new ShopifyAPIError(SHOPIFY_ERRORS.BAD_REQUEST)
      const formatted = handler.formatErrorResponse(error, false)

      assert.strictEqual(formatted.error, true)
      assert.strictEqual(formatted.code, 400)
      assert(!formatted.suggestion)
    })

    it('should format error with details', () => {
      const error = new ShopifyAPIError(SHOPIFY_ERRORS.BAD_REQUEST)
      const formatted = handler.formatErrorResponse(error, true)

      assert.strictEqual(formatted.error, true)
      assert(formatted.suggestion)
      assert(formatted.retryable !== undefined)
    })
  })

  describe('getErrorStats', () => {
    it('should calculate error statistics', () => {
      handler.handle(new ShopifyAPIError(SHOPIFY_ERRORS.UNAUTHORIZED))
      handler.handle(new ShopifyAPIError(SHOPIFY_ERRORS.UNAUTHORIZED))
      handler.handle(new ShopifyAPIError(SHOPIFY_ERRORS.FORBIDDEN))

      const stats = handler.getErrorStats()
      assert.strictEqual(stats.total, 3)
      assert.strictEqual(stats.byCode[401], 2)
      assert.strictEqual(stats.byCode[403], 1)
    })
  })

  describe('clearErrorLog', () => {
    it('should clear error log', () => {
      handler.handle(new ShopifyAPIError(SHOPIFY_ERRORS.UNAUTHORIZED))
      assert.strictEqual(handler.getErrorLog().length, 1)

      handler.clearErrorLog()
      assert.strictEqual(handler.getErrorLog().length, 0)
    })
  })
})
