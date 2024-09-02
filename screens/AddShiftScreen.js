import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Menu, Title } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export default function AddShiftScreen({ navigation, route }) {
  const [shiftNo, setShiftNo] = useState('');
  const [activity, setActivity] = useState('');
  const [date, setDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [shiftType, setShiftType] = useState('');
  const [coffeeType, setCoffeeType] = useState('');
  const [outputBatchNo, setOutputBatchNo] = useState('');
  const [locationOfBatch, setLocationOfBatch] = useState('');
  const [totalKgs, setTotalKgs] = useState('');
  const [totalBags, setTotalBags] = useState('');

  const [showActivityDropDown, setShowActivityDropDown] = useState(false);
  const [showSupplierDropDown, setShowSupplierDropDown] = useState(false);
  const [showShiftTypeDropDown, setShowShiftTypeDropDown] = useState(false);
  const [showCoffeeTypeDropDown, setShowCoffeeTypeDropDown] = useState(false);

  const { setShifts } = route.params;

  // Function to calculate bags based on total kgs
  const calculateBags = (kgs) => {
    const numKgs = parseFloat(kgs);
    if (isNaN(numKgs) || numKgs <= 0) return '0';
    if (numKgs <= 60) return '1';
    return Math.ceil(numKgs / 60).toString();
  };

  // Update totalBags when totalKgs changes
  useEffect(() => {
    if (totalKgs) {
      const calculatedBags = calculateBags(totalKgs);
      setTotalBags(calculatedBags);
    }
  }, [totalKgs]);

  const handleTotalKgsChange = (value) => {
    setTotalKgs(value);
    // The useEffect hook will handle updating totalBags
  };

  // const handleAddShift = async () => {
  //   const newShift = {
  //     shift_no: parseInt(shiftNo),
  //     activity,
  //     date,
  //     supplier,
  //     shift_type: shiftType,
  //     coffee_type: coffeeType,
  //     output_batchno: parseInt(outputBatchNo),
  //     location_of_batch: locationOfBatch,
  //     total_kgs: parseFloat(totalKgs),
  //     total_bags: parseInt(totalBags),
  //   };

  //   try {
  //     const token = await AsyncStorage.getItem('token');

  //     if (!token) {
  //       console.error('No token found');
  //       Alert.alert('Error', 'You are not logged in. Please log in and try again.');
  //       return;
  //     }

  //     const response = await fetch('http://192.168.81.57:8000/api/shifts/', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(newShift),
  //     });

  //     if (response.ok) {
  //       const result = await response.json();
  //       Alert.alert('Success', 'Shift added successfully');
  //       setShifts((prevShifts) => [...prevShifts, result]);
  //     } else if (response.status === 401) {
  //       Alert.alert('Error', 'Unauthorized. Please log in again.');
  //       await AsyncStorage.clear();
  //       navigation.navigate('Login');
  //     } else if (response.status === 403) {
  //       Alert.alert('Error', 'You do not have permission to add shifts');
  //     } else if (response.status === 422) {
  //       const errorData = await response.json();
  //       const errors = errorData.errors.map((error) => error.message).join('\n');
  //       Alert.alert('Error', errors);
  //     }
  //     else if (response.status === 500) {
  //       Alert.alert('Error', 'Failed to add shift. Shift No already exists');
  //     } else {
  //       const errorText = await response.text();
  //       console.error('Server response:', response.status, errorText);
  //       Alert.alert('Error', `Failed to add shift. Server responded with status ${response.status}`);
  //     }
  //   } catch (error) {
  //     console.error('Error adding shift:', error);
  //     Alert.alert('Error', `Network error: ${error.message}`);
  //   }
  // };

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
      total_kgs: parseFloat(totalKgs),
      total_bags: parseInt(totalBags),
    };

    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        console.error('No token found');
        Alert.alert('Error', 'You are not logged in. Please log in and try again.');
        return;
      }

      const response = await fetch('http://192.168.81.129:8000/api/shifts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newShift),
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert('Success', 'Shift added successfully');
        setShifts((prevShifts) => [...prevShifts, result]);

        navigation.push('ShiftDetailsScreen', { shiftId: result.id });


      } else if (response.status === 401) {
        Alert.alert('Error', 'Unauthorized. Please log in again.');
        await AsyncStorage.clear();
        navigation.navigate('Login');
      } else if (response.status === 403) {
        Alert.alert('Error', 'You do not have permission to add shifts');
      } else if (response.status === 422) {
        const errorData = await response.json();
        const errors = errorData.errors.map((error) => error.message).join('\n');
        Alert.alert('Error', errors);
      }
      else if (response.status === 500) {
        Alert.alert('Error', 'Failed to add shift. Shift No already exists');
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


  const renderDropdown = (value, setValue, showDropDown, setShowDropDown, list, label) => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.selectContainer}>
          <Title style={styles.inputLabel}>{label}*</Title>
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={styles.select}
          >
            <option value="" disabled>Select {label.toLowerCase()}</option>
            {list.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </View>
      );
    } else {
      return (
        <Menu
          visible={showDropDown}
          onDismiss={() => setShowDropDown(false)}
          anchor={
            <Button mode="outlined" onPress={() => setShowDropDown(true)} style={styles.input}>
              {value || `Select ${label}*`}
            </Button>
          }
        >
          {list.map((item) => (
            <Menu.Item
              key={item}
              onPress={() => {
                setValue(item);
                setShowDropDown(false);
              }}
              title={item}
            />
          ))}
        </Menu>
      );
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Shift No*"
        value={shiftNo}
        onChangeText={setShiftNo}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
      />
      {renderDropdown(
        activity,
        setActivity,
        showActivityDropDown,
        setShowActivityDropDown,
        ['Processing', 'Bagging Off', 'Repass'],
        'Activity'
      )}
      <TextInput
        label="Date (YYYY-MM-DD)*"
        value={date}
        onChangeText={setDate}
        style={styles.input}
        mode="outlined"
      />
      {renderDropdown(
        supplier,
        setSupplier,
        showSupplierDropDown,
        setShowSupplierDropDown,
        ['BAHO', 'BENDER', 'BESTFARMER', 'NGAMBA'],
        'Supplier'
      )}
      {renderDropdown(
        shiftType,
        setShiftType,
        showShiftTypeDropDown,
        setShowShiftTypeDropDown,
        ['DAY', 'NIGHT'],
        'Shift Type'
      )}
      {renderDropdown(
        coffeeType,
        setCoffeeType,
        showCoffeeTypeDropDown,
        setShowCoffeeTypeDropDown,
        ['SC 15', 'SC13'],
        'Coffee Type'
      )}

      <TextInput
        label="Output Batch No*"
        value={outputBatchNo}
        onChangeText={setOutputBatchNo}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Location of Batch*"
        value={locationOfBatch}
        onChangeText={setLocationOfBatch}
        style={styles.input}
        mode="outlined"
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
  selectContainer: {
    marginBottom: 10,
  },
  select: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
});

