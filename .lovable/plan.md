

## Análise dos 3 Problemas

### 1. Menu lateral não mostra cor quando selecionado
**Causa raiz:** O `SidebarMenuButton` do shadcn tem uma prop `isActive` que seta `data-active=true` e aplica os estilos `data-[active=true]:bg-sidebar-accent`. Mas no `AppSidebar`, estamos usando `NavLink` com `className` dinâmico, porém o `isActive` do react-router não está sendo passado para o `SidebarMenuButton`.

**Solução:** Mudar a abordagem - em vez de usar `className` function do NavLink, usar uma renderização que detecta a rota ativa via `useLocation` e passa a prop `isActive` correta para o `SidebarMenuButton`, aplicando também as classes de estilo customizadas.

### 2. Navegação de data (ontem/amanhã) no desktop com "Hoje" centralizado
**Problema:** No mobile já existe a navegação com setas (ChevronLeft/Right) e o label da data centralizado. No desktop, o `renderDateFilters()` mostra botões Ontem/Hoje/Amanhã lado a lado, sem a navegação com setas.

**Solução:** Criar uma nova estrutura de navegação de data para ambos (mobile e desktop):
- Layout: `[<] [Ontem] [HOJE] [Amanhã] [>]`
- Botão "Hoje" sempre centralizado e destacado
- Setas para navegar mais dias
- O "Hoje" funciona como reset rápido para a data atual

### 3. Editar tag no checklist
**Status:** Já funciona! Analisando o código do `InteractiveSubItemList.tsx`, quando um item está em modo de edição (`isEditing`), o `SubjectPicker` é exibido (linhas 206-214), permitindo alterar a tag. O usuário precisa clicar no ícone de lápis (Pencil) para entrar no modo de edição.

---

## Plano de Implementação

### Tarefa 1: Corrigir menu lateral (AppSidebar.tsx)

Refatorar `renderMenuItems` para:
1. Usar `useLocation` para detectar a rota ativa
2. Passar `isActive={true}` para `SidebarMenuButton` quando a rota está ativa
3. Manter as classes de gradiente verde customizadas no item ativo

```typescript
const renderMenuItems = (items: typeof menuItems) =>
  items.map(item => {
    const isActive = item.url === '/' 
      ? location.pathname === '/' 
      : location.pathname.startsWith(item.url);
    
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton 
          asChild 
          size={isMobile ? "lg" : "default"}
          isActive={isActive}
          className={isActive ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 text-foreground font-medium border-l-2 border-primary rounded-l-none" : ""}
        >
          <NavLink to={item.url} onClick={handleNavClick}>
            <item.icon className="h-5 w-5 md:h-4 md:w-4 mr-2 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  });
```

### Tarefa 2: Navegação de data com "Hoje" centralizado (TaskFiltersHorizontal.tsx)

Criar nova função `renderDateNavigation()` para mobile e desktop:

```
[◀] [Ontem] [HOJE] [Amanhã] [▶]
```

- Setas nas pontas para navegar ±1 dia
- "Hoje" no centro com destaque (variant="default" quando é hoje)
- Ontem/Amanhã com variant outline/default conforme selecionado
- Funciona igual no mobile e desktop

### Tarefa 3: Sobre edição de tag no checklist

Não precisa alteração - já funciona via ícone de edição (lápis). Se desejar tornar mais visível, podemos adicionar um tooltip ou destacar o ícone.

