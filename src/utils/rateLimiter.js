/**
 * Rate Limiter Utility
 * Prevents 429 "Too Many Requests" errors by throttling API calls
 */
class RateLimiter {
  constructor(maxRequests = 15, perSeconds = 1) {
    this.maxRequests = maxRequests; // Maximum requests allowed in time window
    this.interval = perSeconds * 1000; // Time window in milliseconds
    this.tokens = maxRequests; // Start with full tokens
    this.queue = [];
    this.lastRefill = Date.now();
    this.waitingRequests = 0;
    
    console.log(`🚦 Rate limiter initialized: ${maxRequests} requests per ${perSeconds} second(s)`);
    
    // Refill tokens every interval
    setInterval(() => this.refillTokens(), this.interval);
  }

  // Refill tokens to max
  refillTokens() {
    const oldTokens = this.tokens;
    this.tokens = this.maxRequests;
    if (oldTokens < this.maxRequests) {
      console.log(`🔄 Rate limiter: Refilled from ${oldTokens} to ${this.maxRequests} tokens`);
    }
  }

  // Throttle a function call
  async throttle(fn) {
    // Wait if no tokens available
    if (this.tokens <= 0) {
      this.waitingRequests++;
      console.log(`⏳ Rate limited: ${this.waitingRequests} request(s) waiting for tokens...`);
      
      // Wait for token to become available
      while (this.tokens <= 0) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Check every 100ms
      }
      
      this.waitingRequests--;
    }
    
    // Use one token
    this.tokens--;
    console.log(`✅ Request allowed: ${this.tokens} tokens remaining`);
    
    // Execute the function
    try {
      return await fn();
    } catch (error) {
      // If request fails, refund the token after a short delay
      setTimeout(() => {
        this.tokens = Math.min(this.tokens + 1, this.maxRequests);
        console.log(`🔄 Token refunded after error: ${this.tokens} tokens available`);
      }, 500);
      throw error;
    }
  }

  // Get current status
  getStatus() {
    return {
      available: this.tokens,
      max: this.maxRequests,
      waiting: this.waitingRequests,
      utilization: ((this.maxRequests - this.tokens) / this.maxRequests * 100).toFixed(1)
    };
  }

  // Reset the limiter
  reset() {
    this.tokens = this.maxRequests;
    this.waitingRequests = 0;
    this.lastRefill = Date.now();
    console.log('🔄 Rate limiter reset');
  }
}

// Create a singleton instance - adjust numbers based on your needs
export const apiRateLimiter = new RateLimiter(20, 1); // 20 requests per second

// Export a decorator for easy use
export const withRateLimit = (fn) => {
  return async (...args) => {
    return apiRateLimiter.throttle(() => fn(...args));
  };
};