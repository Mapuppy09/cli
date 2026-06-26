/**
 * Shopify Integration Module
 * Main entry point for Shopify API functionality
 */

const { ShopifyAPI, ShopifyAPIError, SHOPIFY_ERRORS } = require('./api')
const ShopifyErrorHandler = require('./error-handler')

module.exports = {
  ShopifyAPI,
  ShopifyAPIError,
  ShopifyErrorHandler,
  SHOPIFY_ERRORS
}
