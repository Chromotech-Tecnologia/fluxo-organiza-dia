import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Lock, Mail, Save, Eye, EyeOff } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user } = useAuthStore();
  const { profile, loading, updating, updateProfile, updatePassword } = useProfile();
  
  // Estados para formulário de perfil
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  
  // Estados para formulário de senha
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Inicializar formulário quando o perfil carregar
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!profileForm.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    const success = await updateProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim()
    });

    if (success) {
      // Formulário já foi atualizado via useProfile
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.newPassword) {
      toast.error('Nova senha é obrigatória');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Confirmação de senha não confere');
      return;
    }

    const success = await updatePassword(passwordForm.newPassword);
    
    if (success) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações de Perfil</h1>
            <p className="text-muted-foreground">
              Personalize o sistema conforme suas necessidades
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando configurações...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações de Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie sua conta e preferências do sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações do Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Informações da Conta</Label>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>ID: {user?.id}</p>
                  <p>Criado em: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                  <p>Última atualização: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full gap-2"
                disabled={updating}
              >
                <Save className="h-4 w-4" />
                {updating ? 'Salvando...' : 'Salvar Perfil'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Digite a nova senha"
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a nova senha"
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>• A senha deve ter pelo menos 6 caracteres</p>
                <p>• Recomendamos usar uma combinação de letras, números e símbolos</p>
              </div>
              
              <Button 
                type="submit" 
                variant="outline" 
                className="w-full gap-2"
                disabled={updating}
              >
                <Lock className="h-4 w-4" />
                {updating ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="font-medium">Versão do Sistema</Label>
              <p className="text-muted-foreground">v1.0.0</p>
            </div>
            <div>
              <Label className="font-medium">Último Login</Label>
              <p className="text-muted-foreground">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('pt-BR') : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="font-medium">Status da Conta</Label>
              <p className="text-green-600 font-medium">Ativa</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;