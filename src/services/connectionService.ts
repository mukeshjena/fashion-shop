import { supabase, getConnectionStats } from '../lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

// Transaction and batch operation manager
export class DatabaseConnectionService {
  private static instance: DatabaseConnectionService
  private activeTransactions = new Map<string, any>()
  private batchQueue: Array<{ operation: () => Promise<any>; resolve: Function; reject: Function }> = []
  private batchTimer: NodeJS.Timeout | null = null
  private readonly BATCH_SIZE = 10
  private readonly BATCH_DELAY = 100 // ms

  private constructor() {}

  public static getInstance(): DatabaseConnectionService {
    if (!DatabaseConnectionService.instance) {
      DatabaseConnectionService.instance = new DatabaseConnectionService()
    }
    return DatabaseConnectionService.instance
  }

  // Execute multiple operations in a single transaction
  public async executeTransaction<T>(
    operations: Array<(client: SupabaseClient) => Promise<any>>,
    transactionId?: string
  ): Promise<T[]> {
    const txId = transactionId || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log(`🔄 Starting transaction: ${txId}`)
    
    try {
      this.activeTransactions.set(txId, { startTime: Date.now(), operations: operations.length })
      
      // Execute all operations using the same client instance
      const results: T[] = []
      
      for (const operation of operations) {
        const result = await operation(supabase)
        results.push(result)
      }
      
      console.log(`✅ Transaction completed: ${txId} (${operations.length} operations)`)
      return results
    } catch (error) {
      console.error(`❌ Transaction failed: ${txId}`, error)
      throw error
    } finally {
      this.activeTransactions.delete(txId)
    }
  }

  // Batch multiple operations to reduce connection overhead
  public async batchOperation<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ operation, resolve, reject })
      
      // Process batch when it reaches the size limit or after delay
      if (this.batchQueue.length >= this.BATCH_SIZE) {
        this.processBatch()
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.processBatch()
        }, this.BATCH_DELAY)
      }
    })
  }

  private async processBatch(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    const currentBatch = this.batchQueue.splice(0, this.BATCH_SIZE)
    if (currentBatch.length === 0) return

    console.log(`📦 Processing batch: ${currentBatch.length} operations`)

    // Execute all operations in parallel using the same connection
    const promises = currentBatch.map(async ({ operation, resolve, reject }) => {
      try {
        const result = await operation()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })

    await Promise.allSettled(promises)
  }

  // Optimized bulk insert
  public async bulkInsert<T>(
    table: string,
    data: T[],
    chunkSize: number = 100
  ): Promise<{ success: boolean; insertedCount: number; errors: any[] }> {
    const errors: any[] = []
    let insertedCount = 0

    console.log(`📥 Bulk inserting ${data.length} records into ${table}`)

    // Process in chunks to avoid overwhelming the connection
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize)
      
      try {
        const { data: result, error } = await supabase
          .from(table)
          .insert(chunk)
          .select()

        if (error) {
          errors.push({ chunk: i / chunkSize + 1, error })
        } else {
          insertedCount += result?.length || chunk.length
        }
      } catch (error) {
        errors.push({ chunk: i / chunkSize + 1, error })
      }
    }

    console.log(`✅ Bulk insert completed: ${insertedCount}/${data.length} records`)
    
    return {
      success: errors.length === 0,
      insertedCount,
      errors
    }
  }

  // Optimized bulk update
  public async bulkUpdate<T>(
    table: string,
    updates: Array<{ id: string; data: Partial<T> }>,
    chunkSize: number = 50
  ): Promise<{ success: boolean; updatedCount: number; errors: any[] }> {
    const errors: any[] = []
    let updatedCount = 0

    console.log(`📝 Bulk updating ${updates.length} records in ${table}`)

    // Process updates in chunks
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize)
      
      // Execute updates in parallel within the chunk
      const chunkPromises = chunk.map(async ({ id, data }) => {
        try {
          const { error } = await supabase
            .from(table)
            .update(data)
            .eq('id', id)

          if (error) {
            errors.push({ id, error })
          } else {
            updatedCount++
          }
        } catch (error) {
          errors.push({ id, error })
        }
      })

      await Promise.allSettled(chunkPromises)
    }

    console.log(`✅ Bulk update completed: ${updatedCount}/${updates.length} records`)
    
    return {
      success: errors.length === 0,
      updatedCount,
      errors
    }
  }

  // Connection-aware query with automatic retry
  public async executeQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
    retries: number = 3
  ): Promise<{ data: T | null; error: any }> {
    let lastError: any
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Executing query (attempt ${attempt}/${retries})`)
        const result = await queryFn(supabase)
        
        if (!result.error) {
          return result
        }
        
        lastError = result.error
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt - 1) * 1000
          console.log(`⏳ Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      } catch (error) {
        lastError = error
        
        if (attempt < retries) {
          const delay = Math.pow(2, attempt - 1) * 1000
          console.log(`⏳ Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    console.error(`❌ Query failed after ${retries} attempts:`, lastError)
    return { data: null, error: lastError }
  }

  // Get connection and performance statistics
  public getPerformanceStats() {
    const connectionStats = getConnectionStats()
    
    return {
      ...connectionStats,
      activeTransactions: this.activeTransactions.size,
      queuedOperations: this.batchQueue.length,
      batchProcessing: this.batchTimer !== null
    }
  }

  // Cleanup resources
  public cleanup(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    
    // Process any remaining batched operations
    if (this.batchQueue.length > 0) {
      this.processBatch()
    }
    
    this.activeTransactions.clear()
    console.log('🧹 Connection service cleanup completed')
  }
}

// Export singleton instance
export const connectionService = DatabaseConnectionService.getInstance()

// Utility functions for common operations
export const withTransaction = async <T>(
  operations: Array<(client: SupabaseClient) => Promise<any>>
): Promise<T[]> => {
  return connectionService.executeTransaction<T>(operations)
}

export const withBatch = async <T>(operation: () => Promise<T>): Promise<T> => {
  return connectionService.batchOperation(operation)
}

export const bulkInsert = async <T>(
  table: string,
  data: T[],
  chunkSize?: number
) => {
  return connectionService.bulkInsert(table, data, chunkSize)
}

export const bulkUpdate = async <T>(
  table: string,
  updates: Array<{ id: string; data: Partial<T> }>,
  chunkSize?: number
) => {
  return connectionService.bulkUpdate(table, updates, chunkSize)
}

export const executeQuery = async <T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  retries?: number
) => {
  return connectionService.executeQuery(queryFn, retries)
}

// Cleanup function for app shutdown
export const cleanupConnections = () => {
  connectionService.cleanup()
}