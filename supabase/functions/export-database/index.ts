import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import * as XLSX from 'https://cdn.skypack.dev/xlsx@0.18.5';
import { corsHeaders } from '../_shared/cors.ts';

// Tipos para o request
interface ExportRequest {
  format: 'sql' | 'excel' | 'csv';
}

// Configuração das tabelas para exportação completa
const EXPORT_TABLES = [
  {
    table: 'profiles',
    name: 'Usuários',
    fields: ['id', 'name', 'email', 'welcome_shown', 'created_at', 'updated_at']
  },
  {
    table: 'people', 
    name: 'Pessoas',
    fields: ['id', 'name', 'role', 'phone', 'email', 'department', 'active', 'notes', 'created_at', 'updated_at']
  },
  {
    table: 'team_members',
    name: 'Membros da Equipe',
    fields: ['id', 'name', 'email', 'phone', 'role', 'department', 'status', 'hire_date', 'notes', 'created_at', 'updated_at']
  },
  {
    table: 'tasks',
    name: 'Tarefas',
    fields: ['id', 'title', 'description', 'type', 'priority', 'time_investment', 'category', 'status', 'scheduled_date', 'is_concluded', 'concluded_at', 'is_routine', 'is_forwarded', 'forward_count', 'observations', 'created_at', 'updated_at']
  },
  {
    table: 'skills',
    name: 'Habilidades',
    fields: ['id', 'name', 'description', 'category', 'level', 'created_at', 'updated_at']
  },
  {
    table: 'daily_reports',
    name: 'Relatórios Diários',
    fields: ['id', 'date', 'total_tasks', 'completed_tasks', 'pending_tasks', 'forwarded_tasks', 'completion_rate', 'observations', 'created_at', 'updated_at']
  },
  {
    table: 'user_roles',
    name: 'Funções do Usuário',
    fields: ['id', 'role', 'trial_expires_at', 'is_permanent', 'created_at', 'updated_at']
  }
];

// Mapeamento de nomes de campos para português
const FIELD_NAMES: Record<string, string> = {
  id: 'ID',
  name: 'Nome',
  email: 'Email',
  welcome_shown: 'Boas-vindas Exibidas',
  created_at: 'Data de Criação',
  updated_at: 'Última Atualização',
  role: 'Função',
  phone: 'Telefone',
  department: 'Departamento',
  active: 'Ativo',
  notes: 'Observações',
  status: 'Status',
  hire_date: 'Data de Contratação',
  title: 'Título',
  description: 'Descrição',
  type: 'Tipo',
  priority: 'Prioridade',
  time_investment: 'Tempo Estimado',
  category: 'Categoria',
  scheduled_date: 'Data Agendada',
  is_concluded: 'Concluída',
  concluded_at: 'Data de Conclusão',
  is_routine: 'É Rotina',
  is_forwarded: 'Reagendada',
  forward_count: 'Qtd. Reagendamentos',
  observations: 'Observações',
  level: 'Nível',
  date: 'Data',
  total_tasks: 'Total de Tarefas',
  completed_tasks: 'Tarefas Concluídas',
  pending_tasks: 'Tarefas Pendentes',
  forwarded_tasks: 'Tarefas Reagendadas',
  completion_rate: 'Taxa de Conclusão',
  trial_expires_at: 'Expiração do Trial',
  is_permanent: 'É Permanente'
};

// Função para formatar valores
function formatValue(value: any): any {
  if (value === null || value === undefined) return '';
  
  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }
  
  if (value instanceof Date || (typeof value === 'string' && value.includes('T') && value.includes('Z'))) {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return value;
    }
  }
  
  return value;
}

// Função para gerar SQL dump
function generateSQL(allData: Record<string, any[]>, userId: string): string {
  let sql = `-- Backup completo do banco de dados\n`;
  sql += `-- Gerado em: ${new Date().toISOString()}\n`;
  sql += `-- Usuário: ${userId}\n\n`;

  for (const tableConfig of EXPORT_TABLES) {
    const data = allData[tableConfig.table] || [];
    
    if (data.length === 0) continue;

    sql += `-- Tabela: ${tableConfig.name} (${tableConfig.table})\n`;
    sql += `-- ${data.length} registro(s)\n\n`;

    // Criar statements INSERT
    for (const row of data) {
      const fields = tableConfig.fields.filter(field => row[field] !== undefined);
      const values = fields.map(field => {
        const value = row[field];
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (value instanceof Date) return `'${value.toISOString()}'`;
        return value;
      });

      sql += `INSERT INTO ${tableConfig.table} (${fields.join(', ')}) VALUES (${values.join(', ')});\n`;
    }
    
    sql += '\n';
  }

  return sql;
}

