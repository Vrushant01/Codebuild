import { Request, Response, NextFunction } from "express"

interface CacheEntry {
  data: any
  expiry: number
}

const memoryCache = new Map<string, CacheEntry>()

export const cacheMiddleware = (ttlSeconds: number = 60) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== "GET") {
      next()
      return
    }

    const key = `__cache__${req.originalUrl || req.url}`
    const cached = memoryCache.get(key)

    if (cached && cached.expiry > Date.now()) {
      res.setHeader("X-Cache", "HIT")
      res.status(200).json(cached.data)
      return
    }

    // Wrap res.json to capture response
    const originalJson = res.json.bind(res)
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(key, {
          data: body,
          expiry: Date.now() + ttlSeconds * 1000
        })
      }
      res.setHeader("X-Cache", "MISS")
      return originalJson(body)
    }

    next()
  }
}

export const clearCache = (prefix?: string): void => {
  if (!prefix) {
    memoryCache.clear()
    return
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(prefix)) {
      memoryCache.delete(key)
    }
  }
}
