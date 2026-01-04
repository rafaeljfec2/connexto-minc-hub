import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { Person } from '@/types'
import { formatDate } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

const MOCK_PEOPLE: Person[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '(11) 99999-9999',
    birthDate: '1990-01-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: '(11) 88888-8888',
    birthDate: '1985-05-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>(MOCK_PEOPLE)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    notes: '',
  })

  const filteredPeople = people.filter((person) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      person.name.toLowerCase().includes(searchLower) ||
      person.email?.toLowerCase().includes(searchLower) ||
      person.phone?.toLowerCase().includes(searchLower)
    )
  })

  const totalPages = Math.ceil(filteredPeople.length / ITEMS_PER_PAGE)
  const paginatedPeople = filteredPeople.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  function handleOpenModal(person?: Person) {
    if (person) {
      setEditingPerson(person)
      setFormData({
        name: person.name,
        email: person.email ?? '',
        phone: person.phone ?? '',
        birthDate: person.birthDate ?? '',
        address: person.address ?? '',
        notes: person.notes ?? '',
      })
    } else {
      setEditingPerson(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        address: '',
        notes: '',
      })
    }
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setEditingPerson(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      address: '',
      notes: '',
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (editingPerson) {
      setPeople(people.map(p => 
        p.id === editingPerson.id 
          ? { ...p, ...formData, updatedAt: new Date().toISOString() }
          : p
      ))
    } else {
      const newPerson: Person = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setPeople([...people, newPerson])
    }
    
    handleCloseModal()
  }

  function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir esta pessoa?')) {
      setPeople(people.filter(p => p.id !== id))
    }
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-50 mb-2">
            Pessoas
          </h1>
          <p className="text-dark-400">
            Gerencie membros do Time Boas-Vindas
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
          Adicionar Pessoa
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <SearchInput
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            onClear={() => {
              setSearchTerm('')
              setCurrentPage(1)
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pessoas ({filteredPeople.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPeople.length === 0 ? (
            <div className="text-sm text-dark-400 text-center py-8">
              {searchTerm
                ? 'Nenhuma pessoa encontrada'
                : 'Nenhuma pessoa cadastrada'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Data de Nascimento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPeople.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.email ?? '-'}</TableCell>
                    <TableCell>{person.phone ?? '-'}</TableCell>
                    <TableCell>
                      {person.birthDate ? formatDate(person.birthDate) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(person)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(person.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredPeople.length}
            />
          </>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPerson ? 'Editar Pessoa' : 'Nova Pessoa'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Telefone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
          <Input
            label="Data de Nascimento"
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          />
          <Input
            label="Endereço"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full h-24 px-4 py-2 rounded-lg bg-dark-900 border border-dark-700 text-dark-50 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Observações sobre a pessoa..."
            />
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
              {editingPerson ? 'Salvar Alterações' : 'Adicionar Pessoa'}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  )
}
