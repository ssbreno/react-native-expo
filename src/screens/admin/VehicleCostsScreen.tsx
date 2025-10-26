import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Surface,
  useTheme,
  Button,
  Portal,
  Dialog,
  TextInput,
  Chip,
  Divider,
  Menu,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { vehicleCostService, VehicleCost, VehicleCostCreate } from '../../services/vehicleCostService';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';
import { Colors } from '../../constants/colors';
import { styles } from './VehicleCostsScreen.styles';

interface VehicleCostsScreenProps {
  navigation: any;
}

export default function VehicleCostsScreen({ navigation }: VehicleCostsScreenProps) {
  const [costs, setCosts] = useState<VehicleCost[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCosts, setTotalCosts] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  
  // Filtros
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Modal Criar/Editar
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCost, setEditingCost] = useState<VehicleCost | null>(null);
  const [formData, setFormData] = useState<VehicleCostCreate>({
    vehicle_id: 0,
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  });
  const [displayDate, setDisplayDate] = useState(''); // Data no formato DD/MM/YYYY
  const [saving, setSaving] = useState(false);
  
  // Funções de conversão de data
  const formatDateToBR = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };
  
  const formatDateToISO = (brDate: string): string => {
    if (!brDate) return '';
    const cleaned = brDate.replace(/\D/g, '');
    if (cleaned.length !== 8) return '';
    const day = cleaned.substring(0, 2);
    const month = cleaned.substring(2, 4);
    const year = cleaned.substring(4, 8);
    return `${year}-${month}-${day}`;
  };
  
  const handleDateChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 3) {
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    }
    if (cleaned.length >= 5) {
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`;
    }
    setDisplayDate(formatted);
    if (cleaned.length === 8) {
      const isoDate = formatDateToISO(formatted);
      setFormData({ ...formData, date: isoDate });
    }
  };
  
  // Menu de Veículo
  const [vehicleMenuVisible, setVehicleMenuVisible] = useState(false);
  
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, [selectedVehicleId, selectedMonth, selectedYear, page]);

  const loadData = async () => {
    if (isLoadingPage) return;
    
    try {
      setLoading(true);
      setIsLoadingPage(true);

      const [costsResult, vehiclesResult] = await Promise.all([
        vehicleCostService.getCosts({
          vehicle_id: selectedVehicleId,
          month: selectedMonth,
          year: selectedYear,
          page,
          limit: 10,
        }),
        vehicleService.getVehicles(1, 100),
      ]);

      if (costsResult.success && costsResult.data) {
        setCosts(costsResult.data.costs);
        setTotalPages(costsResult.data.total_pages);
        setTotalAmount(costsResult.data.total_amount);
        setTotalCosts(costsResult.data.total);
      }

      if (vehiclesResult.success && vehiclesResult.data) {
        setVehicles(vehiclesResult.data.vehicles);
      }
    } catch (error) {
      console.error('Error loading costs:', error);
      Alert.alert('Erro', 'Erro ao carregar custos');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingPage(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadData();
  };

  const openCreateModal = () => {
    setEditingCost(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      vehicle_id: vehicles[0]?.id || 0,
      description: '',
      amount: 0,
      date: today,
    });
    setDisplayDate(formatDateToBR(today));
    setModalVisible(true);
  };

  const openEditModal = (cost: VehicleCost) => {
    setEditingCost(cost);
    setFormData({
      vehicle_id: cost.vehicle_id,
      description: cost.description,
      amount: cost.amount,
      date: cost.date,
    });
    setDisplayDate(formatDateToBR(cost.date));
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCost(null);
    setFormData({
      vehicle_id: 0,
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleSave = async () => {
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return;
    }

    if (formData.amount <= 0) {
      Alert.alert('Erro', 'Valor deve ser maior que zero');
      return;
    }

    if (!formData.vehicle_id) {
      Alert.alert('Erro', 'Selecione um veículo');
      return;
    }

    setSaving(true);
    try {
      let result;
      if (editingCost) {
        result = await vehicleCostService.updateCost(editingCost.id, {
          description: formData.description,
          amount: formData.amount,
          date: formData.date,
        });
      } else {
        result = await vehicleCostService.createCost(formData);
      }

      if (result.success) {
        Alert.alert('Sucesso', editingCost ? 'Custo atualizado' : 'Custo criado');
        closeModal();
        loadData();
      } else {
        Alert.alert('Erro', result.error || 'Erro ao salvar custo');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar custo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cost: VehicleCost) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o custo "${cost.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const result = await vehicleCostService.deleteCost(cost.id);
            if (result.success) {
              Alert.alert('Sucesso', 'Custo excluído');
              loadData();
            } else {
              Alert.alert('Erro', result.error || 'Erro ao excluir custo');
            }
          },
        },
      ]
    );
  };

  const getSelectedVehicle = () => {
    return vehicles.find(v => v.id === selectedVehicleId);
  };

  if (loading && costs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando custos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Custos de Veículos</Title>
        <Text style={styles.headerSubtitle}>
          Total: {totalCosts} custos • {formatCurrency(totalAmount)}
        </Text>
      </Surface>

      {/* Filtros */}
      <Surface style={styles.filtersCard}>
        <Text style={styles.filtersTitle}>Filtros</Text>
        
        {/* Filtro de Veículo */}
        <Menu
          visible={vehicleMenuVisible}
          onDismiss={() => setVehicleMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setVehicleMenuVisible(true)}
              icon="car"
              style={{ marginBottom: 8 }}
            >
              {getSelectedVehicle()
                ? `${getSelectedVehicle()?.brand} ${getSelectedVehicle()?.model}`
                : 'Todos os Veículos'}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSelectedVehicleId(undefined);
              setVehicleMenuVisible(false);
              setPage(1);
            }}
            title="Todos os Veículos"
          />
          {vehicles.map(vehicle => (
            <Menu.Item
              key={vehicle.id}
              onPress={() => {
                setSelectedVehicleId(vehicle.id);
                setVehicleMenuVisible(false);
                setPage(1);
              }}
              title={`${vehicle.brand} ${vehicle.model} - ${vehicle.license_plate}`}
            />
          ))}
        </Menu>

        {/* Filtro de Período */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <Button
            mode="outlined"
            icon="calendar"
            style={{ flex: 1 }}
            onPress={() => {
              if (selectedMonth > 1) {
                setSelectedMonth(selectedMonth - 1);
              } else {
                setSelectedMonth(12);
                setSelectedYear(selectedYear - 1);
              }
              setPage(1);
            }}
          >
            Mês Anterior
          </Button>
          <Button
            mode="outlined"
            icon="calendar"
            style={{ flex: 1 }}
            onPress={() => {
              if (selectedMonth < 12) {
                setSelectedMonth(selectedMonth + 1);
              } else {
                setSelectedMonth(1);
                setSelectedYear(selectedYear + 1);
              }
              setPage(1);
            }}
          >
            Próximo Mês
          </Button>
        </View>

        <Chip style={{ alignSelf: 'center' }}>
          {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
          })}
        </Chip>
      </Surface>

      {/* Botão Novo Custo */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <Button
          mode="contained"
          onPress={openCreateModal}
          icon="plus"
          style={{ borderRadius: 8 }}
        >
          Novo Custo
        </Button>
      </View>

      {/* Paginação */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <Button
            mode="outlined"
            onPress={() => setPage(page - 1)}
            disabled={page === 1 || isLoadingPage}
            icon="chevron-left"
            compact
            loading={isLoadingPage && page > 1}
          >
            Anterior
          </Button>
          
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
              Página {page} de {totalPages}
            </Text>
          </View>
          
          <Button
            mode="outlined"
            onPress={() => setPage(page + 1)}
            disabled={page >= totalPages || isLoadingPage}
            icon="chevron-right"
            contentStyle={{ flexDirection: 'row-reverse' }}
            compact
            loading={isLoadingPage && page < totalPages}
          >
            Próxima
          </Button>
        </View>
      )}

      {/* Lista de Custos */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {costs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum custo encontrado</Text>
          </View>
        ) : (
          costs.map(cost => (
            <Card key={cost.id} style={styles.costCard}>
              <Card.Content>
                <View style={styles.costHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.costDescription}>{cost.description}</Text>
                    <Text style={styles.costVehicle}>
                      {cost.vehicle?.brand} {cost.vehicle?.model} - {cost.vehicle?.license_plate}
                    </Text>
                    <Text style={styles.costDate}>
                      {new Date(cost.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Text style={styles.costAmount}>{formatCurrency(cost.amount)}</Text>
                </View>

                <Divider style={{ marginVertical: 12 }} />

                <View style={styles.costActions}>
                  <Button
                    mode="outlined"
                    onPress={() => openEditModal(cost)}
                    icon="pencil"
                    compact
                    style={{ flex: 1, marginRight: 8 }}
                  >
                    Editar
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleDelete(cost)}
                    icon="delete"
                    compact
                    textColor="#F44336"
                    style={{ flex: 1 }}
                  >
                    Excluir
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Modal Criar/Editar */}
      <Portal>
        <Dialog visible={modalVisible} onDismiss={closeModal}>
          <Dialog.Title>{editingCost ? 'Editar Custo' : 'Novo Custo'}</Dialog.Title>
          
          <Dialog.Actions style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 }}>
            <Button onPress={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button onPress={handleSave} mode="contained" loading={saving} disabled={saving}>
              Salvar
            </Button>
          </Dialog.Actions>

          <Dialog.ScrollArea>
            <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled">
              {!editingCost && (
                <TextInput
                  label="Veículo *"
                  value={vehicles.find(v => v.id === formData.vehicle_id)?.brand || ''}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  disabled={true}
                  right={
                    <TextInput.Icon
                      icon="chevron-down"
                      onPress={() => setVehicleMenuVisible(true)}
                    />
                  }
                />
              )}

              <TextInput
                label="Descrição *"
                value={formData.description}
                onChangeText={text => setFormData({ ...formData, description: text })}
                mode="outlined"
                style={{ marginBottom: 12 }}
                disabled={saving}
              />

              <TextInput
                label="Valor *"
                value={formData.amount.toString()}
                onChangeText={text => {
                  // Permitir apenas números e ponto/vírgula decimal
                  const cleanText = text.replace(',', '.');
                  const value = parseFloat(cleanText) || 0;
                  setFormData({ ...formData, amount: value });
                }}
                mode="outlined"
                keyboardType="decimal-pad"
                style={{ marginBottom: 12 }}
                disabled={saving}
                left={<TextInput.Affix text="R$" />}
                placeholder="0.00"
              />

              <TextInput
                label="Data *"
                value={displayDate}
                onChangeText={handleDateChange}
                mode="outlined"
                keyboardType="numeric"
                style={{ marginBottom: 12 }}
                disabled={saving}
                placeholder="DD/MM/YYYY"
                maxLength={10}
              />
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>
    </View>
  );
}
