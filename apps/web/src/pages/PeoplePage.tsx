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
import { Person, Ministry, Team, User, UserRole } from "@minc-hub/shared/types";
import { ServoCard } from "./people/components/ServoCard";
import { CreateUserForm } from "./people/components/CreateUserForm";
import { UserIcon, EditIcon, TrashIcon, PlusIcon } from "@/components/icons";
import { formatDate } from "@minc-hub/shared/utils";
import { MOCK_MINISTRIES, MOCK_TEAMS, MOCK_PEOPLE, MOCK_USERS } from "@/lib/mockData";

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
  const {
    items: users,
    create: createUser,
  } = useCrud<User>({
    initialItems: MOCK_USERS,
  });
  // Modals
  const personModal = useModal();
  const deleteModal = useModal();
  const createUserModal = useModal();

  // Person form state
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [personFormData, setPersonFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    notes: "",
    ministryId: "",
    teamId: "",
  });

  // User creation state
  const [creatingUserForPerson, setCreatingUserForPerson] = useState<Person | null>(null);
  const [userFormData, setUserFormData] = useState({
    email: "",
    password: "",
    role: UserRole.SERVO,
  });

  // Filters and search
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMinistry, setFilterMinistry] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const { viewMode, setViewMode } = useViewMode({
    storageKey: "servos-view-mode",
    defaultMode: 'grid',
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

  const initialPersonFormData = {
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    notes: "",
    ministryId: "",
    teamId: "",
  };

  function handleOpenPersonModal(person?: Person) {
    if (person) {
      setEditingPerson(person);
      setPersonFormData({
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
      setPersonFormData(initialPersonFormData);
    }
    personModal.open();
  }

  function handleClosePersonModal() {
    personModal.close();
    setEditingPerson(null);
    setPersonFormData(initialPersonFormData);
  }

  function handlePersonMinistryChange(ministryId: string) {
    setPersonFormData({
      ...personFormData,
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

  function handlePersonSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingPerson) {
      update(editingPerson.id, personFormData);
    } else {
      create(personFormData);
    }

    handleClosePersonModal();
  }

  async function handleSavePersonAndCreateUser(e: React.FormEvent) {
    e.preventDefault();

    let savedPerson: Person | null = null;

    if (editingPerson) {
      await update(editingPerson.id, personFormData);
      savedPerson = { ...editingPerson, ...personFormData };
    } else {
      const newId = `person-${Date.now()}`;
      savedPerson = {
        ...personFormData,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await create(savedPerson);
    }

    handleClosePersonModal();

    if (savedPerson) {
      setTimeout(() => {
        handleOpenCreateUserModal(savedPerson!);
      }, 200);
    }
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

  const initialUserFormData = {
    email: "",
    password: "",
    role: UserRole.SERVO,
  };

  function handleOpenCreateUserModal(person: Person) {
    setCreatingUserForPerson(person);
    setUserFormData({
      email: person.email ?? "",
      password: "",
      role: UserRole.SERVO,
    });
    createUserModal.open();
  }

  function handleCloseCreateUserModal() {
    createUserModal.close();
    setCreatingUserForPerson(null);
    setUserFormData(initialUserFormData);
  }

  function handleCreateUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!creatingUserForPerson) return;

    createUser({
      name: creatingUserForPerson.name,
      email: userFormData.email,
      role: userFormData.role,
      personId: creatingUserForPerson.id,
    });

    handleCloseCreateUserModal();
  }

  function hasUser(personId: string): boolean {
    return users.some((user) => user.personId === personId);
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
          onEdit={handleOpenPersonModal}
          onDelete={handleDeleteClick}
          onCreateUser={handleOpenCreateUserModal}
          hasUser={hasUser(person.id)}
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
            onClick={() => handleOpenPersonModal(person)}
            title="Editar"
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          {!hasUser(person.id) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenCreateUserModal(person)}
              title="Criar usuário para este servo"
            >
              <UserIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(person.id)}
            title="Excluir"
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
        onCreateClick={() => handleOpenPersonModal()}
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
        isOpen={personModal.isOpen}
        onClose={handleClosePersonModal}
        title={editingPerson ? "Editar Servo" : "Novo Servo"}
        size="lg"
      >
        <form onSubmit={handlePersonSubmit} className="space-y-4">
          <Input
            label="Nome *"
            value={personFormData.name}
            onChange={(e) => setPersonFormData({ ...personFormData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={personFormData.email}
              onChange={(e) =>
                setPersonFormData({ ...personFormData, email: e.target.value })
              }
            />
            <Input
              label="Telefone"
              value={personFormData.phone}
              onChange={(e) =>
                setPersonFormData({ ...personFormData, phone: e.target.value })
              }
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Time"
              value={personFormData.ministryId}
              onChange={(e) => handlePersonMinistryChange(e.target.value)}
              options={[
                { value: "", label: "Selecione um time" },
                ...ministries
                  .filter((m) => m.isActive)
                  .map((m) => ({ value: m.id, label: m.name })),
              ]}
            />
            <Select
              label="Equipe"
              value={personFormData.teamId}
              onChange={(e) =>
                setPersonFormData({ ...personFormData, teamId: e.target.value })
              }
              disabled={!personFormData.ministryId}
              options={[
                {
                  value: "",
                  label: personFormData.ministryId
                    ? "Selecione uma equipe"
                    : "Selecione um time primeiro",
                },
                ...teams
                  .filter(
                    (t) => t.ministryId === personFormData.ministryId && t.isActive
                  )
                  .map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
          </div>
          <Input
            label="Data de Nascimento"
            type="date"
            value={personFormData.birthDate}
            onChange={(e) =>
              setPersonFormData({ ...personFormData, birthDate: e.target.value })
            }
          />
          <Input
            label="Endereço"
            value={personFormData.address}
            onChange={(e) =>
              setPersonFormData({ ...personFormData, address: e.target.value })
            }
          />
          <Textarea
            label="Observações"
            value={personFormData.notes}
            onChange={(e) =>
              setPersonFormData({ ...personFormData, notes: e.target.value })
            }
            placeholder="Observações sobre o servo..."
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClosePersonModal}
            >
              Cancelar
            </Button>
            {!editingPerson && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSavePersonAndCreateUser}
                className="flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4" />
                Salvar e Criar Usuário
              </Button>
            )}
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

      <Modal
        isOpen={createUserModal.isOpen}
        onClose={handleCloseCreateUserModal}
        title="Criar Usuário para Servo"
        size="md"
      >
        {creatingUserForPerson && (
          <CreateUserForm
            person={creatingUserForPerson}
            email={userFormData.email}
            password={userFormData.password}
            role={userFormData.role}
            onEmailChange={(email) => setUserFormData({ ...userFormData, email })}
            onPasswordChange={(password) => setUserFormData({ ...userFormData, password })}
            onRoleChange={(role) => setUserFormData({ ...userFormData, role })}
            onSubmit={handleCreateUserSubmit}
            onCancel={handleCloseCreateUserModal}
          />
        )}
      </Modal>
    </>
  );
}
