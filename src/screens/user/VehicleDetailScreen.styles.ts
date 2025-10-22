import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

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
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
  },
  bottomSpacing: {
    height: 32,
  },

  // Vehicle Image
  vehicleImage: {
    height: 250,
    resizeMode: 'cover',
    width: width,
  },
  vehicleImagePlaceholder: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    height: 250,
    justifyContent: 'center',
    width: width,
  },

  // Info Card
  infoCard: {
    elevation: 4,
    margin: 16,
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  basicInfo: {
    marginBottom: 8,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#666',
    fontSize: 16,
    marginLeft: 12,
    marginRight: 12,
    minWidth: 60,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 16,
  },
  description: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
  },

  // Rental Card
  rentalCard: {
    elevation: 4,
    margin: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  rentalInfo: {
    gap: 16,
  },
  priceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: '#666',
    fontSize: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  expirationContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expirationLabel: {
    color: '#666',
    fontSize: 16,
  },
  expirationChip: {
    borderRadius: 16,
    elevation: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  expirationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLabel: {
    color: '#666',
    fontSize: 16,
  },
  statusChip: {
    alignSelf: 'flex-end',
  },

  // Features Card
  featuresCard: {
    elevation: 4,
    margin: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    marginBottom: 8,
  },
  noFeaturesText: {
    color: '#666',
    fontSize: 16,
    fontStyle: 'italic',
  },

  // Payments Card
  paymentsCard: {
    elevation: 4,
    margin: 16,
    marginTop: 8,
  },
  paymentItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 16,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  paymentDueDate: {
    color: '#666',
    fontSize: 14,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  paymentStatusChip: {
    borderRadius: 12,
    elevation: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  payButton: {
    marginTop: 8,
  },
  payButtonContent: {
    paddingVertical: 8,
  },
});
