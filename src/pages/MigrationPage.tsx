import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MigrationButton } from "@/components/migration/MigrationButton";

const MigrationPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Migração de Dados</h1>
        <p className="text-muted-foreground">
          Migre seus dados do localStorage para o banco de dados Supabase
        </p>
      </div>

      <div className="flex justify-center">
        <MigrationButton />
      </div>
    </div>
  );
};

export default MigrationPage;