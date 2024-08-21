import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

export default function AddShiftScreen({ navigation, route }) {
  const [shiftNo, setShiftNo] = useState('');
  const [activity, setActivity] = useState('');
  const [date, setDate] = useState('');

  const { setShifts } = route.params;

  const handleAddShift = async () => {
    const newShift = {
      shift_no: shiftNo,
      activity,
      date,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/shifts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newShift),
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert('Success', `Shift added with ID: ${result.id}`);
        setShifts((prevShifts) => [...prevShifts, result]);
        navigation.goBack();
      } else {
        const error = await response.text();
        Alert.alert('Error', `Failed to add shift: ${error}`);
      }
    } catch (error) {
      Alert.alert('Error', `Network error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Shift No"
        value={shiftNo}
        onChangeText={setShiftNo}
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
