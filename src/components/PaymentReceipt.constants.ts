/**
 * Constants for PaymentReceipt Component
 * Centralizes all text strings for easier maintenance and potential i18n support
 */

export const PAYMENT_RECEIPT_CONSTANTS = {
  // Component title
  TITLE: 'Comprovante',

  // Company information
  COMPANY_NAME: 'VEHICLES-GO',
  COMPANY_SUBTITLE: 'Sistema de Gestão de Veículos',

  // Section titles
  VALUES_TITLE: 'Valores',
  DATES_TITLE: 'Datas',
  VEHICLE_TITLE: 'Veículo',

  // Labels
  PAYMENT_ID_LABEL: 'ID do Pagamento:',
  TRANSACTION_ID_LABEL: 'Transaction ID:',
  DESCRIPTION_LABEL: 'Descrição:',
  BASE_AMOUNT_LABEL: 'Valor Base:',
  INTEREST_LABEL: 'Juros:',
  TOTAL_LABEL: 'Total:',
  DUE_DATE_LABEL: 'Vencimento:',
  PAYMENT_DATE_LABEL: 'Data do Pagamento:',
  CREATED_DATE_LABEL: 'Criado em:',
  VEHICLE_ID_LABEL: 'ID do Veículo:',
  VEHICLE_NAME_LABEL: 'Nome:',
  PAYMENT_METHOD_LABEL: 'Método:',

  // Status texts
  STATUS_PAID: 'Pago',
  STATUS_PENDING: 'Pendente',
  STATUS_OVERDUE: 'Vencido',

  // Default values
  DEFAULT_NA: 'N/A',
  DEFAULT_AMOUNT: 'R$ 0,00',
  DEFAULT_PAYMENT_METHOD: 'PIX',

  // Loading and error states
  LOADING_TEXT: 'Carregando comprovante...',
  ERROR_LOADING: 'Erro ao carregar comprovante',
  ERROR_GENERATING_PDF: 'Não foi possível gerar o PDF',
  ERROR_PDF_GENERATION: 'Não foi possível gerar o PDF do comprovante',
  ERROR_SHARE: 'Não foi possível compartilhar o comprovante',
  RECEIPT_UNAVAILABLE: 'Comprovante disponível apenas para pagamentos confirmados',
  CURRENT_STATUS_LABEL: 'Status atual:',

  // Buttons
  BUTTON_RETRY: 'Tentar Novamente',
  BUTTON_PDF: 'PDF',
  BUTTON_SHARE: 'Compartilhar',
  BUTTON_CLOSE: 'Fechar',

  // Footer
  FOOTER_GENERATED_AT: 'Comprovante gerado em:',
  FOOTER_PAYMENT_CONFIRMED: 'Pagamento confirmado e processado com sucesso',

  // Share text format
  SHARE_TITLE: 'Comprovante de Pagamento',
  SHARE_HEADER: 'COMPROVANTE DE PAGAMENTO',
  SHARE_COMPANY: 'Nanquim Locações',
  SHARE_SECTION_INFO: 'Informações:',
  SHARE_SECTION_VALUES: 'Valores:',
  SHARE_SECTION_DATES: 'Datas:',
  SHARE_ID_PREFIX: 'ID:',
  SHARE_STATUS_PREFIX: 'Status:',
  SHARE_DESCRIPTION_PREFIX: 'Descrição:',
  SHARE_BASE_AMOUNT_PREFIX: 'Valor Base:',
  SHARE_INTEREST_PREFIX: 'Juros:',
  SHARE_TOTAL_PREFIX: 'Total:',
  SHARE_DUE_DATE_PREFIX: 'Vencimento:',
  SHARE_PAYMENT_DATE_PREFIX: 'Pagamento:',
  SHARE_CREATED_PREFIX: 'Criado em:',
  SHARE_SEPARATOR: '---',
  SHARE_FOOTER: 'Nanquim Locações - Sistema de Gestão de Veículos',
  SHARE_GENERATED_PREFIX: 'Comprovante gerado em:',
};
