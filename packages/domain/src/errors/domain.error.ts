export abstract class BaseDomainError extends Error {
  public readonly name: string;
  public readonly code: string;
  public readonly metadata?: Record<string, unknown>;

  protected constructor(params: { message: string; code?: string; metadata?: Record<string, unknown> }) {
    super(params.message);
    this.name = this.constructor.name;
    this.code = params.code || this.name.replace(/([A-Z])/g, "_$1").toUpperCase();
    this.metadata = params.metadata;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toString(): string {
    return `[${this.code}] ${this.message}`;
  }
}
