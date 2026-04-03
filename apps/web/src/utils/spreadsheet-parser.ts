import Papa from 'papaparse'
import ExcelJS from 'exceljs'
import { normalizePhone } from './phone-normalizer'
import { logger } from '../lib/logger'

export interface ParsedRow {
  rowNumber: number
  originalData: Record<string, string>
  nome: string
  telefone: string
  equipe: string
  errors: string[]
}

export async function parseSpreadsheet(file: File): Promise<ParsedRow[]> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase()

  if (fileExtension === 'csv') {
    return parseCSV(file)
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return parseExcel(file)
  } else {
    throw new Error('Formato de arquivo não suportado. Use CSV ou Excel (.xlsx, .xls).')
  }
}

async function parseCSV(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        if (results.errors.length > 0) {
          logger.error('Erros no parsing CSV', 'SpreadsheetParser', results.errors)
          reject(new Error(`Erro ao parsear CSV: ${results.errors[0].message}`))
          return
        }
        resolve(validateAndNormalizeRows(results.data as Record<string, string>[]))
      },
      error: err => {
        logger.error('Erro fatal no parsing CSV', 'SpreadsheetParser', err)
        reject(new Error('Erro fatal ao parsear CSV.'))
      },
    })
  })
}

async function parseExcel(file: File): Promise<ParsedRow[]> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)

    const worksheet = workbook.getWorksheet(1)
    if (!worksheet || worksheet.rowCount === 0) {
      return []
    }

    const headerRow = worksheet.getRow(1)
    const headers: string[] = []
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value ?? '')
        .toLowerCase()
        .trim()
    })

    const rows: Record<string, string>[] = []
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return

      const rowData: Record<string, string> = {}
      const isEmpty =
        row.values === undefined ||
        (Array.isArray(row.values) &&
          row.values.every(v => v === undefined || v === null || v === ''))
      if (isEmpty) return

      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber]
        if (header) {
          rowData[header] = String(cell.value ?? '')
        }
      })
      rows.push(rowData)
    })

    return validateAndNormalizeRows(rows)
  } catch (error) {
    logger.error('Erro ao parsear Excel', 'SpreadsheetParser', error)
    throw new Error('Erro ao parsear arquivo Excel.')
  }
}

/**
 * Valida e normaliza os dados de cada linha.
 */
function validateAndNormalizeRows(data: Record<string, string>[]): ParsedRow[] {
  const result: ParsedRow[] = []

  data.forEach((row, index) => {
    const errors: string[] = []
    const normalizedRow: Partial<ParsedRow> = {
      rowNumber: index + 2, // Linha da planilha (considerando cabeçalho)
      originalData: row,
    }

    // Mapear e validar nome
    const nomeKey = Object.keys(row).find(key => key.toLowerCase() === 'nome')
    let nome = nomeKey ? row[nomeKey]?.trim() : ''
    // Remover números do nome e normalizar
    if (nome) {
      // Remover todos os dígitos numéricos
      nome = nome.replace(/\d+/g, '').trim()
      // Remover espaços múltiplos e normalizar espaços
      nome = nome.replace(/\s+/g, ' ').trim()
      // Remover espaços no início e fim
      nome = nome.trim()
    }
    if (!nome) {
      errors.push('Nome é obrigatório.')
    }
    normalizedRow.nome = nome || ''

    // Mapear e validar telefone
    const telefoneKey =
      Object.keys(row).find(key => key.toLowerCase() === 'telefone - whatsapp') ||
      Object.keys(row).find(key => key.toLowerCase() === 'telefone')
    const rawPhone = telefoneKey ? row[telefoneKey] : ''
    const telefone = normalizePhone(rawPhone)
    if (!telefone) {
      errors.push('Telefone inválido ou muito curto.')
    }
    normalizedRow.telefone = telefone || ''

    // Mapear equipe (opcional)
    const equipeKey = Object.keys(row).find(key => key.toLowerCase() === 'equipe')
    const equipe = equipeKey ? row[equipeKey]?.trim() : ''
    normalizedRow.equipe = equipe || ''

    result.push({
      ...normalizedRow,
      errors,
    } as ParsedRow)
  })

  return result
}
