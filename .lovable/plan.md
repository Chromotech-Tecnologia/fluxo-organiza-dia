
## Análise do Problema

O menu "Tarefas" quando selecionado deveria mostrar uma cor diferente (gradiente verde), mas não está mostrando. Analisando o código:

### Causa Raiz

O `NavLink` do react-router-dom usa a função `getNavClass` que aplica estilos diferentes quando `isActive` é `true`. Os estilos usam `!important` (`!bg-gradient-to-r !from-green-50 !to-emerald-50`), mas o problema é que o `SidebarMenuButton` do shadcn tem estilos base muito específicos que podem estar sobrescrevendo.

O `sidebarMenuButtonVariants` (linha 512-532) aplica estilos como:
- `hover:bg-sidebar-accent`
- `data-[active=true]:bg-sidebar-accent`

E quando usa `asChild` com `Slot`, o `className` é passado para o `NavLink`, mas a ordem de especificidade CSS pode estar causando conflitos.

### Solução

1. **Ajustar a especificidade dos estilos ativos** - Usar classes mais específicas ou garantir que os `!important` realmente sobrescrevam os estilos do sidebar
2. **Usar `data-active` corretamente** - O `SidebarMenuButton` aceita `isActive` prop que seta `data-active=true`, podemos usar isso em conjunto
3. **Refatorar para usar estilos inline ou CSS mais específico** que garantam a aplicação do gradiente

### Plano de Implementação

1. Modificar `getNavClass` para incluir classes que realmente sobrescrevam os estilos do `SidebarMenuButton`:
   - Adicionar `[&]:bg-gradient-to-r [&]:from-green-50 [&]:to-emerald-50` com seletores mais específicos
   - Ou usar `data-[active=true]:` prefixos que o componente já suporta

2. Alternativa mais robusta: passar o estado `isActive` para o `SidebarMenuButton` via prop e estilizar via CSS customizado no componente ou usar uma abordagem híbrida

3. Testar no navegador para confirmar que o estilo está sendo aplicado corretamente

### Mudanças Específicas

**src/components/layout/AppSidebar.tsx:**
- Modificar `getNavClass` para usar classes com maior especificidade
- Considerar adicionar `[&]:` prefix ou usar `!` de forma mais agressiva em todas as propriedades relacionadas ao background
