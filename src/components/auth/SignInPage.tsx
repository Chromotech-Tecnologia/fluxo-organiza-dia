import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sistema de Controle de Tarefas</CardTitle>
            <CardDescription>
              Acesso temporário sem autenticação
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}