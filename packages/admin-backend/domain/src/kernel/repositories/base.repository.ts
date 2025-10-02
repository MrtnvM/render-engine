export interface IPaginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>
  exists(id: string): Promise<boolean>
  findAll(options?: { page?: number; limit?: number }): Promise<IPaginated<T>>

  save(entity: T): Promise<T>
  delete(id: string): Promise<void>
}
