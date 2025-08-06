import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { SupabaseMigration } from '@/lib/supabase-migration';
import { toast } from '@/hooks/use-toast';

export const MigrationButton = () => {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [migrationStats, setMigrationStats] = useState<any>(null);

  const handleMigration = async () => {
    setMigrationStatus('migrating');
    
    try {
      const result = await SupabaseMigration.migrateAllData();
      
      if (result.success) {
        setMigrationStatus('success');
        const stats = await SupabaseMigration.checkMigrationStatus();
        setMigrationStats(stats);
        
        toast({
          title: "Migração Concluída",
          description: "Todos os dados foram migrados para o Supabase com sucesso!"
        });
      } else {
        setMigrationStatus('error');
        toast({
          title: "Erro na Migração",
          description: "Ocorreu um erro durante a migração. Verifique o console para mais detalhes.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setMigrationStatus('error');
      console.error('Erro na migração:', error);
      toast({
        title: "Erro na Migração",
        description: "Erro inesperado durante a migração.",
        variant: "destructive"
      });
    }
  };

  const checkStatus = async () => {
    const stats = await SupabaseMigration.checkMigrationStatus();
    setMigrationStats(stats);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Migração para Supabase
        </CardTitle>
        <CardDescription>
          Migre seus dados do localStorage para o banco de dados Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {migrationStats && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Status dos Dados:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p>Tarefas no LocalStorage: {migrationStats.tasksInLocalStorage}</p>
                <p>Pessoas no LocalStorage: {migrationStats.peopleInLocalStorage}</p>
              </div>
              <div>
                <p>Tarefas no Supabase: {migrationStats.tasksInSupabase}</p>
                <p>Pessoas no Supabase: {migrationStats.peopleInSupabase}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleMigration}
            disabled={migrationStatus === 'migrating'}
            className="flex items-center gap-2"
          >
            {migrationStatus === 'migrating' ? (
              <>
                <Upload className="h-4 w-4 animate-spin" />
                Migrando...
              </>
            ) : migrationStatus === 'success' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Migração Concluída
              </>
            ) : migrationStatus === 'error' ? (
              <>
                <AlertCircle className="h-4 w-4" />
                Tentar Novamente
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Migrar Dados
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={checkStatus}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Verificar Status
          </Button>
        </div>

        {migrationStatus === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <p className="font-medium">Migração realizada com sucesso!</p>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Todos os dados foram transferidos para o Supabase. O sistema agora usará o banco de dados em nuvem.
            </p>
          </div>
        )}

        {migrationStatus === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <p className="font-medium">Erro na migração</p>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Verifique a conexão com o Supabase e tente novamente.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};