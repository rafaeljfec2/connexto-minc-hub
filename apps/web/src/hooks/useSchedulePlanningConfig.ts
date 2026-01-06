import { useState, useCallback, useEffect } from 'react'
import {
  SchedulePlanningConfig,
  TeamPlanningConfig,
  SchedulePlanningTemplate,
} from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useChurch } from '@/contexts/ChurchContext'
import { AxiosError } from 'axios'
import { ApiResponse } from '@minc-hub/shared/types'

type CreateSchedulePlanningConfig = Omit<
  SchedulePlanningConfig,
  'id' | 'churchId' | 'createdAt' | 'updatedAt'
>
type CreateTeamPlanningConfig = Omit<
  TeamPlanningConfig,
  'id' | 'teamId' | 'createdAt' | 'updatedAt'
>
type CreateTemplate = Omit<
  SchedulePlanningTemplate,
  'id' | 'isSystemTemplate' | 'createdByChurchId' | 'createdAt' | 'updatedAt'
> & {
  churchId: string
}

interface UseSchedulePlanningConfigReturn {
  config: SchedulePlanningConfig | null
  isLoading: boolean
  error: Error | null
  fetchConfig: () => Promise<void>
  createOrUpdateConfig: (data: Partial<CreateSchedulePlanningConfig>) => Promise<SchedulePlanningConfig>
  getTeamConfig: (teamId: string) => Promise<TeamPlanningConfig | null>
  createOrUpdateTeamConfig: (
    teamId: string,
    data: Partial<CreateTeamPlanningConfig>,
  ) => Promise<TeamPlanningConfig>
  templates: SchedulePlanningTemplate[]
  isLoadingTemplates: boolean
  fetchTemplates: () => Promise<void>
  createTemplate: (data: CreateTemplate) => Promise<SchedulePlanningTemplate>
  applyTemplate: (templateId: string) => Promise<SchedulePlanningConfig>
  deleteTemplate: (templateId: string) => Promise<void>
  refresh: () => Promise<void>
}

const apiServices = createApiServices(api)

function extractErrorMessage(err: unknown, defaultMessage: string): string {
  if (err instanceof AxiosError && err.response) {
    const apiResponse = err.response.data as ApiResponse<unknown>
    if (apiResponse && apiResponse.message) {
      return apiResponse.message
    }
  }
  return err instanceof Error ? err.message : defaultMessage
}

export function useSchedulePlanningConfig(): UseSchedulePlanningConfigReturn {
  const [config, setConfig] = useState<SchedulePlanningConfig | null>(null)
  const [templates, setTemplates] = useState<SchedulePlanningTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { showSuccess, showError } = useToast()
  const { selectedChurch } = useChurch()

  const fetchConfig = useCallback(async () => {
    if (!selectedChurch) {
      setConfig(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await apiServices.schedulePlanningService.getConfig(selectedChurch.id)
      setConfig(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch config')
      setError(error)
      // Don't throw for 404 - config might not exist yet
      if (err instanceof AxiosError && err.response?.status !== 404) {
        throw error
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedChurch])

  const createOrUpdateConfig = useCallback(
    async (data: Partial<CreateSchedulePlanningConfig>): Promise<SchedulePlanningConfig> => {
      if (!selectedChurch) {
        throw new Error('No church selected')
      }

      try {
        setIsLoading(true)
        setError(null)
        const newConfig = await apiServices.schedulePlanningService.createOrUpdateConfig(
          selectedChurch.id,
          data,
        )
        setConfig(newConfig)
        showSuccess('Configuração salva com sucesso!')
        return newConfig
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao salvar configuração')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [selectedChurch, showSuccess, showError],
  )

  const getTeamConfig = useCallback(
    async (teamId: string): Promise<TeamPlanningConfig | null> => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await apiServices.schedulePlanningService.getTeamConfig(teamId)
        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch team config')
        setError(error)
        // Don't throw for 404 - config might not exist yet
        if (err instanceof AxiosError && err.response?.status !== 404) {
          throw error
        }
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const createOrUpdateTeamConfig = useCallback(
    async (
      teamId: string,
      data: Partial<CreateTeamPlanningConfig>,
    ): Promise<TeamPlanningConfig> => {
      try {
        setIsLoading(true)
        setError(null)
        const newConfig = await apiServices.schedulePlanningService.createOrUpdateTeamConfig(
          teamId,
          data,
        )
        showSuccess('Configuração do time salva com sucesso!')
        return newConfig
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao salvar configuração do time')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [showSuccess, showError],
  )

  const fetchTemplates = useCallback(async () => {
    if (!selectedChurch) {
      setTemplates([])
      return
    }

    try {
      setIsLoadingTemplates(true)
      setError(null)
      const data = await apiServices.schedulePlanningService.getTemplates(selectedChurch.id)
      setTemplates(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch templates')
      setError(error)
      throw error
    } finally {
      setIsLoadingTemplates(false)
    }
  }, [selectedChurch])

  const createTemplate = useCallback(
    async (data: CreateTemplate): Promise<SchedulePlanningTemplate> => {
      if (!selectedChurch) {
        throw new Error('No church selected')
      }

      try {
        setIsLoadingTemplates(true)
        setError(null)
        const newTemplate = await apiServices.schedulePlanningService.createTemplate({
          ...data,
          churchId: selectedChurch.id,
        })
        setTemplates(prev => [...prev, newTemplate])
        showSuccess('Template criado com sucesso!')
        return newTemplate
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao criar template')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        throw error
      } finally {
        setIsLoadingTemplates(false)
      }
    },
    [selectedChurch, showSuccess, showError],
  )

  const applyTemplate = useCallback(
    async (templateId: string): Promise<SchedulePlanningConfig> => {
      if (!selectedChurch) {
        throw new Error('No church selected')
      }

      try {
        setIsLoading(true)
        setError(null)
        const newConfig = await apiServices.schedulePlanningService.applyTemplate(
          templateId,
          selectedChurch.id,
        )
        setConfig(newConfig)
        showSuccess('Template aplicado com sucesso!')
        return newConfig
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao aplicar template')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [selectedChurch, showSuccess, showError],
  )

  const deleteTemplate = useCallback(
    async (templateId: string): Promise<void> => {
      if (!selectedChurch) {
        throw new Error('No church selected')
      }

      try {
        setIsLoadingTemplates(true)
        setError(null)
        await apiServices.schedulePlanningService.deleteTemplate(templateId, selectedChurch.id)
        setTemplates(prev => prev.filter(template => template.id !== templateId))
        showSuccess('Template excluído com sucesso!')
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao excluir template')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        throw error
      } finally {
        setIsLoadingTemplates(false)
      }
    },
    [selectedChurch, showSuccess, showError],
  )

  const refresh = useCallback(async () => {
    await Promise.all([fetchConfig(), fetchTemplates()])
  }, [fetchConfig, fetchTemplates])

  // Auto-fetch on mount and when church changes
  useEffect(() => {
    if (selectedChurch) {
      fetchConfig().catch(() => {
        // Error already handled in fetchConfig
      })
      fetchTemplates().catch(() => {
        // Error already handled in fetchTemplates
      })
    } else {
      setConfig(null)
      setTemplates([])
    }
  }, [fetchConfig, fetchTemplates, selectedChurch])

  return {
    config,
    isLoading,
    error,
    fetchConfig,
    createOrUpdateConfig,
    getTeamConfig,
    createOrUpdateTeamConfig,
    templates,
    isLoadingTemplates,
    fetchTemplates,
    createTemplate,
    applyTemplate,
    deleteTemplate,
    refresh,
  }
}
