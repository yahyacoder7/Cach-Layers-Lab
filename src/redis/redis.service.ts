// --- IMPORTS : pull in the tools/classes we need ---------------------------------
import {
  Injectable,        // decorator: marks this class as a provider NestJS can inject
  OnModuleDestroy,   // interface: "call my onModuleDestroy() when app shuts down"
  Logger,            // NestJS logger: prints messages to the console
  OnModuleInit,      // interface: "call my onModuleInit() when app starts up"
} from '@nestjs/common';
import Redis from 'ioredis';          // the Redis client library (talks to Redis server)
import { ConfigService } from '@nestjs/config'; // reads env vars from .env

// --- CLASS DECLARATION ----------------------------------------------------------
@Injectable()  // tells NestJS "this class can be injected into other classes"
export class RedisService implements OnModuleDestroy, OnModuleInit {
  // "implements" = promise to provide the methods those interfaces require
  // OnModuleDestroy  -> must have onModuleDestroy()  (ran at shutdown)
  // OnModuleInit     -> must have onModuleInit()     (ran at startup)
  private readonly client: Redis;   // holds the live Redis connection, private so only this class uses it
  private readonly logger = new Logger(RedisService.name);
  // Logger(context) -> gives logs a label. RedisService.name equals the string "RedisService"
  // .name is a built-in property on any class that returns the class's name as text.
  // So logs appear like: [RedisService] Error ...  (easier to read which file logged it)

  // --- CONSTRUCTOR : runs ONCE when the app starts ---------------------------------
  constructor(private readonly config: ConfigService) {
    // "constructor(private readonly config...)" automatically creates a config field AND injects ConfigService
    this.client = new Redis({
      host: this.config.get<string>('REDIS_HOST') ?? 'localhost',
      port: parseInt(this.config.get<string>('REDIS_PORT') ?? '6379', 10),
      password: this.config.get<string>('REDIS_PASSWORD') || undefined,
    });
    // new Redis({...}) immediately starts the connection to the Redis server
    // config.get reads each value from .env; ?? gives a fallback default if it's missing
  }

  // --- GET : read a value by key --------------------------------------------------
  async get(key: string): Promise<string | null> {
    // "async" -> always returns a Promise (a "later" result), never blocks the app
    // Promise<string | null> -> the value will eventually be a string (value found)
    //   OR null (key not found / expired / an error happened)
    try {
      return await this.client.get(key); // "await" waits for Redis to reply, then returns the string
    } catch (error) {
      this.logger.error(`Error getting key "${key}":`, error); // log what went wrong
      return null; // graceful fallback: if Redis fails, act like the key just doesn't exist
    }
  }

  // --- SET : store a value under a key ----------------------------------------------
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    // the "?" after ttlSeconds means the argument is OPTIONAL (can be omitted)
    // Promise<void> -> "void" means it eventually returns NOTHING (no value),
    //   but async still needs a Promise to tell callers when it's done
    try {
      if (ttlSeconds) {
        // if a truthy ttl was given (e.g. 60), store WITH an expiry
        await this.client.set(key, value, 'EX', ttlSeconds); // 'EX' = expire in N seconds
      } else {
        // if ttl is 0 / null / undefined -> store with NO expiry (stays forever)
        await this.client.set(key, value);
      }
      this.logger.log(`Key "${key}" set successfully`);
    } catch (error) {
      this.logger.error(`Error setting key "${key}":`, error);
    }
  }

  // --- DEL : delete a key ------------------------------------------------------------
  async del(key: string): Promise<void> {
    // Promise<void> -> returns nothing when done (just confirms the delete ran)
    try {
      await this.client.del(key); // ask Redis to remove that key
    } catch (error) {
      this.logger.error(`Error deleting key "${key}":`, error);
    }
  }

  // --- LIFE-CYCLE : runs at shutdown and startup ----------------------------------------
  async onModuleDestroy() {   // called when the app is shutting down
    await this.client.quit(); // cleanly close the Redis connection (release it)
    this.logger.log('Redis client disconnected');
  }
  async onModuleInit() {      // called when the app starts up
    await this.client.ping(); // send a "ping" to Redis to check it's reachable; fails if Redis is down
    this.logger.log('Redis client connected');
  }
}
