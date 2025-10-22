/**
 * Constants for UserDetailsScreen
 * Centralizes all text strings for easier maintenance and potential i18n support
 */

export const USER_DETAILS_CONSTANTS = {
  // Screen titles
  SCREEN_TITLE: 'Detalhes do Usuário',

  // Section titles
  CONTACT_INFO_TITLE: 'Informações de Contato',
  PAYMENT_INFO_TITLE: 'Informações de Pagamento',
  PAYMENT_STATUS_TITLE: 'Status de Pagamento',
  VEHICLES_TITLE: 'Veículos',
  PAYMENT_HISTORY_TITLE: 'Histórico de Pagamentos',

  // Labels
  EMAIL_LABEL: 'Email',
  PHONE_LABEL: 'Telefone',
  ADDRESS_LABEL: 'Endereço',
  DOCUMENT_LABEL: 'Documento',
  CREATED_AT_LABEL: 'Criado em',
  UPDATED_AT_LABEL: 'Atualizado',
  TOTAL_PAYMENTS_LABEL: 'Total de Pagamentos',
  LAST_PAYMENT_LABEL: 'Último Pagamento',
  WEEKLY_AMOUNT_LABEL: 'Valor Semanal',
  MONTHLY_AMOUNT_LABEL: 'Valor Mensal',

  // Status texts
  STATUS_ACTIVE: 'Ativo',
  STATUS_INACTIVE: 'Inativo',
  STATUS_SUSPENDED: 'Suspenso',
  STATUS_UNKNOWN: 'Desconhecido',
  STATUS_UP_TO_DATE: 'Em Dia',
  STATUS_OVERDUE: 'Vencido',
  STATUS_NO_PAYMENTS: 'Sem Pagamentos',
  STATUS_PENDING: 'Aguardando Pagamento',
  STATUS_PAID: 'Pago',
  STATUS_COMPLETED: 'Pago',

  // Payment status details
  DAYS_OVERDUE_LABEL: 'Dias em Atraso',
  DAYS_SUFFIX: 'dias',
  AMOUNT_OVERDUE_LABEL: 'Valor em Atraso',
  LAST_PAYMENT_DATE_LABEL: 'Último Pagamento',
  NEXT_PAYMENT_LABEL: 'Próximo Pagamento',

  // Chip labels
  ADMIN_BADGE: 'Administrador',

  // Vehicle details
  VEHICLE_PLATE_LABEL: 'Placa',
  VEHICLE_BRAND_LABEL: 'Marca',
  VEHICLE_MODEL_LABEL: 'Modelo',
  VEHICLE_YEAR_LABEL: 'Ano',
  VEHICLE_COLOR_LABEL: 'Cor',
  VEHICLE_CHASSIS_LABEL: 'Chassi',
  VEHICLE_FUEL_LABEL: 'Combustível',
  VEHICLE_PRICE_LABEL: 'Valor',
  VEHICLE_DESCRIPTION_LABEL: 'Descrição',
  RENTAL_EXPIRATION_LABEL: '⏰ Vencimento do aluguel',

  // Fuel types
  FUEL_GASOLINE: 'Gasolina',
  FUEL_ETHANOL: 'Etanol',
  FUEL_FLEX: 'Flex',
  FUEL_DIESEL: 'Diesel',

  // Payment details
  PAYMENT_DESCRIPTION_DEFAULT: 'Pagamento',
  PAYMENT_DUE_DATE_LABEL: 'Vencimento',
  PAYMENT_PAID_DATE_LABEL: 'Pago em',

  // Buttons
  BUTTON_VIEW_RECEIPT: 'Ver Comprovante',
  BUTTON_BACK: 'Voltar',
  BUTTON_CANCEL: 'Cancelar',
  BUTTON_SAVE: 'Salvar',

  // Dialog titles
  DIALOG_EDIT_PAYMENT_TITLE: 'Editar Valores de Pagamento',
  DIALOG_EDIT_USER_TITLE: 'Editar Informações do Usuário',

  // Dialog messages
  DIALOG_PAYMENT_SUBTITLE: 'Você pode atualizar apenas um dos valores ou ambos',

  // Input placeholders
  PLACEHOLDER_WEEKLY_AMOUNT: 'Ex: 500.00',
  PLACEHOLDER_MONTHLY_AMOUNT: 'Ex: 500.00',
  PLACEHOLDER_NAME: 'Nome completo',
  PLACEHOLDER_EMAIL: 'email@exemplo.com',
  PLACEHOLDER_PHONE: '(11) 99999-9999',
  PLACEHOLDER_ADDRESS: 'Rua, número, bairro, cidade',

  // Input labels
  INPUT_WEEKLY_AMOUNT_LABEL: 'Valor Semanal (R$) - Opcional',
  INPUT_MONTHLY_AMOUNT_LABEL: 'Valor Mensal (R$) - Opcional',
  INPUT_NAME_LABEL: 'Nome',
  INPUT_EMAIL_LABEL: 'Email',
  INPUT_PHONE_LABEL: 'Telefone',
  INPUT_ADDRESS_LABEL: 'Endereço',

  // Empty states
  NO_INFO: 'Não informado',
  NO_VEHICLES: 'Nenhum veículo encontrado',
  NO_PAYMENTS: 'Nenhum pagamento encontrado',
  USER_NOT_FOUND: 'Usuário não encontrado',
  LAST_PAYMENT_NONE: '-',

  // Error messages
  ERROR_LOADING: 'Erro ao carregar detalhes do usuário',
  ERROR_NAME_REQUIRED: 'Por favor, insira um nome',
  ERROR_EMAIL_REQUIRED: 'Por favor, insira um email',
  ERROR_PAYMENT_VALUE_REQUIRED: 'Por favor, preencha pelo menos um valor',
  ERROR_WEEKLY_INVALID: 'Por favor, insira um valor semanal válido',
  ERROR_MONTHLY_INVALID: 'Por favor, insira um valor mensal válido',
  ERROR_UPDATING_PAYMENT: 'Erro ao atualizar valores de pagamento',
  ERROR_UPDATING_USER: 'Erro ao atualizar informações do usuário',

  // Success messages
  SUCCESS_PAYMENT_UPDATED: 'Valores de pagamento atualizados com sucesso',
  SUCCESS_USER_UPDATED: 'Informações atualizadas com sucesso',
};
