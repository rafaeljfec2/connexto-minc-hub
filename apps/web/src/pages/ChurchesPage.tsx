import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageWithCrud } from "@/components/pages/PageWithCrud";
import { useModal } from "@/hooks/useModal";
import { useCrud } from "@/hooks/useCrud";
import { Church } from "@/types";

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
  const { items: churches, create, update, remove } = useCrud<Church>({
    initialItems: MOCK_CHURCHES,
  });
  const modal = useModal();
  const deleteModal = useModal();
  const [editingChurch, setEditingChurch] = useState<Church | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

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

  const columns = [
    {
      key: "name",
      label: "Nome",
      render: (church: Church) => (
        <span className="font-medium">{church.name}</span>
      ),
    },
    {
      key: "address",
      label: "Endereço",
      render: (church: Church) => church.address ?? "-",
    },
    {
      key: "phone",
      label: "Telefone",
      render: (church: Church) => church.phone ?? "-",
    },
    {
      key: "email",
      label: "Email",
      render: (church: Church) => church.email ?? "-",
    },
  ];

  return (
    <>
      <PageWithCrud
        title="Igrejas"
        description="Gerencie as igrejas cadastradas no sistema"
        createButtonLabel="Nova Igreja"
        items={churches}
        searchFields={["name", "address", "email", "phone"]}
        searchPlaceholder="Buscar por nome, endereço, email ou telefone..."
        emptyMessage="Nenhuma igreja cadastrada"
        emptySearchMessage="Nenhuma igreja encontrada"
        tableContent={(paginatedItems) => (
          <DataTable
            data={paginatedItems}
            columns={columns}
            hasSearch={false}
            actions={(church) => (
              <>
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
                  onClick={() => handleDeleteClick(church.id)}
                >
                  Excluir
                </Button>
              </>
            )}
          />
        )}
        onCreateClick={() => handleOpenModal()}
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
