import { injectable } from "tsyringe"
import { promises as fs } from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import { Buffer } from "node:buffer"
import { globby } from "globby"
import type { IFileCacheService, CacheMetadata, CacheStats } from "@render-engine/domain"
import { logger } from "@render-engine/domain"

export interface FileCacheServiceOptions {
  /** Cache directory path (defaults to ~/.render-engine/cache) */
  cacheDir?: string;
  /** Default TTL in seconds (defaults to 3600 = 1 hour) */
  defaultTtl?: number;
  /** Maximum cache size in bytes (defaults to 100MB) */
  maxCacheSize?: number;
}

@injectable()
export class FileCacheService implements IFileCacheService {
  private readonly cacheDir: string
  private readonly defaultTtl: number
  private readonly maxCacheSize: number
  private readonly logger = logger(FileCacheService)
  private readonly stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  }

  constructor(options: FileCacheServiceOptions = {}) {
    this.cacheDir =
      options.cacheDir ?? path.resolve(process.env.HOME || process.env.USERPROFILE || "./", ".render-engine", "cache")
    this.defaultTtl = options.defaultTtl ?? 3600 // 1 hour
    this.maxCacheSize = options.maxCacheSize ?? 100 * 1024 * 1024 // 100MB
  }

  async get<T>(cacheKey: string): Promise<T | null> {
    try {
      this.logger.debug("Getting cache value", { cacheKey })

      const cachePath = this.getCachePath(cacheKey)
      const metadataPath = this.getMetadataPath(cacheKey)

      // Check if both cache and metadata files exist
      const [cacheExists, metadataExists] = await Promise.all([
        this.pathExists(cachePath),
        this.pathExists(metadataPath),
      ])

      if (!cacheExists || !metadataExists) {
        this.stats.misses++
        return null
      }

      // Read and validate metadata
      const metadata = await this.readMetadata(metadataPath)
      if (!metadata) {
        this.stats.misses++
        await this.deleteCacheFiles(cacheKey)
        return null
      }

      // Check if expired
      if (metadata.expiresAt && Date.now() > metadata.expiresAt.getTime()) {
        this.logger.debug("Cache entry expired", { cacheKey, expiresAt: metadata.expiresAt })
        this.stats.misses++
        await this.deleteCacheFiles(cacheKey)
        return null
      }

      // Read cached content
      const content = await fs.readFile(cachePath, "utf8")
      const parsedContent = JSON.parse(content)

      this.stats.hits++
      this.logger.debug("Cache hit", { cacheKey })

      return parsedContent as T
    } catch (error) {
      this.logger.error("Error getting cache value", { cacheKey, error })
      this.stats.misses++
      return null
    }
  }

  async set<T>(cacheKey: string, content: T, ttl?: number): Promise<void> {
    try {
      this.logger.debug("Setting cache value", { cacheKey, ttl })

      // Ensure cache directory exists
      await this.ensureCacheDirectory()

      // Check cache size limit
      await this.enforceCacheSizeLimit()

      const ttlSeconds = ttl ?? this.defaultTtl
      const expiresAt = ttlSeconds > 0 ? new Date(Date.now() + ttlSeconds * 1000) : null

      const contentString = JSON.stringify(content)
      const contentHash = this.hashContent(contentString)
      const size = Buffer.byteLength(contentString, "utf8")

      const metadata: CacheMetadata = {
        cacheKey,
        createdAt: new Date(),
        expiresAt,
        size,
        contentHash,
      }

      const cachePath = this.getCachePath(cacheKey)
      const metadataPath = this.getMetadataPath(cacheKey)

      // Write content and metadata atomically
      await Promise.all([
        fs.writeFile(cachePath, contentString, "utf8"),
        fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf8"),
      ])

      this.stats.sets++
      this.logger.debug("Cache set successfully", { cacheKey, size })
    } catch (error) {
      this.logger.error("Error setting cache value", { cacheKey, error })
      throw error
    }
  }

  async delete(cacheKey: string): Promise<void> {
    try {
      this.logger.debug("Deleting cache value", { cacheKey })
      await this.deleteCacheFiles(cacheKey)
      this.stats.deletes++
    } catch (error) {
      this.logger.error("Error deleting cache value", { cacheKey, error })
      throw error
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.debug("Clearing cache")

      if (await this.pathExists(this.cacheDir)) {
        const files = await fs.readdir(this.cacheDir)
        await Promise.all(files.map((file) => fs.unlink(path.join(this.cacheDir, file))))
      }

      // Reset stats
      this.stats.hits = 0
      this.stats.misses = 0
      this.stats.sets = 0
      this.stats.deletes = 0

      this.logger.debug("Cache cleared successfully")
    } catch (error) {
      this.logger.error("Error clearing cache", { error })
      throw error
    }
  }

  async has(cacheKey: string): Promise<boolean> {
    try {
      const cachePath = this.getCachePath(cacheKey)
      const metadataPath = this.getMetadataPath(cacheKey)

      const [cacheExists, metadataExists] = await Promise.all([
        this.pathExists(cachePath),
        this.pathExists(metadataPath),
      ])

      if (!cacheExists || !metadataExists) {
        return false
      }

      // Check if expired
      const metadata = await this.readMetadata(metadataPath)
      if (!metadata) {
        return false
      }

      if (metadata.expiresAt && Date.now() > metadata.expiresAt.getTime()) {
        await this.deleteCacheFiles(cacheKey)
        return false
      }

      return true
    } catch (error) {
      this.logger.error("Error checking cache key", { cacheKey, error })
      return false
    }
  }

  async getMetadata(cacheKey: string): Promise<CacheMetadata | null> {
    try {
      const metadataPath = this.getMetadataPath(cacheKey)

      if (!(await this.pathExists(metadataPath))) {
        return null
      }

      return await this.readMetadata(metadataPath)
    } catch (error) {
      this.logger.error("Error getting cache metadata", { cacheKey, error })
      return null
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      this.logger.debug("Invalidating cache pattern", { pattern })

      if (!(await this.pathExists(this.cacheDir))) {
        return
      }

      const cachePattern = path.join(this.cacheDir, `${pattern}.cache`)
      const metadataPattern = path.join(this.cacheDir, `${pattern}.meta`)

      const [cacheFiles, metadataFiles] = await Promise.all([globby(cachePattern), globby(metadataPattern)])

      const allFiles = [...cacheFiles, ...metadataFiles]
      await Promise.all(allFiles.map((file) => fs.unlink(file)))

      this.logger.debug("Cache pattern invalidated", { pattern, filesDeleted: allFiles.length })
    } catch (error) {
      this.logger.error("Error invalidating cache pattern", { pattern, error })
      throw error
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      let entryCount = 0
      let totalSize = 0
      let expiredCount = 0

      if (await this.pathExists(this.cacheDir)) {
        const files = await fs.readdir(this.cacheDir)
        const metadataFiles = files.filter((file) => file.endsWith(".meta"))

        for (const metaFile of metadataFiles) {
          const metadataPath = path.join(this.cacheDir, metaFile)
          const metadata = await this.readMetadata(metadataPath)

          if (metadata) {
            entryCount++
            totalSize += metadata.size

            if (metadata.expiresAt && Date.now() > metadata.expiresAt.getTime()) {
              expiredCount++
            }
          }
        }
      }

      const totalRequests = this.stats.hits + this.stats.misses
      const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0

      return {
        entryCount,
        totalSize,
        expiredCount,
        hitRate,
      }
    } catch (error) {
      this.logger.error("Error getting cache stats", { error })
      return {
        entryCount: 0,
        totalSize: 0,
        expiredCount: 0,
        hitRate: 0,
      }
    }
  }

  private getCachePath(cacheKey: string): string {
    const safeKey = this.sanitizeCacheKey(cacheKey)
    return path.join(this.cacheDir, `${safeKey}.cache`)
  }

  private getMetadataPath(cacheKey: string): string {
    const safeKey = this.sanitizeCacheKey(cacheKey)
    return path.join(this.cacheDir, `${safeKey}.meta`)
  }

  private sanitizeCacheKey(cacheKey: string): string {
    // Replace invalid filename characters with underscores
    return cacheKey.replace(/[<>:"/\\|?*]/g, "_")
  }

  private hashContent(content: string): string {
    return createHash("sha256").update(content).digest("hex")
  }

  private async pathExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  private async ensureCacheDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true })
    } catch (error) {
      this.logger.error("Failed to create cache directory", { cacheDir: this.cacheDir, error })
      throw error
    }
  }

  private async readMetadata(metadataPath: string): Promise<CacheMetadata | null> {
    try {
      const content = await fs.readFile(metadataPath, "utf8")
      const metadata = JSON.parse(content) as CacheMetadata

      // Convert date strings back to Date objects
      metadata.createdAt = new Date(metadata.createdAt)
      if (metadata.expiresAt) {
        metadata.expiresAt = new Date(metadata.expiresAt)
      }

      return metadata
    } catch (error) {
      this.logger.warn("Error reading cache metadata", { metadataPath, error })
      return null
    }
  }

  private async deleteCacheFiles(cacheKey: string): Promise<void> {
    const cachePath = this.getCachePath(cacheKey)
    const metadataPath = this.getMetadataPath(cacheKey)

    await Promise.all([
      fs.unlink(cachePath).catch(() => {}), // Ignore errors if file doesn't exist
      fs.unlink(metadataPath).catch(() => {}), // Ignore errors if file doesn't exist
    ])
  }

  private async enforceCacheSizeLimit(): Promise<void> {
    const stats = await this.getStats()

    if (stats.totalSize > this.maxCacheSize) {
      this.logger.warn("Cache size limit exceeded, cleaning up old entries", {
        currentSize: stats.totalSize,
        maxSize: this.maxCacheSize,
      })

      // Get all metadata files and sort by creation date
      const metadataFiles = await fs.readdir(this.cacheDir)
      const metaFiles = metadataFiles.filter((file) => file.endsWith(".meta"))

      const entries: Array<{ path: string; metadata: CacheMetadata }> = []

      for (const metaFile of metaFiles) {
        const metadataPath = path.join(this.cacheDir, metaFile)
        const metadata = await this.readMetadata(metadataPath)
        if (metadata) {
          entries.push({ path: metadataPath, metadata })
        }
      }

      // Sort by creation date (oldest first)
      entries.sort((a, b) => a.metadata.createdAt.getTime() - b.metadata.createdAt.getTime())

      // Delete oldest entries until we're under the limit
      let currentSize = stats.totalSize
      for (const entry of entries) {
        if (currentSize <= this.maxCacheSize * 0.8) {
          // Clean to 80% of limit
          break
        }

        const cacheKey = entry.metadata.cacheKey
        await this.deleteCacheFiles(cacheKey)
        currentSize -= entry.metadata.size

        this.logger.debug("Evicted cache entry due to size limit", {
          cacheKey,
          size: entry.metadata.size,
          createdAt: entry.metadata.createdAt,
        })
      }
    }
  }
}