// Função para gerar Excel
function generateExcel(allData: Record<string, any[]>): Uint8Array {
  const wb = XLSX.utils.book_new();

  for (const tableConfig of EXPORT_TABLES) {
    const data = allData[tableConfig.table] || [];
    
    if (data.length === 0) continue;

    // Preparar dados formatados com cabeçalhos em português
    const formattedData = data.map(item => {
      const row: any = {};
      tableConfig.fields.forEach(field => {
        if (item[field] !== undefined) {
          const headerName = FIELD_NAMES[field] || field;
          row[headerName] = formatValue(item[field]);
        }
      });
      return row;
    });

    // Criar worksheet
    const ws = XLSX.utils.json_to_sheet(formattedData);
    
    // Definir largura das colunas
    const columnWidths = tableConfig.fields.map(field => {
      const headerName = FIELD_NAMES[field] || field;
      return { wch: Math.max(headerName.length, 15) };
    });
    ws['!cols'] = columnWidths;
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, tableConfig.name);
  }

  // Gerar buffer
  const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(excelBuffer);
}

// Função para gerar CSV (múltiplos arquivos em ZIP)
function generateCSVs(allData: Record<string, any[]>): Uint8Array {
  // Por simplicidade, vamos gerar um CSV concatenado
  // Em uma implementação real, você usaria uma biblioteca ZIP
  let csvContent = '';
  
  for (const tableConfig of EXPORT_TABLES) {
    const data = allData[tableConfig.table] || [];
    
    if (data.length === 0) continue;

    csvContent += `\n# ${tableConfig.name}\n`;
    
    // Cabeçalho
    const headers = tableConfig.fields.map(field => FIELD_NAMES[field] || field);
    csvContent += headers.join(',') + '\n';
    
    // Dados
    for (const item of data) {
      const values = tableConfig.fields.map(field => {
        const value = formatValue(item[field]);
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvContent += values.join(',') + '\n';
    }
    
    csvContent += '\n';
  }

  return new TextEncoder().encode(csvContent);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const { format }: ExportRequest = await req.json();

    console.log('Database export request:', { format, userId: user.id });

    // Validar formato
    if (!format || !['sql', 'excel', 'csv'].includes(format)) {
      return new Response(
        JSON.stringify({ error: 'Invalid format. Use: sql, excel, or csv' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Buscar dados de todas as tabelas
    const allData: Record<string, any[]> = {};
    let totalRecords = 0;

    for (const tableConfig of EXPORT_TABLES) {
      try {
        const { data, error } = await supabase
          .from(tableConfig.table)
          .select(tableConfig.fields.join(', '))
          .eq('user_id', user.id);

        if (error) {
          console.error(`Error fetching ${tableConfig.table}:`, error);
          allData[tableConfig.table] = [];
        } else {
          allData[tableConfig.table] = data || [];
          totalRecords += (data || []).length;
        }
      } catch (error) {
        console.error(`Error processing ${tableConfig.table}:`, error);
        allData[tableConfig.table] = [];
      }
    }

    console.log(`Total records to export: ${totalRecords}`);

    // Gerar arquivo baseado no formato
    let fileData: Uint8Array;
    let filename: string;
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'sql':
        const sqlContent = generateSQL(allData, user.id);
        fileData = new TextEncoder().encode(sqlContent);
        filename = `database_backup_${timestamp}.sql`;
        break;
        
      case 'excel':
        fileData = generateExcel(allData);
        filename = `database_backup_${timestamp}.xlsx`;
        break;
        
      case 'csv':
        fileData = generateCSVs(allData);
        filename = `database_backup_${timestamp}.csv`;
        break;
        
      default:
        throw new Error('Invalid format');
    }

    return new Response(
      JSON.stringify({
        fileData: Array.from(fileData),
        filename: filename,
        recordCount: totalRecords,
        format: format
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Database export error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});