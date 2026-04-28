'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { usePlatformConfig, useUpdatePlatformConfig } from '@/hooks/use-api'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const { data, isLoading } = usePlatformConfig()
  const updatePlatformConfig = useUpdatePlatformConfig()

  const handleToggle = async (checked: boolean) => {
    try {
      await updatePlatformConfig.mutateAsync({ disableStudentPassword: checked })
      toast.success('Configuração salva com sucesso')
    } catch {
      toast.error('Erro ao salvar configuração')
    }
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
        title="Configurações"
        description="Gerencie comportamentos globais da plataforma"
      />

      <Card>
        <CardHeader>
          <CardTitle>Login de alunos</CardTitle>
          <CardDescription>
            Quando ativado, alunos entram com qualquer senha. Não afeta contas de admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="disable-student-password">Desabilitar senha dos alunos</Label>
              <p className="text-sm text-muted-foreground">
                Use somente para cenários temporários de suporte ou treinamento.
              </p>
            </div>
            <Switch
              id="disable-student-password"
              checked={data?.disableStudentPassword ?? false}
              disabled={updatePlatformConfig.isPending}
              onCheckedChange={handleToggle}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
