import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export const styles = StyleSheet.create({
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
  header: {
    elevation: 4,
    marginBottom: 16,
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  vehiclePlate: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  vehicleIconContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 50,
    padding: 16,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  costsCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  costsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  costsSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  monthFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  costCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    marginBottom: 12,
  },
  costHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  costDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  costDate: {
    fontSize: 12,
    color: '#999',
  },
  costAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  costActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
