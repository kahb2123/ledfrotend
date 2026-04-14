/**
 * Rate Limiter Utility
 * Prevents 429 "Too Many Requests" errors by throttling API calls
 */
class RateLimiter {
  constructor(maxRequests = 15, perSeconds = 1) {
    this.maxRequests = maxRequests;
    this.interval = perSeconds * 1000;
    this.tokens = maxRequests;
    this.queue = [];
    this.lastRefill = Date.now();
    this.waitingRequests = 0;

    // Refill tokens every interval
    setInterval(() => this.refillTokens(), this.interval);
  }

  // Refill tokens to max
  refillTokens() {
    this.tokens = this.maxRequests;
  }

  // Throttle a function call
  async throttle(fn) {
    // Wait if no tokens available
    if (this.tokens <= 0) {
      this.waitingRequests++;

      // Wait for token to become available
      while (this.tokens <= 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.waitingRequests--;
    }

    // Use one token
    this.tokens--;

    // Execute the function
    try {
      return await fn();
    } catch (error) {
      // If request fails, refund the token after a short delay
      setTimeout(() => {
        this.tokens = Math.min(this.tokens + 1, this.maxRequests);
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
  }
}

// Create a singleton instance
export const apiRateLimiter = new RateLimiter(20, 1);

// Export a decorator for easy use
export const withRateLimit = (fn) => {
  return async (...args) => {
    return apiRateLimiter.throttle(() => fn(...args));
  };
};
