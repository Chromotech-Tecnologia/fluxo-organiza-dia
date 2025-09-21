import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import * as XLSX from 'https://cdn.skypack.dev/xlsx@0.18.5';
import { corsHeaders } from '../_shared/cors.ts';

// Tipos para o request
interface ExportRequest {
  table: string;
  fields: string[];
  startDate?: string;
  endDate?: string;
}

// Configuração das tabelas e campos válidos
const TABLE_CONFIGS = {
  profiles: {
    table: 'profiles',
    dateField: 'created_at',
    allowedFields: ['id', 'name', 'email', 'welcome_shown', 'created_at', 'updated_at'],
    displayName: 'Usuários'
  },
  people: {
    table: 'people', 
    dateField: 'created_at',
    allowedFields: ['id', 'name', 'role', 'phone', 'email', 'department', 'active', 'notes', 'created_at', 'updated_at'],
    displayName: 'Pessoas'
  },
  team_members: {
    table: 'team_members',
    dateField: 'created_at', 
    allowedFields: ['id', 'name', 'email', 'phone', 'role', 'department', 'status', 'hire_date', 'notes', 'created_at', 'updated_at'],
    displayName: 'Membros da Equipe'
  },
  tasks: {
    table: 'tasks',
    dateField: 'scheduled_date',
    allowedFields: ['id', 'title', 'description', 'type', 'priority', 'time_investment', 'category', 'status', 'scheduled_date', 'is_concluded', 'concluded_at', 'is_routine', 'is_forwarded', 'forward_count', 'observations', 'created_at', 'updated_at'],
    displayName: 'Tarefas'
  },
  skills: {
    table: 'skills',
    dateField: 'created_at',
    allowedFields: ['id', 'name', 'description', 'category', 'level', 'created_at', 'updated_at'],
    displayName: 'Habilidades'
  }
};

// Mapeamento de nomes de campos para português
const FIELD_NAMES = {
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
  level: 'Nível'
};

// Função para formatar valores para exibição
function formatValue(value: any, fieldType?: string): any {
  if (value === null || value === undefined) return '';
  
  // Formatar booleanos
  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }
  
  // Formatar datas
  if (fieldType === 'date' || value instanceof Date) {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return value;
    }
  }
  
  return value;
}

// Função para gerar Excel
function generateExcel(data: any[], fields: string[], tableName: string): Uint8Array {
  // Preparar cabeçalhos em português
  const headers = fields.map(field => FIELD_NAMES[field as keyof typeof FIELD_NAMES] || field);
  
  // Preparar dados formatados
  const formattedData = data.map(item => {
    const row: any = {};
    fields.forEach((field, index) => {
      const headerName = headers[index];
      row[headerName] = formatValue(item[field], field.includes('date') ? 'date' : undefined);
    });
    return row;
  });

  // Criar workbook
  const ws = XLSX.utils.json_to_sheet(formattedData);
  
  // Definir largura das colunas
  const columnWidths = headers.map(header => ({ wch: Math.max(header.length, 15) }));
  ws['!cols'] = columnWidths;
  
  // Criar workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, tableName);
  
  // Gerar buffer
  const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  
  return new Uint8Array(excelBuffer);
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
    const { table, fields, startDate, endDate }: ExportRequest = await req.json();

    console.log('Export request:', { table, fields, startDate, endDate, userId: user.id });

    // Validar entrada
    if (!table || !fields || fields.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Table and fields are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar tabela
    const tableConfig = TABLE_CONFIGS[table as keyof typeof TABLE_CONFIGS];
    if (!tableConfig) {
      return new Response(
        JSON.stringify({ error: 'Invalid table' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar campos
    const invalidFields = fields.filter(field => !tableConfig.allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return new Response(
        JSON.stringify({ error: `Invalid fields: ${invalidFields.join(', ')}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Construir query
    let query = supabase
      .from(tableConfig.table)
      .select(fields.join(', '))
      .eq('user_id', user.id); // Filtrar por usuário

    // Aplicar filtros de data se fornecidos
    if (startDate && endDate) {
      query = query
        .gte(tableConfig.dateField, startDate)
        .lte(tableConfig.dateField, endDate);
    } else if (startDate) {
      query = query.gte(tableConfig.dateField, startDate);
    } else if (endDate) {
      query = query.lte(tableConfig.dateField, endDate);
    }

    // Executar query
    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Found ${data?.length || 0} records for export`);

    // Gerar arquivo Excel
    const excelBuffer = generateExcel(data || [], fields, tableConfig.displayName);

    // Gerar nome do arquivo
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${tableConfig.displayName}_${timestamp}.xlsx`;

    return new Response(
      JSON.stringify({
        fileData: Array.from(excelBuffer), // Converter para array para JSON
        filename: filename,
        recordCount: data?.length || 0
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});