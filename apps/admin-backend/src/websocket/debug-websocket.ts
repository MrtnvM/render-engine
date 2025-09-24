import type { WSContext } from 'hono/ws'

interface DebugWebSocketMessage {
  event: string
  scenario_id?: string
  schema_version?: string
  timestamp: string
}

export class DebugWebSocketHandler {
  private connections = new Set<WSContext>()

  handleConnection(c: WSContext): void {
    this.connections.add(c)

    // Note: In a real implementation, you would need to properly handle WebSocket events
    // For MVP, we'll just handle the connection and provide a basic interface

    // Send welcome message
    try {
      c.send(JSON.stringify({
        event: 'connected',
        timestamp: new Date().toISOString(),
      }))
    } catch (error) {
      console.error('Failed to send welcome message:', error)
    }
  }

  notifySchemaUpdate(scenarioId: string, schemaVersion: string): void {
    const message: DebugWebSocketMessage = {
      event: 'schema_updated',
      scenario_id: scenarioId,
      schema_version: schemaVersion,
      timestamp: new Date().toISOString(),
    }

    this.broadcast(message)
  }

  private handleMessage(c: WSContext, data: string): void {
    try {
      const message = JSON.parse(data)

      // Handle ping/pong for connection health
      if (message.event === 'ping') {
        this.sendMessage(c, {
          event: 'pong',
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  private sendMessage(c: WSContext, message: DebugWebSocketMessage): void {
    try {
      c.send(JSON.stringify(message))
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
      this.connections.delete(c)
    }
  }

  private broadcast(message: DebugWebSocketMessage): void {
    const messageString = JSON.stringify(message)

    for (const connection of this.connections) {
      try {
        connection.send(messageString)
      } catch (error) {
        console.error('Failed to broadcast to connection:', error)
        this.connections.delete(connection)
      }
    }
  }

  getConnectionCount(): number {
    return this.connections.size
  }
}