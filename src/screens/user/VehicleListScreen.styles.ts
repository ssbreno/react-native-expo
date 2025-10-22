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
    color: '#666',
    fontSize: 16,
  },

  // List Container
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },

  // Vehicle Card
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonContent: {
    paddingVertical: 4,
  },

  // Vehicle Image
  vehicleImage: {
    borderRadius: 8,
    height: 90,
    marginRight: 16,
    width: 120,
  },
  vehicleImagePlaceholder: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    height: 90,
    justifyContent: 'center',
    marginRight: 16,
    width: 120,
  },

  // Vehicle Info
  vehicleInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsContainer: {
    marginBottom: 8,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },

  // Price Section
  priceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  priceLabel: {
    color: '#666',
    fontSize: 14,
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Status Section
  statusContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  expirationLabel: {
    color: '#666',
    fontSize: 12,
    marginRight: 8,
  },
  expirationChip: {
    borderRadius: 12,
    elevation: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  expirationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusChip: {
    alignSelf: 'flex-start',
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
});
