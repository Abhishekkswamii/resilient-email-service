import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private maxRequests: number;
  private windowMs: number;
  private emailService: any;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000, emailService?: any) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.emailService = emailService;
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || 'unknown';
      const now = Date.now();
      
      if (!this.store[key] || now > this.store[key].resetTime) {
        this.store[key] = {
          count: 1,
          resetTime: now + this.windowMs
        };
        return next();
      }
      
      this.store[key].count++;
      
      if (this.store[key].count > this.maxRequests) {
        // Increment failed attempts when rate limited for email sending
        if (this.emailService && req.path === '/api/emails' && req.method === 'POST') {
          this.emailService.incrementFailedAttempts();
        }
        
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((this.store[key].resetTime - now) / 1000),
          limit: this.maxRequests,
          windowMs: this.windowMs
        });
      }
      
      next();
    };
  }

  // Method to get current rate limit status
  getStatus(ip: string) {
    const key = ip || 'unknown';
    const now = Date.now();
    
    if (!this.store[key] || now > this.store[key].resetTime) {
      return {
        count: 0,
        limit: this.maxRequests,
        remaining: this.maxRequests,
        resetTime: now + this.windowMs
      };
    }
    
    return {
      count: this.store[key].count,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - this.store[key].count),
      resetTime: this.store[key].resetTime
    };
  }
}

export default RateLimiter;
