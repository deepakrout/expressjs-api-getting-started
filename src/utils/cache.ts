import NodeCache from 'node-cache';

const ttl = parseInt(process.env.CACHE_TTL_SECONDS || '60', 10);

export const cache = new NodeCache({ stdTTL: ttl, checkperiod: ttl * 0.2 });

export function cacheMiddleware(key: string) {
  return (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    const cacheKey = `${key}:${req.url}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }
    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      cache.set(cacheKey, body);
      return originalJson(body);
    };
    next();
  };
}
