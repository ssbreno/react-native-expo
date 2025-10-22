/**
 * Validation Schemas using Zod
 * Type-safe validation with automatic type inference
 */

import { z } from 'zod';

/**
 * Custom CPF validator for Zod
 * Validates Brazilian CPF with check digits algorithm
 */
const cpfValidator = (cpf: string) => {
  // Remove non-digit characters
  const cleanCPF = cpf.replace(/\D/g, '');

  // Check length
  if (cleanCPF.length !== 11) return false;

  // Check for repeated digits (invalid CPFs like 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validate CPF using check digits algorithm
  let sum = 0;
  let remainder;

  // First check digit
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  // Second check digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

/**
 * Custom phone validator for Brazilian format
 */
const phoneValidator = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

/**
 * Custom age validator from birth date
 */
const birthDateValidator = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;

  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const dayDiff = today.getDate() - date.getDate();

  let calculatedAge = age;
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    calculatedAge--;
  }

  return calculatedAge >= 18 && calculatedAge <= 120;
};

// ============================================================================
// BASIC SCHEMAS
// ============================================================================

/**
 * Email Schema
 */
export const emailSchema = z
  .string({
    required_error: 'Email é obrigatório',
    invalid_type_error: 'Email deve ser uma string',
  })
  .min(1, 'Email é obrigatório')
  .email('Email inválido');

/**
 * Password Schema
 * Minimum 6 characters as per API requirements
 */
export const passwordSchema = z
  .string({
    required_error: 'Senha é obrigatória',
    invalid_type_error: 'Senha deve ser uma string',
  })
  .min(6, 'Senha deve ter pelo menos 6 caracteres');

/**
 * Strong Password Schema (optional, for enhanced security)
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial');

/**
 * CPF Schema
 * Brazilian ID number with full validation
 */
export const cpfSchema = z
  .string({
    required_error: 'CPF é obrigatório',
    invalid_type_error: 'CPF deve ser uma string',
  })
  .min(1, 'CPF é obrigatório')
  .refine(cpfValidator, {
    message: 'CPF inválido',
  });

/**
 * Phone Schema
 * Brazilian phone format (10-11 digits)
 */
export const phoneSchema = z
  .string({
    required_error: 'Telefone é obrigatório',
    invalid_type_error: 'Telefone deve ser uma string',
  })
  .min(1, 'Telefone é obrigatório')
  .refine(phoneValidator, {
    message: 'Telefone deve ter 10 ou 11 dígitos',
  });

/**
 * ZIP Code Schema (CEP)
 * Brazilian postal code format
 */
export const zipCodeSchema = z
  .string({
    required_error: 'CEP é obrigatório',
    invalid_type_error: 'CEP deve ser uma string',
  })
  .min(1, 'CEP é obrigatório')
  .refine(zip => zip.replace(/\D/g, '').length === 8, {
    message: 'CEP deve conter 8 dígitos',
  });

/**
 * Age Schema
 * Between 18-120 years as per API requirements
 */
export const ageSchema = z
  .number({
    required_error: 'Idade é obrigatória',
    invalid_type_error: 'Idade deve ser um número',
  })
  .int('Idade deve ser um número inteiro')
  .min(18, 'Idade mínima é 18 anos')
  .max(120, 'Idade máxima é 120 anos');

/**
 * Birth Date Schema
 * Must result in age >= 18
 */
export const birthDateSchema = z
  .string({
    required_error: 'Data de nascimento é obrigatória',
    invalid_type_error: 'Data de nascimento deve ser uma string',
  })
  .min(1, 'Data de nascimento é obrigatória')
  .refine(birthDateValidator, {
    message: 'Você deve ter pelo menos 18 anos',
  });

/**
 * Document Type Schema
 */
export const documentTypeSchema = z.enum(['cpf', 'cnpj', 'rg', 'passport'], {
  errorMap: () => ({ message: 'Tipo de documento inválido' }),
});

/**
 * Name Schema
 */
export const nameSchema = z
  .string({
    required_error: 'Nome é obrigatório',
    invalid_type_error: 'Nome deve ser uma string',
  })
  .min(3, 'Nome deve ter pelo menos 3 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres');

/**
 * Address Schema
 */
export const addressSchema = z
  .string({
    required_error: 'Endereço é obrigatório',
    invalid_type_error: 'Endereço deve ser uma string',
  })
  .min(5, 'Endereço deve ter pelo menos 5 caracteres')
  .max(200, 'Endereço deve ter no máximo 200 caracteres');

// ============================================================================
// COMPOSITE SCHEMAS
// ============================================================================

/**
 * User Registration Schema
 * Complete validation for user registration form
 */
export const userRegistrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  cpf: cpfSchema,
  phone: phoneSchema,
  address: addressSchema,
  zip_code: zipCodeSchema,
  age: ageSchema,
  birth_date: birthDateSchema,
  document_number: z.string().min(1, 'Número do documento é obrigatório'),
  document_type: documentTypeSchema,
});

/**
 * Infer TypeScript type from schema
 */
export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;

/**
 * Update Profile Schema
 * All fields optional for partial updates
 */
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  address: addressSchema.optional(),
  phone: phoneSchema.optional(),
  zip_code: zipCodeSchema.optional(),
  age: ageSchema.optional(),
  birth_date: z.string().optional(),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

/**
 * Change Password Schema
 * Validates password change with confirmation
 */
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Senha atual é obrigatória'),
    new_password: passwordSchema,
    confirm_password: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine(data => data.new_password === data.confirm_password, {
    message: 'As senhas não coincidem',
    path: ['confirm_password'],
  })
  .refine(data => data.current_password !== data.new_password, {
    message: 'Nova senha deve ser diferente da senha atual',
    path: ['new_password'],
  });

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginData = z.infer<typeof loginSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate data against a schema and return errors in a friendly format
 */
export const validateWithSchema = <T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Convert Zod errors to a simple key-value object
  const errors: Record<string, string> = {};
  result.error.errors.forEach(err => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return { success: false, errors };
};

/**
 * Validate a single field
 */
export const validateField = <T extends z.ZodType>(
  schema: T,
  value: unknown
): { isValid: boolean; error?: string; data?: z.infer<T> } => {
  const result = schema.safeParse(value);

  if (result.success) {
    return { isValid: true, data: result.data };
  }

  return {
    isValid: false,
    error: result.error.errors[0]?.message || 'Valor inválido',
  };
};

// ============================================================================
// FORMATTERS
// ============================================================================

/**
 * Format CPF for display
 * 12345678909 -> 123.456.789-09
 */
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return cpf;

  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Format phone for display
 * 11999999999 -> (11) 99999-9999
 */
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
};

/**
 * Format ZIP code for display
 * 12345678 -> 12345-678
 */
export const formatZipCode = (zipCode: string): string => {
  const cleanZip = zipCode.replace(/\D/g, '');
  if (cleanZip.length !== 8) return zipCode;

  return cleanZip.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// ============================================================================
// SCHEMA EXPORTS FOR SPECIFIC FIELDS
// ============================================================================

/**
 * Export individual schemas for use in forms
 */
export const schemas = {
  email: emailSchema,
  password: passwordSchema,
  strongPassword: strongPasswordSchema,
  cpf: cpfSchema,
  phone: phoneSchema,
  zipCode: zipCodeSchema,
  age: ageSchema,
  birthDate: birthDateSchema,
  documentType: documentTypeSchema,
  name: nameSchema,
  address: addressSchema,
};

/**
 * Helper to get schema by field name
 */
export const getSchemaByFieldName = (fieldName: keyof typeof schemas): z.ZodType | undefined => {
  return schemas[fieldName];
};
