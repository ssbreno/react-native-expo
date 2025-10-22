import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  // Header Section
  header: {
    backgroundColor: 'white',
    elevation: 2,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    marginRight: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#000000',
    fontSize: 16,
    marginBottom: 2,
  },
  userPhone: {
    color: '#000000',
    fontSize: 16,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  editButtonContent: {
    paddingVertical: 4,
  },

  // Statistics Card
  statsCard: {
    elevation: 4,
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 8,
    width: 48,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#000000',
    fontSize: 14,
    textAlign: 'center',
  },
  statDivider: {
    backgroundColor: '#e0e0e0',
    height: 60,
    width: 1,
  },

  // Settings & Options Cards
  settingsCard: {
    elevation: 4,
    margin: 16,
    marginTop: 8,
  },
  optionsCard: {
    elevation: 4,
    margin: 16,
    marginTop: 8,
  },

  // Logout Section
  logoutCard: {
    elevation: 4,
    margin: 16,
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 8,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 32,
  },
});
