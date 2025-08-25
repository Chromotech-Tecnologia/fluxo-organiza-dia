
// Enhanced CEP service with security improvements
const CEP_API_URL = 'https://viacep.com.br/ws';

export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

// Validate CEP format
const isValidCepFormat = (cep: string): boolean => {
  const cepRegex = /^\d{5}-?\d{3}$/;
  return cepRegex.test(cep);
};

// Sanitize CEP input
const sanitizeCep = (cep: string): string => {
  return cep.replace(/\D/g, '');
};

export async function fetchCepData(cep: string): Promise<CepData | null> {
  try {
    // Sanitize and validate input
    const cleanCep = sanitizeCep(cep);
    
    if (!isValidCepFormat(cleanCep)) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    // Ensure HTTPS URL - validate the base URL is HTTPS
    if (!CEP_API_URL.startsWith('https://')) {
      throw new Error('Apenas URLs HTTPS são permitidas');
    }

    const url = `${CEP_API_URL}/${cleanCep}/json/`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Add security headers
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    // Validate response structure
    if (!data.cep || !data.localidade || !data.uf) {
      throw new Error('Resposta inválida da API');
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Erro inesperado ao buscar CEP');
  }
}

export function formatCep(cep: string): string {
  const cleanCep = sanitizeCep(cep);
  
  if (cleanCep.length !== 8) {
    return cep;
  }
  
  return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
}

// Export service object for compatibility
export const cepService = {
  fetchAddress: fetchCepData,
  formatCep
};
