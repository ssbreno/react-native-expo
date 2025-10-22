import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    elevation: 2,
    padding: 20,
  },
  headerTitle: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  filtersContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  segmentedButtons: {
    width: '100%',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    elevation: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  vehicleCard: {
    elevation: 2,
    marginBottom: 16,
  },
  vehicleHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  vehicleDetails: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 28,
  },
  plateText: {
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  vehicleInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 12,
  },
  infoItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
  },
  priceSection: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 12,
  },
  priceLabel: {
    color: '#666',
    fontSize: 14,
  },
  priceValue: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
  },
  userChip: {
    backgroundColor: '#E8F5E8',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 16,
  },
  fab: {
    backgroundColor: Colors.primary,
    bottom: 0,
    margin: 16,
    position: 'absolute',
    right: 0,
  },
  userSelectItem: {
    alignItems: 'center',
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  userSelectItemActive: {
    backgroundColor: '#E3F2FD',
  },
  userSelectName: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  userSelectEmail: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
});
