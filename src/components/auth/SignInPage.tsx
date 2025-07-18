import { SignIn } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sistema de Controle de Tarefas</CardTitle>
            <CardDescription>
              Faça login para acessar seu painel de tarefas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0",
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}