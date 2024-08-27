import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { DataTable, FAB, Searchbar,Text,useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import axios from 'axios';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const [shifts, setShifts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');


  
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        console.log('Fetching shifts...');
        
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
          console.error('No token found');
          Alert.alert('Error', 'You are not logged in. Please log in and try again.');
          return;
        }
        
        console.log('Token retrieved successfully');
  
        const response = await axios.get("http://192.168.81.57:8000/api/shifts/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
  
        setShifts(response.data);
      } catch (error) {
        console.error('Error fetching shifts:', error);
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error data:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
        }
  
        Alert.alert('Error', 'Failed to fetch shifts. Please check your connection and try again.');
      }
    };
  
    fetchShifts();
  }, []);


  const onChangeSearch = (query) => setSearchQuery(query);

  const filteredShifts = shifts.filter((shift) => {
    const shiftNo = shift.shift_no || '';
    const activity = shift.activity || '';
    const date = shift.date || '';
    const shiftType = shift.shift_type || '';
    const supplier = shift.supplier || '';
    const coffeeType = shift.coffee_type || '';
    
    return (
      shiftNo.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      date.includes(searchQuery) ||
      shiftType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coffeeType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderItem = ({ item }) => (
    <DataTable.Row onPress={() => navigation.navigate('Shift Details', { shiftId: item.id })} style={styles.row}>
      <DataTable.Cell style={styles.cell}>{item.shift_no}</DataTable.Cell>
      <DataTable.Cell style={styles.cell}>{item.activity}</DataTable.Cell>
      <DataTable.Cell style={styles.cell}>{item.date}</DataTable.Cell>
      <DataTable.Cell style={styles.cell}>{item.shift_type}</DataTable.Cell>
      <DataTable.Cell style={styles.cell}>{item.supplier}</DataTable.Cell>
      <DataTable.Cell style={styles.cell}>{item.coffee_type}</DataTable.Cell>
    </DataTable.Row>
  );

  return (
    <View style={styles.container}>
  
      <Searchbar
        placeholder="Search shifts"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
        iconColor={colors.primary}
      />
      <DataTable style={styles.table}>
        <DataTable.Header style={styles.tableHeader}>
          <DataTable.Title style={styles.headerCell}>Shift No</DataTable.Title>
          <DataTable.Title style={styles.headerCell}>Activity</DataTable.Title>
          <DataTable.Title style={styles.headerCell}>Date</DataTable.Title>
          <DataTable.Title style={styles.headerCell}>Type</DataTable.Title>
          <DataTable.Title style={styles.headerCell}>Supplier</DataTable.Title>
          <DataTable.Title style={styles.headerCell}>Coffee</DataTable.Title>
        </DataTable.Header>
        <FlatList
          data={filteredShifts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </DataTable>
      <FAB
        style={[styles.fab, { backgroundColor: colors.primary }]}
        icon="plus"
        label='Add Shift'
        onPress={() => navigation.navigate('Add Shift', { setShifts })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  searchbar: {
    margin: 16,
    elevation: 4,
    backgroundColor:'rgb(226 232 240)',
  },
  searchInput: {
    fontSize: 16,
  },
  table: {
    backgroundColor: '#ffffff',
    margin: 0,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
  },
  tableHeader: {
    backgroundColor: 'rgb(226 232 240)',
  },
  headerCell: {
    justifyContent: 'center',
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cell: {
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});