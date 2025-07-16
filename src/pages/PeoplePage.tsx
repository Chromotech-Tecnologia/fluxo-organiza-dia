import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Mail, Phone } from "lucide-react";

const PeoplePage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pessoas</h1>
          <p className="text-muted-foreground">
            Gerencie funcionários e parceiros
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Pessoa
        </Button>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar pessoas por nome, função ou contato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pessoas */}
      <div className="grid gap-4">
        {/* Placeholder para pessoas */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma pessoa cadastrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Adicione funcionários e parceiros para delegar tarefas
              </p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Primeira Pessoa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PeoplePage;