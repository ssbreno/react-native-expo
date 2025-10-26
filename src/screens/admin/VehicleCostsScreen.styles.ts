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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  filtersCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  costCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: 16,
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
  costVehicle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  costDate: {
    fontSize: 12,
    color: '#999',
  },
  costAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  costActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
