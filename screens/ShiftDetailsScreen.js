import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Text } from 'react-native';
import { Card, Title, Paragraph, DataTable, TextInput, Button, Menu } from 'react-native-paper';

export default function ShiftDetailsScreen({ route, navigation }) {
  const { shiftId } = route.params;
  const [shiftDetails, setShiftDetails] = useState(null);
  const [supplier, setSupplier] = useState('');
  const [grade, setGrade] = useState('');
  const [showSupplierDropDown, setShowSupplierDropDown] = useState(false);
  const [showGradeDropDown, setShowGradeDropDown] = useState(false);
  const [totalkgs, setTotalkgs] = useState('');
  const [totalbags, setTotalbags] = useState('');
  const [batchnogrn, setBatchnogrn] = useState('');
  const [cell, setCell] = useState('');
  const [tableData, setTableData] = useState([]);

  const supplierList = ['BAHO', 'BENDER', 'BESTFARMER', 'BUTARA', 'CAGEYO'];
  const gradeList = ['F.SC.15', 'F.SC.13', 'F.CSR.15', 'F.GTR.15', 'FW.TRI', 'SC.15', 'SC.13'];

  useEffect(() => {
    // Fetch shift details
    const fetchShiftDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/shifts/${shiftId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // body: JSON.stringify({ "shift_no": "001", "activity": "Processing", "date": "2024-08-19" })
        });
        const result = await response.json();
        setShiftDetails(result);
      } catch (error) {
        console.error('Error fetching shift details:', error);
        Alert.alert('Error', 'Failed to fetch shift details.');
      }
    };
  
    // Fetch shift entries
    const fetchShiftEntries = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/shiftdetail/${shiftId}/`);
        if (response.ok) {
          const data = await response.json();
          setTableData(Array.isArray(data) ? data : []); // Ensure tableData is always an array
        } else {
          // Handle case where response is not OK
          setTableData([]); // Set empty array if no data is found
        }
      } catch (error) {
        console.error('Error fetching shift details:', error);
        Alert.alert('Error', 'Failed to fetch shift details.');
        setTableData([]); // Set empty array in case of error
      }
    };
  
    fetchShiftDetails();
    fetchShiftEntries();
  }, [shiftId]);
  

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

  const validateInputs = () => {
    if (!supplier || !grade || !totalkgs || !totalbags || !batchnogrn || !cell) {
      Alert.alert('Error', 'All fields are required');
      return false;
    }
    return true;
  };

  const handleAddEntry = (type) => {
    if (!validateInputs()) return;

    const newEntry = {
      shift_id: shiftId, // Ensure shift_id is used
      supplier,
      grade,
      total_kgs: totalkgs,
      total_bags: totalbags,
      batchno_grn: batchnogrn,
      cell,
      entry_type: type,
    };

    fetch('http://127.0.0.1:8000/api/shiftdetails/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEntry),
    })
      .then(response => response.json())
      .then(result => {
        console.log(result);
        setTableData((prevData) => [...prevData, result]);
        resetInputs();
      })
      .catch(error => {
        console.error('Error adding entry:', error);
        Alert.alert('Error', 'Failed to add entry.');
      });
  };

  const resetInputs = () => {
    setSupplier('');
    setGrade('');
    setTotalkgs('');
    setTotalbags('');
    setBatchnogrn('');
    setCell('');
  };

  const renderTable = (type) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{type} Entries</Title>
        <DataTable>
          <DataTable.Header>
            {['Supplier', 'Grade', 'Kgs', 'Bags', 'Batch No/GRN', 'Cell'].map((title, index) => (
              <DataTable.Title key={index} style={styles.cell}>
                <Text style={styles.headerText}>{title}</Text>
              </DataTable.Title>
            ))}
          </DataTable.Header>
  
          {Array.isArray(tableData) && tableData
            .filter(item => item.entry_type === type)
            .map((item) => (
              <DataTable.Row key={item.id}>
                {['supplier', 'grade', 'total_kgs', 'total_bags', 'batchno_grn', 'cell'].map((field, index) => (
                  <DataTable.Cell key={index} style={styles.cell} numeric={field === 'total_kgs' || field === 'total_bags'}>
                    {item[field]}
                  </DataTable.Cell>
                ))}
              </DataTable.Row>
            ))}
        </DataTable>
      </Card.Content>
    </Card>
  );
  
  return (
    <ScrollView style={styles.container}>
      {shiftDetails && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Shift Details</Title>
            <View>
              <Paragraph>Shift No: {shiftDetails.shift_no || 'N/A'}</Paragraph>
              <Paragraph>Activity: {shiftDetails.activity || 'N/A'}</Paragraph>
              <Paragraph>Date: {shiftDetails.date || 'N/A'}</Paragraph>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title>Add Entry</Title>
          {renderDropdown(supplier, setSupplier, showSupplierDropDown, setShowSupplierDropDown, supplierList, 'Supplier')}
          {renderDropdown(grade, setGrade, showGradeDropDown, setShowGradeDropDown, gradeList, 'Grade')}
          <TextInput
            label="Total Kgs"
            value={totalkgs}
            onChangeText={setTotalkgs}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Total Bags"
            value={totalbags}
            onChangeText={setTotalbags}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="GRN/Batch No"
            value={batchnogrn}
            onChangeText={setBatchnogrn}
            style={styles.input}
          />
          <TextInput
            label="Cell"
            value={cell}
            onChangeText={setCell}
            style={styles.input}
          />
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={() => handleAddEntry('Input')} style={[styles.button, styles.inputButton]}>
              Add Input
            </Button>
            <Button mode="contained" onPress={() => handleAddEntry('Output')} style={[styles.button, styles.outputButton]}>
              Add Output
            </Button>
            <Button mode="contained" onPress={() => handleAddEntry('Balance')} style={[styles.button, styles.balanceButton]}>
              Add Balance
            </Button>
          </View>
        </Card.Content>
      </Card>

      {renderTable('Input')}
      {renderTable('Output')}
      {renderTable('Balance')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgb(241 245 249)',
  },
  card: {
    marginBottom: 20,
    elevation: 4,
    backgroundColor: 'rgb(241 245 249)',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectContainer: {
    marginBottom: 10,
  },
  select: {
    width: '100%',
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 8,
    paddingRight: 8,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputButton: {
    backgroundColor: 'rgb(148 163 184)',
  },
  outputButton: {
    backgroundColor: '#F44336',
  },
  balanceButton: {
    backgroundColor: '#2196F3',
  },
  cell: {
    flex: 1,
    justifyContent: 'left',
    padding: 5,
  },
  headerText: {
    fontWeight: 'bold',
  },
});
