'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { StudentRegisterData } from '@/types'

export default function NewStudentPage() {
  const { registerStudent } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentRegisterData>()

  const onSubmit = async (data: StudentRegisterData) => {
    setIsRegistering(true)
    try {
      await registerStudent(data)
      toast.success('Cadastro realizado com sucesso!')
    } catch {
      toast.error('Não foi possível cadastrar. Verifique o email informado.')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Curso de Informática</h1>
          <p className="text-muted-foreground mt-1">Cadastro de aluno novo</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Sou aluno novo</CardTitle>
            <CardDescription className="text-center">
              Digite seus dados para criar a conta e entrar automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  {...register('name', {
                    required: 'Nome obrigatório',
                  })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email', {
                    required: 'Email obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isRegistering}>
                {isRegistering ? 'Cadastrando...' : 'Cadastrar'}
              </Button>

              <Button asChild type="button" variant="ghost" className="w-full">
                <Link href="/login">Voltar para login</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
