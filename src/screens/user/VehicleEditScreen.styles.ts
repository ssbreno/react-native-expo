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
  scrollView: {
    flex: 1,
  },

  // Form Container
  formContainer: {
    borderRadius: 12,
    elevation: 4,
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  // Form Inputs
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },

  // Segmented Buttons
  segmentedButtons: {
    marginBottom: 16,
  },

  // Divider
  divider: {
    marginVertical: 24,
  },

  // Save Button
  saveButton: {
    marginBottom: 16,
    marginTop: 24,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
});
