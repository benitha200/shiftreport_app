// import React, { useState } from 'react';
// import { View, StyleSheet, Alert } from 'react-native';
// import { TextInput, Button } from 'react-native-paper';

// export default function AddShiftScreen({ navigation, route }) {
//   const [shiftNo, setShiftNo] = useState('');
//   const [activity, setActivity] = useState('');
//   const [date, setDate] = useState('');

//   const { setShifts } = route.params;

//   const handleAddShift = async () => {
//     const newShift = {
//       shift_no: shiftNo,
//       activity,
//       date,
//     };

//     try {
//       const response = await fetch('http://192.168.81.57:8000/api/shifts/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(newShift),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         Alert.alert('Success', `Shift added with ID: ${result.id}`);
//         setShifts((prevShifts) => [...prevShifts, result]);
//         navigation.goBack();
//       } else {
//         const error = await response.text();
//         Alert.alert('Error', `Failed to add shift: ${error}`);
//       }
//     } catch (error) {
//       Alert.alert('Error', `Network error: ${error.message}`);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TextInput
//         label="Shift No"
//         value={shiftNo}
//         onChangeText={setShiftNo}
//         style={styles.input}
//       />
//       <TextInput
//         label="Activity"
//         value={activity}
//         onChangeText={setActivity}
//         style={styles.input}
//       />
//       <TextInput
//         label="Date (YYYY-MM-DD)"
//         value={date}
//         onChangeText={setDate}
//         style={styles.input}
//       />
//       <Button mode="contained" onPress={handleAddShift} style={styles.button}>
//         Add Shift
//       </Button>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f0f8ff',
//   },
//   input: {
//     marginBottom: 10,
//   },
//   button: {
//     marginTop: 20,
//     backgroundColor: '#008080',
//   },
// });

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddShiftScreen({ navigation, route }) {
  const [shiftNo, setShiftNo] = useState('');
  const [activity, setActivity] = useState('');
  const [date, setDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [shiftType, setShiftType] = useState('');
  const [coffeeType, setCoffeeType] = useState('');
  const [outputBatchNo, setOutputBatchNo] = useState('');
  const [locationOfBatch, setLocationOfBatch] = useState('');

  const { setShifts } = route.params;
  
  
  const handleAddShift = async () => {
    const newShift = {
      shift_no: parseInt(shiftNo),
      activity,
      date,
      supplier,
      shift_type: shiftType,
      coffee_type: coffeeType,
      output_batchno: parseInt(outputBatchNo),
      location_of_batch: locationOfBatch,
    };
  
    try {
      const token = await AsyncStorage.getItem('token');
  
      if (!token) {
        console.error('No token found');
        Alert.alert('Error', 'You are not logged in. Please log in and try again.');
        return;
      }
  
      const response = await fetch('http://192.168.81.57:8000/api/shifts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newShift),
      });
  
      if (response.ok) {
        const result = await response.json();
        Alert.alert('Success', `Shift added with ID: ${result.id}`);
        setShifts((prevShifts) => [...prevShifts, result]);
        navigation.goBack();
      } else {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        Alert.alert('Error', `Failed to add shift. Server responded with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding shift:', error);
      Alert.alert('Error', `Network error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Shift No"
        value={shiftNo}
        onChangeText={setShiftNo}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Activity"
        value={activity}
        onChangeText={setActivity}
        style={styles.input}
      />
      <TextInput
        label="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        style={styles.input}
      />
      <TextInput
        label="Supplier"
        value={supplier}
        onChangeText={setSupplier}
        style={styles.input}
      />
      <TextInput
        label="Shift Type"
        value={shiftType}
        onChangeText={setShiftType}
        style={styles.input}
      />
      <TextInput
        label="Coffee Type"
        value={coffeeType}
        onChangeText={setCoffeeType}
        style={styles.input}
      />
      <TextInput
        label="Output Batch No"
        value={outputBatchNo}
        onChangeText={setOutputBatchNo}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Location of Batch"
        value={locationOfBatch}
        onChangeText={setLocationOfBatch}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleAddShift} style={styles.button}>
        Add Shift
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f8ff',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#008080',
  },
});