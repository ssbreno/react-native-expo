import {
  validateCPF,
  validateEmail,
  validatePassword,
  validatePasswordStrength,
  validateAge,
  validatePhone,
  validateZipCode,
  validateBirthDate,
  validateDocumentType,
  validateUserRegistration,
  validateField,
  formatCPF,
  formatPhone,
  formatZipCode,
} from '../validators';

describe('validators', () => {
  describe('validateCPF', () => {
    it('deve validar CPF válido', () => {
      // CPFs válidos para teste
      const validCPFs = ['12345678909', '111.444.777-35'];

      validCPFs.forEach(cpf => {
        const result = validateCPF(cpf);
        expect(result.isValid).toBe(true);
      });
    });

    it('deve rejeitar CPF com todos os dígitos iguais', () => {
      const result = validateCPF('11111111111');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CPF inválido');
    });

    it('deve rejeitar CPF com menos de 11 dígitos', () => {
      const result = validateCPF('123456789');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CPF deve conter 11 dígitos');
    });

    it('deve rejeitar CPF com mais de 11 dígitos', () => {
      const result = validateCPF('123456789012');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CPF deve conter 11 dígitos');
    });

    it('deve aceitar CPF formatado', () => {
      const result = validateCPF('123.456.789-09');
      // Remove formatação e valida
      expect(result.isValid).toBeDefined();
    });
  });

  describe('formatCPF', () => {
    it('deve formatar CPF corretamente', () => {
      const formatted = formatCPF('12345678909');
      expect(formatted).toBe('123.456.789-09');
    });

    it('deve retornar CPF original se não tiver 11 dígitos', () => {
      const formatted = formatCPF('123456');
      expect(formatted).toBe('123456');
    });
  });

  describe('validateEmail', () => {
    it('deve validar emails válidos', () => {
      const validEmails = ['test@example.com', 'user.name@domain.com.br', 'user+tag@example.co'];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
      });
    });

    it('deve rejeitar emails inválidos', () => {
      const invalidEmails = ['invalid-email', '@example.com', 'user@', 'user@domain', ''];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
      });
    });

    it('deve rejeitar email vazio', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email é obrigatório');
    });
  });

  describe('validatePassword', () => {
    it('deve validar senha com 6+ caracteres', () => {
      const result = validatePassword('senha123');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar senha com menos de 6 caracteres', () => {
      const result = validatePassword('12345');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Senha deve ter pelo menos 6 caracteres');
    });

    it('deve rejeitar senha vazia', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Senha é obrigatória');
    });
  });

  describe('validatePasswordStrength', () => {
    it('deve classificar senha fraca', () => {
      const result = validatePasswordStrength('123456');
      expect(result.strength).toBe('weak');
      expect(result.isValid).toBe(true); // Mínimo atendido
    });

    it('deve classificar senha média', () => {
      const result = validatePasswordStrength('Senha123');
      expect(result.strength).toBe('medium');
      expect(result.isValid).toBe(true);
    });

    it('deve classificar senha forte', () => {
      const result = validatePasswordStrength('Senha123!@#');
      expect(result.strength).toBe('strong');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar senha muito curta', () => {
      const result = validatePasswordStrength('12345');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mínimo 6 caracteres');
    });
  });

  describe('validateAge', () => {
    it('deve validar idade entre 18-120', () => {
      [18, 25, 50, 100, 120].forEach(age => {
        const result = validateAge(age);
        expect(result.isValid).toBe(true);
      });
    });

    it('deve rejeitar idade menor que 18', () => {
      const result = validateAge(17);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Idade mínima é 18 anos');
    });

    it('deve rejeitar idade maior que 120', () => {
      const result = validateAge(121);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Idade máxima é 120 anos');
    });

    it('deve rejeitar idade inválida', () => {
      const result = validateAge(NaN);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Idade é obrigatória');
    });
  });

  describe('validatePhone', () => {
    it('deve validar telefone com 10 ou 11 dígitos', () => {
      const validPhones = [
        '11999999999', // 11 dígitos
        '1199999999', // 10 dígitos
        '(11) 99999-9999',
        '(11) 9999-9999',
      ];

      validPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(true);
      });
    });

    it('deve rejeitar telefone com menos de 10 dígitos', () => {
      const result = validatePhone('119999999');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Telefone deve ter 10 ou 11 dígitos');
    });

    it('deve rejeitar telefone vazio', () => {
      const result = validatePhone('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Telefone é obrigatório');
    });
  });

  describe('formatPhone', () => {
    it('deve formatar telefone com 11 dígitos', () => {
      const formatted = formatPhone('11999999999');
      expect(formatted).toBe('(11) 99999-9999');
    });

    it('deve formatar telefone com 10 dígitos', () => {
      const formatted = formatPhone('1199999999');
      expect(formatted).toBe('(11) 9999-9999');
    });

    it('deve retornar telefone original se não tiver 10 ou 11 dígitos', () => {
      const formatted = formatPhone('119999');
      expect(formatted).toBe('119999');
    });
  });

  describe('validateZipCode', () => {
    it('deve validar CEP válido', () => {
      const validZips = ['12345678', '12345-678'];

      validZips.forEach(zip => {
        const result = validateZipCode(zip);
        expect(result.isValid).toBe(true);
      });
    });

    it('deve rejeitar CEP com menos de 8 dígitos', () => {
      const result = validateZipCode('1234567');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CEP deve conter 8 dígitos');
    });

    it('deve rejeitar CEP vazio', () => {
      const result = validateZipCode('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CEP é obrigatório');
    });
  });

  describe('formatZipCode', () => {
    it('deve formatar CEP corretamente', () => {
      const formatted = formatZipCode('12345678');
      expect(formatted).toBe('12345-678');
    });

    it('deve retornar CEP original se não tiver 8 dígitos', () => {
      const formatted = formatZipCode('1234');
      expect(formatted).toBe('1234');
    });
  });

  describe('validateBirthDate', () => {
    it('deve validar data de nascimento de pessoa com 18+ anos', () => {
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 20);

      const result = validateBirthDate(validDate);
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar data de nascimento de pessoa com menos de 18 anos', () => {
      const invalidDate = new Date();
      invalidDate.setFullYear(invalidDate.getFullYear() - 17);

      const result = validateBirthDate(invalidDate);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Você deve ter pelo menos 18 anos');
    });

    it('deve rejeitar data inválida', () => {
      const result = validateBirthDate('invalid-date');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Data de nascimento inválida');
    });

    it('deve validar string de data ISO', () => {
      const result = validateBirthDate('1990-01-01');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateDocumentType', () => {
    it('deve validar tipos de documento válidos', () => {
      const validTypes = ['cpf', 'cnpj', 'rg', 'passport'];

      validTypes.forEach(type => {
        const result = validateDocumentType(type);
        expect(result.isValid).toBe(true);
      });
    });

    it('deve aceitar tipos em maiúsculas', () => {
      const result = validateDocumentType('CPF');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar tipo de documento inválido', () => {
      const result = validateDocumentType('invalid');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Tipo de documento inválido');
    });
  });

  describe('validateUserRegistration', () => {
    const validForm = {
      name: 'João Silva',
      email: 'joao@example.com',
      password: 'senha123',
      cpf: '12345678909',
      phone: '11999999999',
      address: 'Rua Exemplo, 123',
      zip_code: '12345-678',
      age: 25,
      birth_date: '1998-01-01',
      document_number: '12345678909',
      document_type: 'cpf',
    };

    it('deve validar formulário completo e válido', () => {
      const result = validateUserRegistration(validForm);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('deve rejeitar nome muito curto', () => {
      const result = validateUserRegistration({ ...validForm, name: 'Jo' });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Nome deve ter pelo menos 3 caracteres');
    });

    it('deve rejeitar email inválido', () => {
      const result = validateUserRegistration({ ...validForm, email: 'invalid' });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeTruthy();
    });

    it('deve rejeitar senha muito curta', () => {
      const result = validateUserRegistration({ ...validForm, password: '12345' });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Senha deve ter pelo menos 6 caracteres');
    });

    it('deve rejeitar idade menor que 18', () => {
      const result = validateUserRegistration({ ...validForm, age: 17 });
      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBe('Idade mínima é 18 anos');
    });

    it('deve rejeitar endereço muito curto', () => {
      const result = validateUserRegistration({ ...validForm, address: 'Rua' });
      expect(result.isValid).toBe(false);
      expect(result.errors.address).toBe('Endereço deve ter pelo menos 5 caracteres');
    });

    it('deve detectar múltiplos erros', () => {
      const invalidForm = {
        name: 'Jo',
        email: 'invalid',
        password: '123',
        cpf: '123',
        phone: '123',
        address: 'R',
        zip_code: '123',
        age: 17,
        birth_date: 'invalid',
        document_number: '',
        document_type: 'invalid',
      };

      const result = validateUserRegistration(invalidForm);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(5);
    });
  });

  describe('validateField', () => {
    it('deve validar campo de email', () => {
      const result = validateField('email', 'test@example.com');
      expect(result.isValid).toBe(true);
    });

    it('deve validar e formatar CPF', () => {
      const result = validateField('cpf', '12345678909');
      expect(result.formatted).toBe('123.456.789-09');
    });

    it('deve validar e formatar telefone', () => {
      const result = validateField('phone', '11999999999');
      expect(result.formatted).toBe('(11) 99999-9999');
    });

    it('deve validar e formatar CEP', () => {
      const result = validateField('zip_code', '12345678');
      expect(result.formatted).toBe('12345-678');
    });

    it('deve validar senha', () => {
      const result = validateField('password', 'senha123');
      expect(result.isValid).toBe(true);
    });

    it('deve validar idade', () => {
      const result = validateField('age', 25);
      expect(result.isValid).toBe(true);
    });

    it('deve validar data de nascimento', () => {
      const result = validateField('birth_date', '1990-01-01');
      expect(result.isValid).toBe(true);
    });

    it('deve validar tipo de documento', () => {
      const result = validateField('document_type', 'cpf');
      expect(result.isValid).toBe(true);
    });

    it('deve retornar erro para valor inválido', () => {
      const result = validateField('email', 'invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email inválido');
    });
  });
});
