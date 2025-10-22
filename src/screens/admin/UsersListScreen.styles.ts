import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export const styles = StyleSheet.create({
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  detailItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  detailText: {
    color: '#666',
    fontSize: 14,
  },
  header: {
    elevation: 2,
    padding: 20,
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  headerTitle: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  licensePlateContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  licensePlateText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  loadMoreContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    padding: 20,
  },
  loadMoreText: {
    color: '#666',
    fontSize: 14,
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
  overdueAlert: {
    borderTopColor: '#FFCDD2',
    borderTopWidth: 1,
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
  },
  overdueAmount: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '700',
  },
  overdueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  overdueText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '500',
  },
  paymentInfoContent: {
    flex: 1,
  },
  paymentInfoGrid: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-around',
  },
  paymentInfoItem: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  paymentInfoLabel: {
    color: '#666',
    fontSize: 11,
    marginBottom: 2,
  },
  paymentInfoSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginTop: 4,
    padding: 12,
  },
  paymentInfoValue: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  paymentStatusBadge: {
    marginBottom: 12,
    marginTop: 12,
  },
  phoneText: {
    color: '#666',
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchBar: {
    elevation: 2,
  },
  searchContainer: {
    padding: 16,
  },
  statusBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  userCard: {
    elevation: 2,
  },
  userCardContainer: {
    marginBottom: 12,
  },
  userDetails: {
    gap: 8,
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
  },
  userHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userStatus: {
    marginLeft: 12,
  },
  vehicleItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  vehicleSection: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 16,
    marginVertical: 12,
    paddingVertical: 8,
  },
  vehicleText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});
