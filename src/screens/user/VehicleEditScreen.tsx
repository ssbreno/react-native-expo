import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  Title,
  Chip,
  SegmentedButtons,
  ActivityIndicator,
  Appbar,
  Surface,
  Divider,
} from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle, VehicleUpdateData } from '../../types';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type VehicleEditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VehicleEdit'>;
type VehicleEditScreenRouteProp = RouteProp<RootStackParamList, 'VehicleEdit'>;

interface VehicleEditScreenProps {
  navigation: VehicleEditScreenNavigationProp;
  route: VehicleEditScreenRouteProp;
}

export default function VehicleEditScreen({ route, navigation }: VehicleEditScreenProps) {
  const { vehicleId } = route.params;
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<VehicleUpdateData>({
    brand: '',
    chassis: '',
    color: '',
    description: '',
    fuel_type: 'gasoline',
    manufacture_year: new Date().getFullYear(),
    mileage: 0,
    model: '',
    model_year: new Date().getFullYear(),
    price: 0,
    status: 'ativo',
  });

  useEffect(() => {
    loadVehicle();
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const result = await vehicleService.getVehicleById(vehicleId.toString());
      
      if (result.success && result.data) {
        setVehicle(result.data);
        // Populate form with existing data
        setFormData({
          brand: result.data.brand || '',
          chassis: result.data.chassis || '',
          color: result.data.color || '',
          description: result.data.description || '',
          fuel_type: result.data.fuel_type || 'gasoline',
          manufacture_year: result.data.manufacture_year || new Date().getFullYear(),
          mileage: result.data.mileage || 0,
          model: result.data.model || '',
          model_year: result.data.model_year || new Date().getFullYear(),
          price: result.data.price || 0,
          status: result.data.status || 'ativo',
        });
      } else {
        Alert.alert('Erro', result.error || 'Erro ao carregar veículo');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro interno ao carregar veículo');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.brand.trim() || !formData.model.trim()) {
      Alert.alert('Erro', 'Marca e modelo são obrigatórios');
      return;
    }

    if (formData.manufacture_year < 1900 || formData.manufacture_year > new Date().getFullYear() + 1) {
      Alert.alert('Erro', 'Ano de fabricação inválido');
      return;
    }

    if (formData.price < 0) {
      Alert.alert('Erro', 'Preço não pode ser negativo');
      return;
    }

    try {
      setSaving(true);
      const result = await vehicleService.updateVehicle(vehicleId, formData);
      
      if (result.success) {
        Alert.alert(
          'Sucesso', 
          'Veículo atualizado com sucesso!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Erro', result.error || 'Erro ao atualizar veículo');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro interno ao salvar veículo');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof VehicleUpdateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregando veículo...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Editar Veículo" />
        <Appbar.Action 
          icon="content-save" 
          onPress={handleSave}
          disabled={saving}
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Surface style={styles.formContainer}>
          <Title style={styles.sectionTitle}>Informações Básicas</Title>
          
          <TextInput
            label="Marca *"
            value={formData.brand}
            onChangeText={(text) => updateFormData('brand', text)}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: Toyota, Honda, Ford"
          />

          <TextInput
            label="Modelo *"
            value={formData.model}
            onChangeText={(text) => updateFormData('model', text)}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: Corolla, Civic, Fiesta"
          />

          <TextInput
            label="Cor"
            value={formData.color}
            onChangeText={(text) => updateFormData('color', text)}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: Branco, Preto, Prata"
          />

          <TextInput
            label="Chassi"
            value={formData.chassis}
            onChangeText={(text) => updateFormData('chassis', text)}
            mode="outlined"
            style={styles.input}
            placeholder="Número do chassi"
          />

          <Divider style={styles.divider} />
          <Title style={styles.sectionTitle}>Anos e Quilometragem</Title>

          <View style={styles.row}>
            <TextInput
              label="Ano de Fabricação"
              value={formData.manufacture_year.toString()}
              onChangeText={(text) => updateFormData('manufacture_year', parseInt(text) || new Date().getFullYear())}
              mode="outlined"
              style={[styles.input, styles.halfWidth]}
              keyboardType="numeric"
            />

            <TextInput
              label="Ano do Modelo"
              value={formData.model_year.toString()}
              onChangeText={(text) => updateFormData('model_year', parseInt(text) || new Date().getFullYear())}
              mode="outlined"
              style={[styles.input, styles.halfWidth]}
              keyboardType="numeric"
            />
          </View>

          <TextInput
            label="Quilometragem (km)"
            value={formData.mileage.toString()}
            onChangeText={(text) => updateFormData('mileage', parseInt(text) || 0)}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
          />

          <Divider style={styles.divider} />
          <Title style={styles.sectionTitle}>Combustível</Title>

          <Text style={styles.label}>Tipo de Combustível</Text>
          <SegmentedButtons
            value={formData.fuel_type}
            onValueChange={(value) => updateFormData('fuel_type', value)}
            buttons={[
              { value: 'gasoline', label: 'Gasolina' },
              { value: 'ethanol', label: 'Etanol' },
              { value: 'diesel', label: 'Diesel' },
              { value: 'electric', label: 'Elétrico' },
              { value: 'hybrid', label: 'Híbrido' },
            ]}
            style={styles.segmentedButtons}
          />

          <Divider style={styles.divider} />
          <Title style={styles.sectionTitle}>Preço e Status</Title>

          <TextInput
            label="Preço (R$)"
            value={formData.price.toString()}
            onChangeText={(text) => updateFormData('price', parseFloat(text) || 0)}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            left={<TextInput.Affix text="R$" />}
          />

          <Text style={styles.label}>Status do Veículo</Text>
          <SegmentedButtons
            value={formData.status}
            onValueChange={(value) => updateFormData('status', value)}
            buttons={[
              { value: 'ativo', label: 'Ativo' },
              { value: 'inativo', label: 'Inativo' },
            ]}
            style={styles.segmentedButtons}
          />

          <Divider style={styles.divider} />
          <Title style={styles.sectionTitle}>Descrição</Title>

          <TextInput
            label="Descrição"
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="Descrição detalhada do veículo, condições, extras, etc."
          />

          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
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
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 24,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
});
