import { Hono } from 'hono'
import type { Context } from 'hono'
import { Platform } from '../../../packages/domain/src/schema-management/shared/enums/platform-support.enum.ts'
import { ConfigurationRequestDto, ConfigurationResponseDto, DefaultConfigurationResponseDto } from '../../../packages/application/src/dto/index.ts'
import { GetConfigurationUseCase, GetDefaultConfigurationUseCase } from '../../../packages/application/src/use-cases/index.ts'
import { ConfigurationServiceImpl } from '../../../packages/application/src/services/configuration.service.ts'
import { ConfigurationRepositoryImpl } from '../../../packages/infrastructure/src/schema-management/configuration/repositories/configuration.repository.ts'
import { MockExperimentService } from '../services/mock-experiment.service.ts'

export class ConfigurationController {
  private getConfigurationUseCase: GetConfigurationUseCase
  private getDefaultConfigurationUseCase: GetDefaultConfigurationUseCase

  constructor() {
    // TODO: Initialize with proper dependency injection
    const configurationRepository = new ConfigurationRepositoryImpl()
    const experimentService = new MockExperimentService()
    const configurationService = new ConfigurationServiceImpl(configurationRepository, experimentService)

    this.getConfigurationUseCase = new GetConfigurationUseCase(configurationService)
    this.getDefaultConfigurationUseCase = new GetDefaultConfigurationUseCase(configurationService)
  }

  async getConfiguration(c: Context): Promise<Response> {
    try {
      const query = c.req.query()

      // Parse and validate request
      const requestDto = ConfigurationRequestDto.fromQuery(query)
      const useCaseRequest = requestDto.toUseCaseRequest()

      // Execute use case
      const useCaseResponse = await this.getConfigurationUseCase.execute(useCaseRequest)
      const responseDto = ConfigurationResponseDto.fromUseCaseResponse(useCaseResponse)

      // Check for cache validation
      const ifNoneMatch = c.req.header('If-None-Match')
      const ifModifiedSince = c.req.header('If-Modified-Since')

      if (this.isNotModified(ifNoneMatch, ifModifiedSince, responseDto.etag, responseDto.lastModified)) {
        return new Response(null, {
          status: 304,
          headers: {
            'ETag': responseDto.etag,
            'Last-Modified': responseDto.lastModified,
            'Cache-Control': 'max-age=60',
          },
        })
      }

      // Return successful response
      return new Response(JSON.stringify(responseDto.toJSON()), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'ETag': responseDto.etag,
          'Last-Modified': responseDto.lastModified,
          'Cache-Control': 'max-age=60',
        },
      })
    } catch (error) {
      console.error('Configuration API error:', error)

      // Determine error type and response
      if (error instanceof Error) {
        // Version compatibility error
        if (error.message.includes('version')) {
          return new Response(JSON.stringify({
            error: 'Version not supported',
            message: error.message,
          }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Validation error
        return new Response(JSON.stringify({
          error: 'Bad Request',
          message: error.message,
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Generic server error - return default schema
      const defaultResponse = await this.getDefaultConfigurationUseCase.execute({
        scenarioId: c.req.query('scenario_id'),
        platform: c.req.query('platform') as Platform,
      })

      return new Response(JSON.stringify(defaultResponse), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=60',
        },
      })
    }
  }

  async getDefaultConfiguration(c: Context): Promise<Response> {
    try {
      const query = c.req.query()
      const scenarioId = query.scenario_id as string | undefined
      const platform = query.platform as Platform | undefined

      const useCaseResponse = await this.getDefaultConfigurationUseCase.execute({
        scenarioId,
        platform,
      })

      const responseDto = DefaultConfigurationResponseDto.fromUseCaseResponse(useCaseResponse)

      return new Response(JSON.stringify(responseDto.toJSON()), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=300', // 5 minutes for default configs
        },
      })
    } catch (error) {
      console.error('Default configuration API error:', error)

      return new Response(JSON.stringify({
        schema_version: '1.0.0',
        scenario_id: 'default',
        config: {
          type: 'Screen',
          id: 'default_screen',
          children: [
            {
              type: 'Text',
              props: { text: 'Something went wrong. Please try again.' },
            },
          ],
        },
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  private isNotModified(
    ifNoneMatch?: string,
    ifModifiedSince?: string,
    currentEtag?: string,
    lastModified?: string,
  ): boolean {
    if (ifNoneMatch && currentEtag && ifNoneMatch === currentEtag) {
      return true
    }

    if (ifModifiedSince && lastModified) {
      const clientDate = new Date(ifModifiedSince)
      const serverDate = new Date(lastModified)
      return clientDate >= serverDate
    }

    return false
  }

}