// import React, { useState } from 'react';
// import { View, StyleSheet, Alert } from 'react-native';
// import { TextInput, Button,Menu } from 'react-native-paper';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Platform } from 'react-native';

// export default function AddShiftScreen({ navigation, route }) {
//   const [shiftNo, setShiftNo] = useState('');
//   const [activity, setActivity] = useState('');
//   const [date, setDate] = useState('');
//   const [supplier, setSupplier] = useState('');
//   const [shiftType, setShiftType] = useState('');
//   const [coffeeType, setCoffeeType] = useState('');
//   const [outputBatchNo, setOutputBatchNo] = useState('');
//   const [locationOfBatch, setLocationOfBatch] = useState('');

//   const [showActivityDropDown, setShowActivityDropDown] = useState(false);
//   const [showSupplierDropDown, setShowSupplierDropDown] = useState(false);
//   const [showShiftTypeDropDown, setShowShiftTypeDropDown] = useState(false);
//   const [showCoffeeTypeDropDown, setShowCoffeeTypeDropDown] = useState(false);

//   const { setShifts } = route.params;
  
  
//   const handleAddShift = async () => {
//     const newShift = {
//       shift_no: parseInt(shiftNo),
//       activity,
//       date,
//       supplier,
//       shift_type: shiftType,
//       coffee_type: coffeeType,
//       output_batchno: parseInt(outputBatchNo),
//       location_of_batch: locationOfBatch,
//     };
  
