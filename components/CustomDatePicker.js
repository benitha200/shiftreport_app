import React, { useState } from 'react';
import { View, Platform,StyleSheet } from 'react-native';
import { Button, Modal, Portal, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

const CustomDatePicker = ({ date, onDateChange, label }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(date);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setTempDate(currentDate);
    onDateChange(currentDate);
  };

  const showDatepicker = () => {
    setShowPicker(true);
  };

  if (Platform.OS === 'web') {
    return (
      <View>
        <TextInput
          label={label}
          value={date.toDateString()}
          onFocus={showDatepicker}
          right={<TextInput.Icon icon="calendar" onPress={showDatepicker} />}
        />
        <Portal>
          <Modal visible={showPicker} onDismiss={() => setShowPicker(false)} contentContainerStyle={styles.modalContent}>
            <input
              type="date"
              value={tempDate.toISOString().split('T')[0]}
              onChange={(e) => onChange(null, new Date(e.target.value))}
              style={styles.webDateInput}
            />
            <Button onPress={() => setShowPicker(false)}>Close</Button>
          </Modal>
        </Portal>
      </View>
    );
  }

  return (
    <View>
      <Button onPress={showDatepicker} icon="calendar" mode="outlined">
        {date.toDateString()}
      </Button>
      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

export default CustomDatePicker;

const styles = StyleSheet.create({
    modalContent: {
      backgroundColor: 'white',
      padding: 20,
      margin: 20,
      borderRadius: 4,
    },
    webDateInput: {
      fontSize: 16,
      padding: 10,
      marginBottom: 10,
    },

  });