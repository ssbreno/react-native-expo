import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Surface,
  useTheme,
  Chip,
  Searchbar,
  FAB,
  Portal,
  Dialog,
  Button,
  TextInput,
  SegmentedButtons,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { vehicleService } from '../../services/vehicleService';
import { adminService, AdminUser } from '../../services/adminService';
import { Vehicle, VehicleCreateData } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';
import { Colors } from '../../constants/colors';
import { styles } from './VehiclesManagementScreen.styles';

interface VehiclesManagementScreenProps {
  navigation: any;
}

export default function VehiclesManagementScreen({ navigation }: VehiclesManagementScreenProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

  // Create Vehicle Modal
  const [createVehicleVisible, setCreateVehicleVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newVehicleData, setNewVehicleData] = useState<VehicleCreateData>({
    vehicle_type: 'car',
    brand: '',
    model: '',
    manufacture_year: 2024,
    model_year: 2024,
    color: '',
    license_plate: '',
    chassis: '',
    mileage: 0,
    fuel_type: 'gasoline',
    price: 0,
    description: '',
  });

  // Assign Vehicle Modal
  const [assignVehicleVisible, setAssignVehicleVisible] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Filters
  const [filterType, setFilterType] = useState('all'); // all, available, assigned

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiclesResult, availableResult, usersResult] = await Promise.all([
        vehicleService.getVehicles(),
        vehicleService.getAvailableVehicles(1, 100),
        adminService.getAllUsers(1, 1000),
      ]);

      if (vehiclesResult.success && vehiclesResult.data) {
        setAllVehicles(vehiclesResult.data);
        setVehicles(vehiclesResult.data);
      }

      if (availableResult.success && availableResult.data) {
        setAvailableVehicles(availableResult.data.vehicles);
      }

      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data.users || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erro', 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openCreateVehicleModal = () => {
    setNewVehicleData({
      vehicle_type: 'car',
      brand: '',
      model: '',
      manufacture_year: 2024,
      model_year: 2024,
      color: '',
      license_plate: '',
      chassis: '',
      mileage: 0,
      fuel_type: 'gasoline',
      price: 0,
      description: '',
    });
    setCreateVehicleVisible(true);
  };

  const closeCreateVehicleModal = () => {
    setCreateVehicleVisible(false);
  };

  const handleCreateVehicle = async () => {
    // Validações
    if (!newVehicleData.brand.trim()) {
      Alert.alert('Erro', 'Marca é obrigatória');
      return;
    }
    if (!newVehicleData.model.trim()) {
      Alert.alert('Erro', 'Modelo é obrigatório');
      return;
    }
    if (!newVehicleData.license_plate.trim()) {
      Alert.alert('Erro', 'Placa é obrigatória');
      return;
    }
    if (!newVehicleData.chassis.trim()) {
      Alert.alert('Erro', 'Chassis é obrigatório');
      return;
    }
    if (newVehicleData.price <= 0) {
      Alert.alert('Erro', 'Preço deve ser maior que zero');
      return;
    }

    setCreating(true);
    try {
      const result = await vehicleService.createVehicle(newVehicleData);

      if (result.success) {
        Alert.alert('Sucesso!', result.message || 'Veículo criado com sucesso');
        closeCreateVehicleModal();
        loadData();
      } else {
        Alert.alert('Erro', result.error || 'Erro ao criar veículo');
      }
    } catch (error) {
      console.error('Error creating vehicle:', error);
      Alert.alert('Erro', 'Erro ao criar veículo');
    } finally {
      setCreating(false);
    }
  };

  const openAssignVehicleModal = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setSelectedUserId(null);
    setAssignVehicleVisible(true);
  };

  const closeAssignVehicleModal = () => {
    setAssignVehicleVisible(false);
    setSelectedVehicleId(null);
    setSelectedUserId(null);
  };

  const handleAssignVehicle = async () => {
    if (!selectedVehicleId || !selectedUserId) {
      Alert.alert('Erro', 'Selecione um veículo e um usuário');
      return;
    }

    setAssigning(true);
    try {
      const result = await vehicleService.assignVehicle(selectedVehicleId, selectedUserId);

      if (result.success) {
        Alert.alert('Sucesso!', result.message || 'Veículo vinculado com sucesso');
        closeAssignVehicleModal();
        loadData();
      } else {
        Alert.alert('Erro', result.error || 'Erro ao vincular veículo');
      }
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      Alert.alert('Erro', 'Erro ao vincular veículo');
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteVehicle = (vehicleId: number, vehicleName: string) => {
    Alert.alert(
      'Deletar Veículo',
      `Tem certeza que deseja deletar ${vehicleName}?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await vehicleService.deleteVehicle(vehicleId);
              if (result.success) {
                Alert.alert('Sucesso', result.message || 'Veículo deletado');
                loadData();
              } else {
                Alert.alert('Erro', result.error || 'Erro ao deletar veículo');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro ao deletar veículo');
            }
          },
        },
      ]
    );
  };

  const filteredVehicles = allVehicles
    .filter(vehicle => {
      // Filter by type
      if (filterType === 'available' && vehicle.user_id) return false;
      if (filterType === 'assigned' && !vehicle.user_id) return false;

      // Filter by search
      const searchLower = searchQuery.toLowerCase();
      return (
        vehicle.brand.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.license_plate.toLowerCase().includes(searchLower) ||
        (vehicle.color && vehicle.color.toLowerCase().includes(searchLower))
      );
    });

  const renderVehicleCard = (vehicle: Vehicle) => {
    const isAvailable = !vehicle.user_id;

    return (
      <Card key={vehicle.id} style={styles.vehicleCard}>
        <Card.Content>
          <View style={styles.vehicleHeader}>
            <View style={styles.vehicleInfo}>
              <Title style={styles.vehicleName}>
                {vehicle.brand} {vehicle.model}
              </Title>
              <View style={styles.vehicleDetails}>
                <Chip
                  icon="car"
                  style={[
                    styles.statusChip,
                    { backgroundColor: isAvailable ? '#E8F5E8' : '#FFF3E0' },
                  ]}
                  textStyle={{ color: isAvailable ? '#2E7D32' : '#F57C00' }}
                >
                  {isAvailable ? 'Disponível' : 'Vinculado'}
                </Chip>
                <Text style={styles.plateText}>{vehicle.license_plate}</Text>
              </View>
            </View>
          </View>

          <View style={styles.vehicleInfoGrid}>
            {!!vehicle.color && (
              <View style={styles.infoItem}>
                <Ionicons name="color-palette" size={16} color="#666" />
                <Text style={styles.infoText}>{vehicle.color}</Text>
              </View>
            )}
            {!!vehicle.model_year && (
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.infoText}>{vehicle.model_year}</Text>
              </View>
            )}
            {!!vehicle.fuel_type && (
              <View style={styles.infoItem}>
                <Ionicons name="water" size={16} color="#666" />
                <Text style={styles.infoText}>{vehicle.fuel_type}</Text>
              </View>
            )}
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Valor Semanal:</Text>
            <Text style={styles.priceValue}>{formatCurrency(vehicle.price)}</Text>
          </View>

          <View style={styles.actionsRow}>
            {isAvailable ? (
              <Button
                mode="contained"
                onPress={() => openAssignVehicleModal(vehicle.id)}
                icon="link"
                style={styles.actionBtn}
              >
                Vincular
              </Button>
            ) : (
              <Chip icon="person" style={styles.userChip}>
                Usuário vinculado
              </Chip>
            )}
            <Button
              mode="outlined"
              onPress={() => handleDeleteVehicle(vehicle.id, `${vehicle.brand} ${vehicle.model}`)}
              icon="trash-can-outline"
              textColor="#F44336"
              style={[styles.actionBtn, { borderColor: '#F44336' }]}
            >
              Deletar
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading && vehicles.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando veículos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Gerenciamento de Veículos</Title>
        <Text style={styles.headerSubtitle}>
          Total: {allVehicles.length} • Disponíveis: {availableVehicles.length}
        </Text>
      </Surface>

      <View style={styles.filtersContainer}>
        <SegmentedButtons
          value={filterType}
          onValueChange={setFilterType}
          buttons={[
            { value: 'all', label: 'Todos' },
            { value: 'available', label: 'Disponíveis' },
            { value: 'assigned', label: 'Vinculados' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por marca, modelo ou placa..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {filteredVehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-sport-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum veículo encontrado</Text>
          </View>
        ) : (
          filteredVehicles.map(renderVehicleCard)
        )}
      </ScrollView>

      {/* FAB Criar Veículo */}
      <FAB
        icon="plus"
        label="Novo Veículo"
        style={styles.fab}
        onPress={openCreateVehicleModal}
        color="#fff"
      />

      {/* Modal Criar Veículo */}
      <Portal>
        <Dialog visible={createVehicleVisible} onDismiss={closeCreateVehicleModal}>
          <Dialog.Title>Criar Novo Veículo</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={{ maxHeight: 500 }}>
              <SegmentedButtons
                value={newVehicleData.vehicle_type}
                onValueChange={value =>
                  setNewVehicleData({ ...newVehicleData, vehicle_type: value as 'car' | 'moto' })
                }
                buttons={[
                  { value: 'car', label: 'Carro', icon: 'car' },
                  { value: 'moto', label: 'Moto', icon: 'bicycle' },
                ]}
                style={{ marginBottom: 12 }}
              />

              <TextInput
                label="Marca *"
                value={newVehicleData.brand}
                onChangeText={text => setNewVehicleData({ ...newVehicleData, brand: text })}
                mode="outlined"
                style={{ marginBottom: 12 }}
                disabled={creating}
              />

              <TextInput
                label="Modelo *"
                value={newVehicleData.model}
                onChangeText={text => setNewVehicleData({ ...newVehicleData, model: text })}
                mode="outlined"
                style={{ marginBottom: 12 }}
                disabled={creating}
              />

              <TextInput
                label="Placa (ABC1D23) *"
                value={newVehicleData.license_plate}
                onChangeText={text =>
                  setNewVehicleData({ ...newVehicleData, license_plate: text.toUpperCase() })
                }
                mode="outlined"
                style={{ marginBottom: 12 }}
                disabled={creating}
                autoCapitalize="characters"
              />

              <TextInput
                label="Chassis *"
                value={newVehicleData.chassis}
                onChangeText={text =>
                  setNewVehicleData({ ...newVehicleData, chassis: text.toUpperCase() })
                }
                mode="outlined"
                style={{ marginBottom: 12 }}
                disabled={creating}
                autoCapitalize="characters"
              />

              <TextInput
                label="Cor"
                value={newVehicleData.color}
                onChangeText={text => setNewVehicleData({ ...newVehicleData, color: text })}
                mode="outlined"
                style={{ marginBottom: 12 }}
                disabled={creating}
              />

              <TextInput
                label="Ano Fabricação *"
                value={newVehicleData.manufacture_year.toString()}
                onChangeText={text =>
                  setNewVehicleData({ ...newVehicleData, manufacture_year: parseInt(text) || 2024 })
                }
                mode="outlined"
                keyboardType="numeric"
                style={{ marginBottom: 12 }}
                disabled={creating}
              />

              <TextInput
                label="Ano Modelo *"
                value={newVehicleData.model_year.toString()}
                onChangeText={text =>
                  setNewVehicleData({ ...newVehicleData, model_year: parseInt(text) || 2024 })
                }
                mode="outlined"
                keyboardType="numeric"
                style={{ marginBottom: 12 }}
                disabled={creating}
              />

              <TextInput
                label="Valor Semanal (R$) *"
                value={newVehicleData.price.toString()}
                onChangeText={text =>
                  setNewVehicleData({ ...newVehicleData, price: parseFloat(text) || 0 })
                }
                mode="outlined"
                keyboardType="decimal-pad"
                style={{ marginBottom: 12 }}
                disabled={creating}
              />

              <TextInput
                label="Descrição (Opcional)"
                value={newVehicleData.description}
                onChangeText={text => setNewVehicleData({ ...newVehicleData, description: text })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={{ marginBottom: 12 }}
                disabled={creating}
              />

              <Text style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                * Campos obrigatórios
              </Text>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={closeCreateVehicleModal} disabled={creating}>
              Cancelar
            </Button>
            <Button
              onPress={handleCreateVehicle}
              disabled={creating}
              loading={creating}
              mode="contained"
            >
              Criar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Modal Vincular Veículo */}
      <Portal>
        <Dialog visible={assignVehicleVisible} onDismiss={closeAssignVehicleModal}>
          <Dialog.Title>Vincular Veículo a Usuário</Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontSize: 14, marginBottom: 16 }}>
              Selecione o usuário para vincular este veículo:
            </Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {users.map(user => (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => setSelectedUserId(user.id)}
                  style={[
                    styles.userSelectItem,
                    selectedUserId === user.id && styles.userSelectItemActive,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userSelectName}>{user.name}</Text>
                    <Text style={styles.userSelectEmail}>{user.email}</Text>
                  </View>
                  {selectedUserId === user.id && (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeAssignVehicleModal} disabled={assigning}>
              Cancelar
            </Button>
            <Button
              onPress={handleAssignVehicle}
              disabled={assigning || !selectedUserId}
              loading={assigning}
              mode="contained"
            >
              Vincular
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
