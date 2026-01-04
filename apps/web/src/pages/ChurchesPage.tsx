import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Church } from "@/types";

const ITEMS_PER_PAGE = 10;

const MOCK_CHURCHES: Church[] = [
  {
    id: "1",
    name: "Minha Igreja na Cidade - Sede",
    address: "Rua Exemplo, 123 - Centro",
    phone: "(11) 3333-3333",
    email: "contato@minhaigrejanacidade.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ChurchesPage() {
  const [churches, setChurches] = useState<Church[]>(MOCK_CHURCHES);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChurch, setEditingChurch] = useState<Church | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const filteredChurches = churches.filter((church) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      church.name.toLowerCase().includes(searchLower) ||
      church.address?.toLowerCase().includes(searchLower) ||
      church.email?.toLowerCase().includes(searchLower) ||
      church.phone?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredChurches.length / ITEMS_PER_PAGE);
  const paginatedChurches = filteredChurches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function handleOpenModal(church?: Church) {
    if (church) {
      setEditingChurch(church);
      setFormData({
        name: church.name,
        address: church.address ?? "",
        phone: church.phone ?? "",
        email: church.email ?? "",
      });
    } else {
      setEditingChurch(null);
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
      });
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingChurch(null);
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingChurch) {
      setChurches(
        churches.map((c) =>
          c.id === editingChurch.id
            ? {
                ...c,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } else {
      const newChurch: Church = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setChurches([...churches, newChurch]);
    }

    handleCloseModal();
  }

  function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir esta igreja?")) {
      setChurches(churches.filter((c) => c.id !== id));
    }
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-50 mb-2">Igrejas</h1>
          <p className="text-dark-400">
            Gerencie as igrejas cadastradas no sistema
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
          Nova Igreja
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <SearchInput
            placeholder="Buscar por nome, endereço, email ou telefone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            onClear={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Igrejas ({filteredChurches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredChurches.length === 0 ? (
            <div className="text-sm text-dark-400 text-center py-8">
              {searchTerm
                ? "Nenhuma igreja encontrada"
                : "Nenhuma igreja cadastrada"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedChurches.map((church) => (
                    <TableRow key={church.id}>
                      <TableCell className="font-medium">
                        {church.name}
                      </TableCell>
                      <TableCell>{church.address ?? "-"}</TableCell>
                      <TableCell>{church.phone ?? "-"}</TableCell>
                      <TableCell>{church.email ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(church)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(church.id)}
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
                totalItems={filteredChurches.length}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingChurch ? "Editar Igreja" : "Nova Igreja"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome da Igreja *"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
          <Input
            label="Endereço"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Rua, número - Bairro, Cidade"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telefone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="(11) 3333-3333"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="contato@igreja.com"
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
              {editingChurch ? "Salvar Alterações" : "Criar Igreja"}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
