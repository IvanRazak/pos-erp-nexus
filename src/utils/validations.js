export const validateCPF = (cpf) => {
  if (!cpf) return "CPF é obrigatório";
  
  // Remove non-digits
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) {
    return "CPF deve conter 11 dígitos";
  }

  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return "CPF inválido";
  }

  // Validate CPF algorithm
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return "CPF inválido";

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return "CPF inválido";

  return true;
};

export const validateCNPJ = (cnpj) => {
  if (!cnpj) return "CNPJ é obrigatório";
  
  // Remove non-digits
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) {
    return "CNPJ deve conter 14 dígitos";
  }

  // Check if all digits are the same
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return "CNPJ inválido";
  }

  // Validate CNPJ algorithm
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return "CNPJ inválido";

  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return "CNPJ inválido";

  return true;
};

export const validatePhone = (phone) => {
  if (!phone) return "Telefone é obrigatório";
  
  // Remove non-digits
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length !== 11) {
    return "Telefone deve conter 11 dígitos";
  }

  return true;
};