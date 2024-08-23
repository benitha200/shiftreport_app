import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { DataTable, FAB, Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [shifts, setShifts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
          console.error('No token found');
          Alert.alert('Error', 'You are not logged in. Please log in and try again.');
          return;
        }
  
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
  
        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        };
  
        const response = await fetch("http://127.0.0.1:8000/api/shifts/", requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setShifts(data);
      } catch (error) {
        console.error('Error fetching shifts:', error);
        Alert.alert('Error', 'Failed to fetch shifts. Please check your connection and try again.');
      }
    };
  
    fetchShifts();
  }, []);

  // Fetch shifts from API
  // useEffect(() => {
  //   // fetch('http://127.0.0.1:8000/api/shifts/')
  //   //   .then(response => response.json())
  //   //   .then(data => setShifts(data))
  //   //   .catch(error => {
  //   //     console.error('Error fetching shifts:', error);
  //   //     Alert.alert('Error', 'Failed to fetch shifts.');
  //   //   });
  // }, []);

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
    <DataTable.Row onPress={() => navigation.navigate('Shift Details', { shiftId: item.id })}>
      <DataTable.Cell>{item.shift_no}</DataTable.Cell>
      <DataTable.Cell>{item.activity}</DataTable.Cell>
      <DataTable.Cell>{item.date}</DataTable.Cell>
      <DataTable.Cell>{item.shift_type}</DataTable.Cell>
      <DataTable.Cell>{item.supplier}</DataTable.Cell>
      <DataTable.Cell>{item.coffee_type}</DataTable.Cell>
    </DataTable.Row>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search shifts"
        onChangeText={onChangeSearch}
        className="text-red"
        value={searchQuery}
        style={styles.searchbar}
      />
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Shift No</DataTable.Title>
          <DataTable.Title>Activity</DataTable.Title>
          <DataTable.Title>Date</DataTable.Title>
          <DataTable.Title>Shift Type</DataTable.Title>
          <DataTable.Title>Supplier</DataTable.Title>
          <DataTable.Title>Coffee Type</DataTable.Title>
        </DataTable.Header>
        <FlatList
          data={filteredShifts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </DataTable>
      <FAB
        style={styles.fab}
        label='Add Shift'
        onPress={() => navigation.navigate('Add Shift', { setShifts })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchbar: {
    margin: 10,
    backgroundColor:'rgb(226 232 240)'
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    color:'#ffffff',
    backgroundColor: 'rgb(13 148 136)',
  },
});