//     try {
//       const token = await AsyncStorage.getItem('token');
  
//       if (!token) {
//         console.error('No token found');
//         Alert.alert('Error', 'You are not logged in. Please log in and try again.');
//         return;
//       }
  
//       const response = await fetch('http://192.168.81.129:8000/api/shifts/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify(newShift),
//       });


  
//       if (response.ok) {
//         const result = await response.json();
//         // Alert.alert('Success', `Shift added with ID: ${result.id}`);
//         Alert.alert('Success', `Shift added successfully`);
//         setShifts((prevShifts) => [...prevShifts, result]);
//         navigation.goBack();
//       } else if (response.status === 500) {
//         Alert.alert('Error', 'Failed to add shift. Shift No already exists');
//       } else {
//         const errorText = await response.text();
//         console.error('Server response:', response.status, errorText);
//         Alert.alert('Error', `Failed to add shift. Server responded with status ${response.status}`);
//       }
//     } catch (error) {
//       console.error('Error adding shift:', error);
//       Alert.alert('Error', `Network error: ${error.message}`);
//     }
//   };

//   const renderDropdown = (value, setValue, showDropDown, setShowDropDown, list, label) => {
//     if (Platform.OS === 'web') {
//       return (
//         <View style={styles.selectContainer}>
//           <Title style={styles.inputLabel}>{label}*</Title>
//           <select
//             value={value}
//             onChange={(e) => setValue(e.target.value)}
//             style={styles.select}
//           >
//             <option value="" disabled>Select {label.toLowerCase()}</option>
//             {list.map((item) => (
//               <option key={item} value={item}>{item}</option>
//             ))}
//           </select>
//         </View>
//       );
//     } else {
//       return (
//         <Menu
//           visible={showDropDown}
//           onDismiss={() => setShowDropDown(false)}
//           anchor={
//             <Button mode="elevated" onPress={() => setShowDropDown(true)} style={styles.input}>
//               {value || `Select ${label}*`}
//             </Button>
//           }
//         >
//           {list.map((item) => (
//             <Menu.Item
//               key={item}
//               onPress={() => {
//                 setValue(item);
//                 setShowDropDown(false);
//               }}
//               title={item}
//             />
//           ))}
//         </Menu>
//       );
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TextInput
//         label="Shift No"
//         value={shiftNo}
//         onChangeText={setShiftNo}
//         keyboardType="numeric"
//         style={styles.input}
//         mode="outlined"
//       />
//       {renderDropdown(
//         activity,
//         setActivity,
//         showActivityDropDown,
//         setShowActivityDropDown,
//         ['Processing', 'Bagging Off', 'Repass'],
//         'Activity'
//       )}
//       <TextInput
//         label="Date (YYYY-MM-DD)"
//         value={date}
//         onChangeText={setDate}
//         style={styles.input}
//         mode="outlined"
//       />
//       {renderDropdown(
//         supplier,
//         setSupplier,
//         showSupplierDropDown,
//         setShowSupplierDropDown,
//         ['BAHO', 'BENDER', 'BESTFARMER', 'NGAMBA'],
//         'Supplier'
//       )}
//       {renderDropdown(
//         shiftType,
//         setShiftType,
//         showShiftTypeDropDown,
//         setShowShiftTypeDropDown,
//         ['DAY', 'NIGHT'],
//         'Shift Type'
//       )}
//       {renderDropdown(
//         coffeeType,
//         setCoffeeType,
//         showCoffeeTypeDropDown,
//         setShowCoffeeTypeDropDown,
//         ['SC 15', 'SC13'],
//         'Coffee Type'
//       )}
//       <TextInput
//         label="Output Batch No"
//         value={outputBatchNo}
//         onChangeText={setOutputBatchNo}
//         keyboardType="numeric"
//         style={styles.input}
//         mode="outlined"
//       />
//       <TextInput
//         label="Location of Batch"
//         value={locationOfBatch}
//         onChangeText={setLocationOfBatch}
//         style={styles.input}
//         mode='outlined'
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
//     textAlign:'left'
//   },
//   button: {
//     marginTop: 20,
//     backgroundColor: '#008080',
//     // borderRadius:'0 !important',
//   },
// });