import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TableRow, TableCell } from "@/components/ui/Table";
import { useModal } from "@/hooks/useModal";
import { useCrud } from "@/hooks/useCrud";
import { useViewMode } from "@/hooks/useViewMode";
import { CrudPageLayout } from "@/components/crud/CrudPageLayout";
import { CrudFilters } from "@/components/crud/CrudFilters";
import { CrudView } from "@/components/crud/CrudView";
import { Church } from "@/types";
import { ChurchCard } from "./churches/components/ChurchCard";
import { EditIcon, TrashIcon } from "@/components/icons";

function PlusIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

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
  const {
    items: churches,
    create,
    update,
    remove,
  } = useCrud<Church>({
    initialItems: MOCK_CHURCHES,
  });
  const modal = useModal();
  const deleteModal = useModal();
  const [editingChurch, setEditingChurch] = useState<Church | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { viewMode, setViewMode } = useViewMode({
    storageKey: "churches-view-mode",
  });
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const filteredChurches = useMemo(() => {
    return churches.filter((church) => {
      const matchesSearch =
        searchTerm === "" ||
        church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [churches, searchTerm]);

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
    modal.open();
  }

  function handleCloseModal() {
    modal.close();
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
      update(editingChurch.id, formData);
    } else {
      create(formData);
    }

    handleCloseModal();
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id);
    deleteModal.open();
  }

  function handleDeleteConfirm() {
    if (deletingId) {
      remove(deletingId);
      setDeletingId(null);
    }
  }

  const hasFilters = searchTerm !== "";

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredChurches.map((church) => (
        <ChurchCard
          key={church.id}
          church={church}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          isUpdating={false}
          isDeleting={false}
        />
      ))}
    </div>
  );

  const listViewRows = filteredChurches.map((church) => (
    <TableRow key={church.id}>
      <TableCell>
        <span className="font-medium">{church.name}</span>
      </TableCell>
      <TableCell>{church.address ?? "-"}</TableCell>
      <TableCell>{church.phone ?? "-"}</TableCell>
      <TableCell>{church.email ?? "-"}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(church)}
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(church.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ));

  return (
    <>
      <CrudPageLayout
        title="Igrejas"
        description="Gerencie as igrejas cadastradas no sistema"
        createButtonLabel="Nova Igreja"
        onCreateClick={() => handleOpenModal()}
        hasFilters={hasFilters}
        isEmpty={filteredChurches.length === 0}
        emptyTitle={
          hasFilters ? "Nenhuma igreja encontrada" : "Nenhuma igreja cadastrada"
        }
        emptyDescription={
          hasFilters
            ? "Tente ajustar os filtros para encontrar igrejas"
            : "Comece adicionando uma nova igreja"
        }
        createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
        filters={
          <CrudFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nome, endereço, email ou telefone..."
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        }
        content={
          <CrudView
            viewMode={viewMode}
            gridView={gridView}
            listView={{
              headers: ["Nome", "Endereço", "Telefone", "Email", "Ações"],
              rows: listViewRows,
            }}
          />
        }
      />

      <Modal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        title={editingChurch ? "Editar Igreja" : "Nova Igreja"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome da Igreja *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        title="Excluir Igreja"
        message="Tem certeza que deseja excluir esta igreja? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
}
