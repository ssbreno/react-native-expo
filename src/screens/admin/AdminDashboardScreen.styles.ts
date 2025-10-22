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
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#000',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 16,
    marginTop: 4,
  },
  welcomeText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderLeftWidth: 4,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
  },
  statContent: {
    flexDirection: 'column',
  },
  statHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  statTitle: {
    color: '#666',
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    margin: 16,
    padding: 20,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  usersSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    margin: 16,
    padding: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  userCard: {
    elevation: 1,
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
    marginBottom: 2,
  },
  userPhone: {
    color: '#666',
    fontSize: 14,
  },
  vehicleName: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  statusChip: {
    height: 32,
  },
  paymentStatusChip: {
    borderRadius: 16,
    height: 32,
  },
  userDivider: {
    marginVertical: 12,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userStat: {
    alignItems: 'center',
  },
  userStatLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  userStatValue: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    margin: 16,
    padding: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  enhancedUserCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  userMainInfo: {
    flex: 1,
  },
  userNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modernStatusChip: {
    borderRadius: 14,
    height: 28,
    paddingHorizontal: 12,
  },
  contactInfo: {
    gap: 8,
  },
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  contactText: {
    color: '#666',
    flex: 1,
    fontSize: 14,
  },
  modernDivider: {
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  paymentStatusInfo: {
    marginTop: 8,
  },
  overdueInfo: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#F44336',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
  },
  overdueItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  overdueLabel: {
    color: '#D32F2F',
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  overdueValue: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: 'bold',
  },
  upToDateInfo: {
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 4,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  upToDateLabel: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  upToDateValue: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  noPaymentsInfo: {
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#FF9800',
    borderLeftWidth: 4,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  noPaymentsText: {
    color: '#F57C00',
    fontSize: 14,
    fontWeight: '500',
  },
  basicPaymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  paymentStat: {
    alignItems: 'center',
    flex: 1,
  },
  paymentStatLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  paymentStatValue: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickStatsCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    margin: 16,
    padding: 20,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    padding: 16,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  quickStatLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginVertical: 8,
  },
  resultCount: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
  },
  statusChipContainer: {
    alignItems: 'flex-start',
    marginTop: 12,
  },
  seeAllContainer: {
    alignItems: 'center',
    borderTopColor: '#E0E0E0',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 12,
  },
  userNameHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  enhancedPaymentSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginTop: 4,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  paymentInfoItem: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  paymentInfoText: {
    flex: 1,
  },
  paymentInfoLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  paymentInfoValue: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },

  // Weekly Evolution Styles
  weeklyEvolutionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    margin: 16,
    padding: 20,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitleWithIcon: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
  },
  weeksPeriodSelector: {
    marginBottom: 16,
  },
  weeklyCardsContainer: {
    gap: 12,
  },
  weekCard: {
    borderLeftColor: Colors.primary,
    borderLeftWidth: 4,
    borderRadius: 8,
    elevation: 2,
  },
  weekHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekNumber: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekDateChip: {
    height: 28,
  },
  weekDivider: {
    marginVertical: 12,
  },
  weekStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  weekStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  weekStatValue: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  weekStatLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  weekAmountContainer: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  weekAmountLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  weekAmountValue: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // User Lists Styles
  usersSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  usersSectionTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  userItem: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderLeftColor: '#E0E0E0',
    borderLeftWidth: 3,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  userItemLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  userItemInfo: {
    flex: 1,
  },
  userItemName: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  vehicleText: {
    color: '#666',
    fontSize: 12,
  },
  licensePlate: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  userItemRight: {
    alignItems: 'flex-end',
  },
  paidAmount: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  paymentDate: {
    color: '#666',
    fontSize: 11,
  },
  unpaidAmount: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  overdueDaysLabel: {
    color: '#F44336',
    fontSize: 11,
    fontWeight: '500',
  },
});
