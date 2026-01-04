import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TableRow, TableCell } from "@/components/ui/Table";
import { useModal } from "@/hooks/useModal";
import { useCrud } from "@/hooks/useCrud";
import { useViewMode } from "@/hooks/useViewMode";
import { CrudPageLayout } from "@/components/crud/CrudPageLayout";
import { CrudFilters } from "@/components/crud/CrudFilters";
import { CrudView } from "@/components/crud/CrudView";
import { Person, Ministry, Team } from "@/types";
import { ServoCard } from "./people/components/ServoCard";
import { UserIcon, EditIcon, TrashIcon } from "@/components/icons";
import { formatDate } from "@/lib/utils";

const MOCK_MINISTRIES: Ministry[] = [
  {
    id: "1",
    name: "Time Boas-Vindas",
    churchId: "1",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Louvor",
    churchId: "1",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_TEAMS: Team[] = [
  {
    id: "1",
    name: "Equipe Manhã",
    description: "Equipe responsável pelo culto da manhã",
    ministryId: "1",
    memberIds: ["1", "2"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Equipe Noite",
    description: "Equipe responsável pelo culto da noite",
    ministryId: "1",
    memberIds: ["3"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Equipe Louvor",
    description: "Equipe de música e adoração",
    ministryId: "2",
    memberIds: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_PEOPLE: Person[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@example.com",
    phone: "(11) 99999-9999",
    birthDate: "1990-01-15",
    ministryId: "1",
    teamId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@example.com",
    phone: "(11) 88888-8888",
    birthDate: "1985-05-20",
    ministryId: "1",
    teamId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    email: "pedro@example.com",
    phone: "(11) 77777-7777",
    birthDate: "1992-03-10",
    ministryId: "1",
    teamId: "2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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

export default function PeoplePage() {
  const {
    items: people,
    create,
    update,
    remove,
  } = useCrud<Person>({
    initialItems: MOCK_PEOPLE,
  });
  const [ministries] = useState<Ministry[]>(MOCK_MINISTRIES);
  const [teams] = useState<Team[]>(MOCK_TEAMS);
  const modal = useModal();
  const deleteModal = useModal();
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMinistry, setFilterMinistry] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const { viewMode, setViewMode } = useViewMode({
    storageKey: "servos-view-mode",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    notes: "",
    ministryId: "",
    teamId: "",
  });

  const availableTeams = useMemo(() => {
    if (filterMinistry === "all") {
      return teams.filter((t) => t.isActive);
    }
    return teams.filter((t) => t.ministryId === filterMinistry && t.isActive);
  }, [filterMinistry, teams]);

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      const matchesSearch =
        searchTerm === "" ||
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMinistry =
        filterMinistry === "all" || person.ministryId === filterMinistry;

      const matchesTeam = filterTeam === "all" || person.teamId === filterTeam;

      return matchesSearch && matchesMinistry && matchesTeam;
    });
  }, [people, searchTerm, filterMinistry, filterTeam]);

  function getMinistry(ministryId?: string) {
    if (!ministryId) return undefined;
    return ministries.find((m) => m.id === ministryId);
  }

  function getTeam(teamId?: string) {
    if (!teamId) return undefined;
    return teams.find((t) => t.id === teamId);
  }

  function handleOpenModal(person?: Person) {
    if (person) {
      setEditingPerson(person);
      setFormData({
        name: person.name,
        email: person.email ?? "",
        phone: person.phone ?? "",
        birthDate: person.birthDate ?? "",
        address: person.address ?? "",
        notes: person.notes ?? "",
        ministryId: person.ministryId ?? "",
        teamId: person.teamId ?? "",
      });
    } else {
      setEditingPerson(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        birthDate: "",
        address: "",
        notes: "",
        ministryId: "",
        teamId: "",
      });
    }
    modal.open();
  }

  function handleCloseModal() {
    modal.close();
    setEditingPerson(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      address: "",
      notes: "",
      ministryId: "",
      teamId: "",
    });
  }

  function handleMinistryChange(ministryId: string) {
    setFormData({
      ...formData,
      ministryId,
      teamId: "",
    });
  }

  function handleFilterMinistryChange(value: string) {
    setFilterMinistry(value);
    if (value === "all") {
      setFilterTeam("all");
    } else {
      setFilterTeam("all");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingPerson) {
      update(editingPerson.id, formData);
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

  const hasFilters =
    searchTerm !== "" || filterMinistry !== "all" || filterTeam !== "all";

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredPeople.map((person) => (
        <ServoCard
          key={person.id}
          person={person}
          ministry={getMinistry(person.ministryId)}
          team={getTeam(person.teamId)}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          isUpdating={false}
          isDeleting={false}
        />
      ))}
    </div>
  );

  const listViewRows = filteredPeople.map((person) => (
    <TableRow key={person.id}>
      <TableCell>
        <span className="font-medium">{person.name}</span>
      </TableCell>
      <TableCell>{person.email ?? "-"}</TableCell>
      <TableCell>{person.phone ?? "-"}</TableCell>
      <TableCell>{getMinistry(person.ministryId)?.name ?? "-"}</TableCell>
      <TableCell>{getTeam(person.teamId)?.name ?? "-"}</TableCell>
      <TableCell>
        {person.birthDate ? formatDate(person.birthDate) : "-"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(person)}
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(person.id)}
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
        title="Servos"
        description="Gerencie servos do Time Boas-Vindas"
        icon={<UserIcon className="h-8 w-8 text-primary-400" />}
        createButtonLabel="Adicionar Servo"
        onCreateClick={() => handleOpenModal()}
        hasFilters={hasFilters}
        isEmpty={filteredPeople.length === 0}
        emptyTitle={
          hasFilters ? "Nenhum servo encontrado" : "Nenhum servo cadastrado"
        }
        emptyDescription={
          hasFilters
            ? "Tente ajustar os filtros para encontrar servos"
            : "Comece adicionando um novo servo"
        }
        createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
        filters={
          <CrudFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nome, email ou telefone..."
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filters={[
              {
                value: filterMinistry,
                onChange: handleFilterMinistryChange,
                options: [
                  { value: "all", label: "Todos os times" },
                  ...ministries
                    .filter((m) => m.isActive)
                    .map((m) => ({ value: m.id, label: m.name })),
                ],
              },
              {
                value: filterTeam,
                onChange: setFilterTeam,
                disabled: filterMinistry === "all",
                options: [
                  { value: "all", label: "Todas as equipes" },
                  ...availableTeams.map((t) => ({
                    value: t.id,
                    label: t.name,
                  })),
                ],
              },
            ]}
          />
        }
        content={
          <CrudView
            viewMode={viewMode}
            gridView={gridView}
            listView={{
              headers: [
                "Nome",
                "Email",
                "Telefone",
                "Time",
                "Equipe",
                "Data de Nascimento",
                "Ações",
              ],
              rows: listViewRows,
            }}
          />
        }
      />

      <Modal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        title={editingPerson ? "Editar Servo" : "Novo Servo"}
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
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Input
              label="Telefone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Time"
              value={formData.ministryId}
              onChange={(e) => handleMinistryChange(e.target.value)}
              options={[
                { value: "", label: "Selecione um time" },
                ...ministries
                  .filter((m) => m.isActive)
                  .map((m) => ({ value: m.id, label: m.name })),
              ]}
            />
            <Select
              label="Equipe"
              value={formData.teamId}
              onChange={(e) =>
                setFormData({ ...formData, teamId: e.target.value })
              }
              disabled={!formData.ministryId}
              options={[
                {
                  value: "",
                  label: formData.ministryId
                    ? "Selecione uma equipe"
                    : "Selecione um time primeiro",
                },
                ...teams
                  .filter(
                    (t) => t.ministryId === formData.ministryId && t.isActive
                  )
                  .map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
          </div>
          <Input
            label="Data de Nascimento"
            type="date"
            value={formData.birthDate}
            onChange={(e) =>
              setFormData({ ...formData, birthDate: e.target.value })
            }
          />
          <Input
            label="Endereço"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
          <Textarea
            label="Observações"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Observações sobre o servo..."
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingPerson ? "Salvar Alterações" : "Adicionar Servo"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        title="Excluir Servo"
        message="Tem certeza que deseja excluir este servo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
}
