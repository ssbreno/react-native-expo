import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container & Layout
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },

  // Header Section
  header: {
    backgroundColor: 'white',
    elevation: 2,
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryDivider: {
    backgroundColor: '#e0e0e0',
    height: 40,
    width: 1,
  },

  // Payment Card
  card: {
    backgroundColor: 'white',
    elevation: 4,
    marginBottom: 16,
  },
  paymentHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 16,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#666',
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  amountBreakdown: {
    alignItems: 'flex-end',
  },
  baseAmountSmall: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  interestAmountSmall: {
    color: '#f44336',
    fontSize: 12,
    fontWeight: '500',
  },

  // Payment Details
  divider: {
    marginVertical: 12,
  },
  paymentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },

  // Status & Actions
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusChip: {
    alignItems: 'center',
    borderRadius: 16,
    elevation: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  payButton: {
    marginTop: 8,
  },
  payButtonContent: {
    paddingVertical: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  receiptButton: {
    flex: 1,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
  },

  // PIX Payment
  pixPaymentContainer: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 16,
  },
  cancelPixButton: {
    marginTop: 8,
  },
});
