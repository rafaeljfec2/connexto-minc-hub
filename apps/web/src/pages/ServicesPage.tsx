import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Service, ServiceType } from '@/types'
import { formatTime } from '@/lib/utils'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
]

const SERVICE_TYPES = [
  { value: ServiceType.SUNDAY_MORNING, label: 'Domingo Manhã' },
  { value: ServiceType.SUNDAY_EVENING, label: 'Domingo Noite' },
  { value: ServiceType.WEDNESDAY, label: 'Quarta-feira' },
  { value: ServiceType.FRIDAY, label: 'Sexta-feira' },
  { value: ServiceType.SPECIAL, label: 'Especial' },
]

const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    churchId: '1',
    type: ServiceType.SUNDAY_MORNING,
    dayOfWeek: 0,
    time: '09:00',
    name: 'Culto Dominical Manhã',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    churchId: '1',
    type: ServiceType.SUNDAY_EVENING,
    dayOfWeek: 0,
    time: '19:00',
    name: 'Culto Dominical Noite',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    churchId: '1',
    type: ServiceType.WEDNESDAY,
    dayOfWeek: 3,
    time: '19:30',
    name: 'Culto de Oração',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: ServiceType.SUNDAY_MORNING,
    dayOfWeek: 0,
    time: '09:00',
    isActive: true,
  })

  function handleOpenModal(service?: Service) {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        type: service.type,
        dayOfWeek: service.dayOfWeek,
        time: service.time,
        isActive: service.isActive,
      })
    } else {
      setEditingService(null)
      setFormData({
        name: '',
        type: ServiceType.SUNDAY_MORNING,
        dayOfWeek: 0,
        time: '09:00',
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setEditingService(null)
    setFormData({
      name: '',
      type: ServiceType.SUNDAY_MORNING,
      dayOfWeek: 0,
      time: '09:00',
      isActive: true,
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (editingService) {
      setServices(services.map(s => 
        s.id === editingService.id 
          ? { ...s, ...formData, updatedAt: new Date().toISOString() }
          : s
      ))
    } else {
      const newService: Service = {
        id: Date.now().toString(),
        ...formData,
        churchId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setServices([...services, newService])
    }
    
    handleCloseModal()
  }

  function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este culto?')) {
      setServices(services.filter(s => s.id !== id))
    }
  }

  function getServiceTypeLabel(type: ServiceType) {
    return SERVICE_TYPES.find(t => t.value === type)?.label ?? type
  }

  function getDayLabel(day: number) {
    return DAYS_OF_WEEK.find(d => d.value === day)?.label ?? 'Domingo'
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-50 mb-2">
            Cultos e Serviços
          </h1>
          <p className="text-dark-400">
            Configure os cultos e horários da igreja
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
          Novo Culto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cultos ({services.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-sm text-dark-400 text-center py-8">
              Nenhum culto cadastrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Dia da Semana</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{getServiceTypeLabel(service.type)}</TableCell>
                    <TableCell>{getDayLabel(service.dayOfWeek)}</TableCell>
                    <TableCell>{formatTime(service.time)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {service.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(service)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingService ? 'Editar Culto' : 'Novo Culto'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Culto *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Tipo de Culto *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ServiceType })}
              className="w-full h-11 px-4 rounded-lg bg-dark-900 border border-dark-700 text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              {SERVICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Dia da Semana *
            </label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
              className="w-full h-11 px-4 rounded-lg bg-dark-900 border border-dark-700 text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Horário *"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-dark-700 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-dark-300 cursor-pointer">
              Culto ativo
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingService ? 'Salvar Alterações' : 'Criar Culto'}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  )
}
