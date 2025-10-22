import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    elevation: 0,
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  checkboxCustom: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: '#D1D5DB',
    borderRadius: 6,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  container: {
    backgroundColor: '#F8F9FA',
    flex: 1,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 3,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 12,
  },
  logoCircle: {
    alignItems: 'center',
    borderRadius: 50,
    elevation: 6,
    height: 100,
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    width: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  rememberMeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 4,
  },
  rememberMeText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  title: {
    color: '#1F2937',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
});
