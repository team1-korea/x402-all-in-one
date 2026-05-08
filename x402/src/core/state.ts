import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Atomic state reset/path selection using Redis Lua script
 */
export async function resetPathAtomic(uuid: string, pathId: string) {
  return redis.eval(`
    if redis.call('SET', 'lock:' .. ARGV[1], 1, 'NX', 'EX', 10) then
      redis.call('HSET', 'player:' .. ARGV[1], 'position', 0, 'product', 'reset')
      redis.call('DECR', 'path:' .. ARGV[2] .. ':stock')
      redis.call('DEL', 'lock:' .. ARGV[1])
      return 1
    end
    return 0
  `, 0, uuid, pathId);
}
