import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { corsHeaders } from '../_shared/cors.ts';

interface ExportRequest {
  table: string;
  fields: string[];
  startDate?: string;
  endDate?: string;
}

// Função para formatar valores
function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  
  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }
  
  if (value instanceof Date || (typeof value === 'string' && value.includes('T') && value.includes('Z'))) {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return String(value);
    }
  }
  
  return String(value);
}

// Função para gerar TSV (Tab-Separated Values) que pode ser aberto no Excel
function generateTSV(data: any[], fields: string[]): Uint8Array {
  if (!data || data.length === 0) {
    return new TextEncoder().encode('Nenhum dado encontrado');
  }

  // Mapeamento de nomes de campos para português
  const fieldNames: Record<string, string> = {
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

  // Cabeçalhos em português
  const headers = fields.map(field => fieldNames[field] || field);
  let content = headers.join('\t') + '\n';
  
  // Dados
  for (const item of data) {
    const values = fields.map(field => {
      const value = formatValue(item[field]);
      // Remover tabs e quebras de linha que podem quebrar o formato
      return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
    });
    content += values.join('\t') + '\n';
  }

  return new TextEncoder().encode(content);
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

    console.log('Excel export request:', { table, fields: fields.length, userId: user.id });

    // Validar parâmetros
    if (!table || !fields || fields.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Table and fields are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Construir query
    let query = supabase
      .from(table)
      .select(fields.join(', '))
      .eq('user_id', user.id);

    // Aplicar filtros de data se fornecidos
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Buscar dados
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Database query error:', error);
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Gerar arquivo TSV
    const fileData = generateTSV(data || [], fields);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `export_${table}_${timestamp}.xls`; // .xls extension for Excel compatibility

    console.log(`Export generated: ${filename}, records: ${(data || []).length}`);

    return new Response(
      JSON.stringify({
        fileData: Array.from(fileData),
        filename: filename,
        recordCount: (data || []).length,
        format: 'excel'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Excel export error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});