'use client'

import { useState, useEffect } from 'react'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useModules, useStudentModuleAccess, useUpdateStudentModuleAccess } from '@/hooks/use-api'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/layout/empty-state'
import { UserForm } from '@/components/users/user-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Users, MoreHorizontal, Pencil, Trash2, KeyRound } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import type { User } from '@/types'

export default function AdminStudentsPage() {
  const { data: users, isLoading } = useUsers()
  const { data: modules } = useModules()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const updateModuleAccess = useUpdateStudentModuleAccess()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null)

  const { data: moduleAccessData } = useStudentModuleAccess(userToEdit?.id ?? '')
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([])

  const students = users?.filter(u => u.role === 'STUDENT') || []

  useEffect(() => {
    if (userToEdit) {
      setEditName(userToEdit.name)
      setEditEmail(userToEdit.email)
      setEditPassword('')
    }
  }, [userToEdit])

  useEffect(() => {
    if (moduleAccessData?.moduleIds) {
      setSelectedModuleIds(moduleAccessData.moduleIds)
    }
  }, [moduleAccessData])

  const handleCreate = async (data: Partial<User>) => {
    try {
      await createUser.mutateAsync({ ...data, role: 'STUDENT' } as Omit<User, 'id'>)
      toast.success('Aluno criado com sucesso!')
      setIsCreateOpen(false)
    } catch {
      toast.error('Erro ao criar aluno')
    }
  }

  const handleUpdate = async (data: Partial<User> & { password?: string }) => {
    if (!userToEdit) return
    try {
      await updateUser.mutateAsync({ id: userToEdit.id, data })
      await updateModuleAccess.mutateAsync({ userId: userToEdit.id, moduleIds: selectedModuleIds })
      toast.success('Aluno atualizado com sucesso!')
      setUserToEdit(null)
    } catch {
      toast.error('Erro ao atualizar aluno')
    }
  }

  const toggleModule = (moduleId: string, checked: boolean) => {
    setSelectedModuleIds((prev) =>
      checked ? [...prev, moduleId] : prev.filter((id) => id !== moduleId)
    )
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    try {
      await deleteUser.mutateAsync(userToDelete.id)
      toast.success('Aluno excluído com sucesso!')
      setUserToDelete(null)
    } catch {
      toast.error('Erro ao excluir aluno')
    }
  }

  const handleResetPassword = async () => {
    if (!userToResetPassword) return
    try {
      await updateUser.mutateAsync({
        id: userToResetPassword.id,
        data: { password: '123456' }
      })
      toast.success('Senha resetada para: 123456')
      setUserToResetPassword(null)
    } catch {
      toast.error('Erro ao resetar senha')
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description="Gerencie os alunos da plataforma"
        action={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Aluno</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo aluno
                </DialogDescription>
              </DialogHeader>
              <UserForm
                onSubmit={handleCreate}
                isLoading={createUser.isPending}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum aluno"
          description="Comece adicionando seu primeiro aluno"
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Aluno
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Ativo</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setUserToEdit(student)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setUserToResetPassword(student)}>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Resetar Senha
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setUserToDelete(student)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!userToEdit} onOpenChange={() => setUserToEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
            <DialogDescription>
              Atualize os dados do aluno e os módulos liberados
            </DialogDescription>
          </DialogHeader>
          {userToEdit && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const data: Partial<User> & { password?: string } = { name: editName, email: editEmail }
                if (editPassword) data.password = editPassword
                handleUpdate(data)
              }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Nova Senha (deixe em branco para manter)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Nova senha"
                    minLength={6}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Módulos liberados</Label>
                <p className="text-sm text-muted-foreground">
                  Selecione os módulos que este aluno pode acessar. Módulos não marcados aparecerão bloqueados.
                </p>
                <div className="grid gap-2 max-h-48 overflow-y-auto rounded-md border p-3">
                  {modules
                    ?.slice()
                    .sort((a, b) => a.order - b.order)
                    .map((module) => (
                      <div
                        key={module.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`module-${module.id}`}
                          checked={selectedModuleIds.includes(module.id)}
                          onCheckedChange={(checked) =>
                            toggleModule(module.id, checked === true)
                          }
                        />
                        <label
                          htmlFor={`module-${module.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {module.order}. {module.title}
                        </label>
                      </div>
                    ))}
                  {(!modules || modules.length === 0) && (
                    <p className="text-sm text-muted-foreground">Nenhum módulo cadastrado</p>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={updateUser.isPending || updateModuleAccess.isPending}
              >
                {updateUser.isPending || updateModuleAccess.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o aluno &quot;{userToDelete?.name}&quot;?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={!!userToResetPassword} onOpenChange={() => setUserToResetPassword(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar Senha</AlertDialogTitle>
            <AlertDialogDescription>
              A senha do aluno &quot;{userToResetPassword?.name}&quot; será resetada para &quot;123456&quot;.
              O aluno deverá alterar a senha no próximo login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>
              Resetar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
