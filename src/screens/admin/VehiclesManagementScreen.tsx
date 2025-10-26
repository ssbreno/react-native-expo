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
  const [filterType, setFilterType] = useState('all');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [itemsPerPage] = useState(10);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = currentPage) => {
    // Evitar múltiplas requisições simultâneas
    if (isLoadingPage) {
      console.log('⏳ [VehiclesManagement] Já está carregando, ignorando...');
      return;
    }

    try {
      setLoading(true);
      setIsLoadingPage(true);
      const [vehiclesResult, availableResult, usersResult] = await Promise.all([
        vehicleService.getVehicles(page, itemsPerPage), // Com paginação
        vehicleService.getAvailableVehicles(1, 100),
        adminService.getAllUsers(1, 1000),
      ]);

      console.log('🚗 [VehiclesManagement] Loaded vehicles:', vehiclesResult.data?.vehicles?.length || 0);
      console.log('📋 [VehiclesManagement] Pagination:', {
        page: vehiclesResult.data?.page,
        total: vehiclesResult.data?.total,
        limit: vehiclesResult.data?.limit,
      });

      if (vehiclesResult.success && vehiclesResult.data) {
        const { vehicles, total, page: currentPageResponse, limit } = vehiclesResult.data;
        setAllVehicles(vehicles || []);
        setVehicles(vehicles || []);
        setTotalVehicles(total || 0);
        setCurrentPage(currentPageResponse || page);
        setTotalPages(Math.ceil((total || 0) / (limit || itemsPerPage)));
        console.log('🚗 [VehiclesManagement] Vehicle IDs:', vehicles?.map((v: any) => v.id));
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
      setIsLoadingPage(false);
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
      console.log('🚗 [VehiclesManagement] Creating vehicle:', newVehicleData.license_plate);
      const result = await vehicleService.createVehicle(newVehicleData);

      if (result.success) {
        console.log('✅ [VehiclesManagement] Vehicle created, reloading data...');
        Alert.alert('Sucesso!', result.message || 'Veículo criado com sucesso');
        closeCreateVehicleModal();
        await loadData(); // Garantir que espera carregar
        console.log('🔄 [VehiclesManagement] Data reloaded');
      } else {
        console.error('❌ [VehiclesManagement] Failed to create vehicle:', result.error);
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

  const handleUnassignVehicle = (vehicleId: number, vehicleName: string) => {
    Alert.alert(
      'Desvincular Veículo',
      `Tem certeza que deseja desvincular ${vehicleName}?\n\nO veículo ficará disponível novamente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desvincular',
          style: 'default',
          onPress: async () => {
            try {
              console.log(`🔓 [VehiclesManagement] Unassigning vehicle ${vehicleId}`);
              
              // Log estado antes
              const vehicleBefore = vehicles.find(v => v.id === vehicleId);
              console.log('📋 [VehiclesManagement] Vehicle BEFORE unassign:', {
                id: vehicleBefore?.id,
                user_id: vehicleBefore?.user_id,
                brand: vehicleBefore?.brand,
              });
              
              const result = await vehicleService.unassignVehicle(vehicleId);
              console.log('📊 [VehiclesManagement] Unassign result:', result);
              
              if (result.success) {
                console.log('✅ [VehiclesManagement] Unassign successful, reloading data...');
                await loadData();
                
                // Log estado depois
                const vehicleAfter = vehicles.find(v => v.id === vehicleId);
                console.log('📋 [VehiclesManagement] Vehicle AFTER reload:', {
                  id: vehicleAfter?.id,
                  user_id: vehicleAfter?.user_id,
                  brand: vehicleAfter?.brand,
                });
                
                Alert.alert('Sucesso!', result.message || 'Veículo desvinculado com sucesso');
              } else {
                console.error('❌ [VehiclesManagement] Unassign failed:', result.error);
                Alert.alert('Erro', result.error || 'Erro ao desvincular veículo');
              }
            } catch (error) {
              console.error('❌ [VehiclesManagement] Error unassigning vehicle:', error);
              Alert.alert('Erro', 'Erro ao desvincular veículo');
            }
          },
        },
      ]
    );
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
      // Filter by type - Considerar user_id null, undefined ou 0 como disponível
      const isAvailable = !vehicle.user_id || vehicle.user_id === 0;
      if (filterType === 'available' && !isAvailable) return false;
      if (filterType === 'assigned' && isAvailable) return false;

      // Filter by search
      if (!searchQuery.trim()) return true; // Se busca está vazia, mostrar todos
      
      const searchLower = searchQuery.toLowerCase();
      return (
        (vehicle.brand || '').toLowerCase().includes(searchLower) ||
        (vehicle.model || '').toLowerCase().includes(searchLower) ||
        (vehicle.license_plate || '').toLowerCase().includes(searchLower) ||
        (vehicle.color || '').toLowerCase().includes(searchLower)
      );
    });

  const renderVehicleCard = (vehicle: Vehicle) => {
    const isAvailable = !vehicle.user_id || vehicle.user_id === 0;
    
    // Encontrar usuário vinculado
    const linkedUser = !isAvailable ? users.find(u => u.id === vehicle.user_id) : null;

    return (
      <TouchableOpacity
        key={vehicle.id}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('VehicleDetails', { vehicleId: vehicle.id })}
      >
        <Card style={styles.vehicleCard}>
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
              
              {/* Mostrar nome do usuário vinculado */}
              {linkedUser && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#F5F5F5', padding: 8, borderRadius: 6 }}>
                  <Ionicons name="person" size={16} color="#666" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 13, color: '#666', fontWeight: '500' }}>
                    Vinculado com: <Text style={{ color: '#333', fontWeight: '600' }}>{linkedUser.name}</Text>
                  </Text>
                </View>
              )}
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
              <Button
                mode="outlined"
                onPress={() => handleUnassignVehicle(vehicle.id, `${vehicle.brand} ${vehicle.model}`)}
                icon="link-off"
                textColor="#FF9800"
                style={[styles.actionBtn, { borderColor: '#FF9800' }]}
              >
                Desvincular
              </Button>
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
      </TouchableOpacity>
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
          Total: {totalVehicles} • Disponíveis: {allVehicles.filter(v => !v.user_id || v.user_id === 0).length}
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

      {/* Botão Novo Veículo no Topo */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <Button
          mode="contained"
          onPress={openCreateVehicleModal}
          icon="plus"
          style={{ borderRadius: 8 }}
        >
          Novo Veículo
        </Button>
      </View>

      {/* Controles de Paginação no Topo */}
      {totalPages > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 }}>
          <Button
            mode="outlined"
            onPress={() => {
              if (currentPage > 1 && !isLoadingPage) {
                loadData(currentPage - 1);
              }
            }}
            disabled={currentPage === 1 || isLoadingPage}
            icon="chevron-left"
            compact
            loading={isLoadingPage && currentPage > 1}
          >
            Anterior
          </Button>
          
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' }}>
              Página {currentPage} de {totalPages}
            </Text>
            <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
              {totalVehicles} veículos no total
            </Text>
          </View>
          
          <Button
            mode="outlined"
            onPress={() => {
              if (currentPage < totalPages && !isLoadingPage) {
                loadData(currentPage + 1);
              }
            }}
            disabled={currentPage >= totalPages || isLoadingPage}
            icon="chevron-right"
            contentStyle={{ flexDirection: 'row-reverse' }}
            compact
            loading={isLoadingPage && currentPage < totalPages}
          >
            Próxima
          </Button>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Lista de veículos */}
        {filteredVehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-sport-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum veículo encontrado</Text>
          </View>
        ) : (
          filteredVehicles.map(renderVehicleCard)
        )}
      </ScrollView>

      {/* Modal Criar Veículo */}
      <Portal>
        <Dialog visible={createVehicleVisible} onDismiss={closeCreateVehicleModal}>
          <Dialog.Title>Criar Novo Veículo</Dialog.Title>
          
          {/* Botões no Topo */}
          <Dialog.Actions style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 }}>
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

          <Dialog.ScrollArea>
            <ScrollView 
              style={{ maxHeight: 450 }} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
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

              <Text style={{ fontSize: 12, color: '#666', marginTop: 8, marginBottom: 16 }}>
                * Campos obrigatórios
              </Text>
            </ScrollView>
          </Dialog.ScrollArea>
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
