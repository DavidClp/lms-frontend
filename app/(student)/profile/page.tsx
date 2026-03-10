'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/auth-context'
import { useUpdateUser } from '@/hooks/use-api'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { User, Mail, Lock } from 'lucide-react'

interface ProfileForm {
  name: string
  email: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function StudentProfilePage() {
  const { user, updateUser: updateAuthUser } = useAuth()
  const updateUser = useUpdateUser()
  
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  })

  const passwordForm = useForm<PasswordForm>()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const onProfileSubmit = async (data: ProfileForm) => {
    if (!user) return
    try {
      await updateUser.mutateAsync({ id: user.id, data })
      updateAuthUser(data)
      toast.success('Perfil atualizado com sucesso!')
      setIsEditingProfile(false)
    } catch {
      toast.error('Erro ao atualizar perfil')
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (!user) return
    if (data.newPassword !== data.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }
    try {
      await updateUser.mutateAsync({ 
        id: user.id, 
        data: { password: data.newPassword }
      })
      toast.success('Senha alterada com sucesso!')
      passwordForm.reset()
      setIsChangingPassword(false)
    } catch {
      toast.error('Erro ao alterar senha')
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais"
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-muted-foreground">{user.email}</p>
            <span className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
              Aluno
            </span>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>Atualize seus dados cadastrais</CardDescription>
                </div>
                {!isEditingProfile && (
                  <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingProfile ? (
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      {...profileForm.register('name', { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register('email', { required: true })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={updateUser.isPending}>
                      {updateUser.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Alterar Senha
                  </CardTitle>
                  <CardDescription>Mantenha sua conta segura</CardDescription>
                </div>
                {!isChangingPassword && (
                  <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                    Alterar
                  </Button>
                )}
              </div>
            </CardHeader>
            {isChangingPassword && (
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordForm.register('currentPassword', { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register('newPassword', { required: true, minLength: 6 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register('confirmPassword', { required: true })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={updateUser.isPending}>
                      {updateUser.isPending ? 'Salvando...' : 'Alterar Senha'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsChangingPassword(false)
                        passwordForm.reset()
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
