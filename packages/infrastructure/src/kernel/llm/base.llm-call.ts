import type { z } from 'zod'
import fs from 'node:fs/promises'

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SystemModelMessage, UserModelMessage, AssistantModelMessage, ToolModelMessage, LanguageModel } from 'ai'
import * as ai from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { createOpenAI } from '@ai-sdk/openai'
import { logger } from '@render-engine/domain'
import { wrapAISDK } from 'langsmith/experimental/vercel'
import { wait } from '../time/index.js'

export abstract class BaseLlmCall<T extends z.ZodSchema> {
  protected readonly logger = logger(BaseLlmCall)
  protected retryCount = 0
  protected readonly baseDelay = 250

  protected readonly openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  protected readonly openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  })

  abstract get outputSchema(): T

  abstract getSystemPrompt(): Promise<string>
  abstract getMessages(): Promise<(UserModelMessage | AssistantModelMessage | ToolModelMessage)[]>

  get shouldLog(): boolean {
    return true
  }

  get modelName(): string {
    return 'openai/gpt-5-mini'
  }

  get maxRetries(): number {
    return 3
  }

  async getModel(): Promise<LanguageModel> {
    return this.openrouter.chat(this.modelName, {
      provider: {
        sort: 'throughput',
        allow_fallbacks: true,
        data_collection: 'allow',
      },
      usage: {
        include: true,
      },
    })
  }

  /**
   * Load a prompt from the prompts directory
   * @param name - The name of the prompt (without the .prompt.md extension).
   * Like "codegen/component-creation" or "codegen/entity".
   * @returns The prompt
   */
  async loadPrompt(name: string): Promise<string> {
    const filename = fileURLToPath(import.meta.url)
    const dirname = path.dirname(filename)
    const baseDir = path.join(dirname, '..', '..', '..', 'prompts')

    const nameParts = name.split('/')
    nameParts[nameParts.length - 1] = nameParts[nameParts.length - 1].replace('_', '-')
    const namePartsStr = nameParts.join(path.sep)

    const filePath = path.join(baseDir, `${namePartsStr}.prompt.md`)
    const fileContent = await fs.readFile(filePath, 'utf8')
    return fileContent
  }

  /**
   * Invoke the LLM call and return the structured object result
   * @returns The result
   */
  async invoke(): Promise<z.infer<typeof this.outputSchema>> {
    const [model, systemPrompt, restMessages] = await Promise.all([
      this.getModel(),
      this.getSystemPrompt(),
      this.getMessages(),
    ])

    const systemMessage: SystemModelMessage = {
      role: 'system',
      content: systemPrompt,
    }

    const { generateObject, streamObject } = wrapAISDK(ai)

    if (this.shouldLog) {
      const { object, partialObjectStream } = streamObject({
        model,
        messages: [systemMessage, ...restMessages],
        schema: this.outputSchema as any,
      })

      for await (const chunk of partialObjectStream) {
        this.logger.info('LLM call chunk', { chunk })
      }

      const result = await object
      return result
    }

    while (this.retryCount < this.maxRetries) {
      try {
        const result = await generateObject({
          model,
          messages: [systemMessage, ...restMessages],
          schema: this.outputSchema as any,
        })
        this.logger.info('LLM call result', { result })
        const object = result.object
        return object
      } catch (error) {
        this.retryCount++

        if (this.retryCount >= this.maxRetries) {
          this.logger.error(`LLM call failed after all retries (max retries reached: ${this.maxRetries})`, { error })
          throw error
        }

        this.logger.error(`LLM call failed, retrying... (retry count: ${this.retryCount})`, { error })
        await wait(this.baseDelay * 2 ** this.retryCount)
      }
    }

    throw new Error('LLM call failed after all retries')
  }
}
