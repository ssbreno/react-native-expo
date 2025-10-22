import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
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
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#000000',
    fontSize: 16,
  },

  // Status Card
  statusCard: {
    elevation: 4,
    margin: 16,
  },
  statusHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  activeStatus: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  divider: {
    marginVertical: 16,
  },
  subscriptionDetails: {
    gap: 12,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#666',
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },

  // Payments Card
  paymentsCard: {
    elevation: 4,
    margin: 16,
    marginTop: 8,
  },
  paymentsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pendingBadge: {
    alignItems: 'center',
    backgroundColor: '#f44336',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  pendingCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pendingAmount: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountLabel: {
    color: '#666',
    fontSize: 16,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  payAllButton: {
    marginTop: 8,
  },

  // Settings Card
  settingsCard: {
    elevation: 4,
    margin: 16,
    marginTop: 8,
  },
  paymentMethodInfo: {
    paddingVertical: 16,
  },
  paymentMethodRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  paymentMethodText: {
    flex: 1,
    marginLeft: 16,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    color: '#666',
    fontSize: 14,
  },

  // Actions Card
  actionsCard: {
    elevation: 4,
    margin: 16,
    marginTop: 8,
  },
  renewButton: {
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  paySubscriptionButton: {
    marginTop: 16,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 32,
  },
});
