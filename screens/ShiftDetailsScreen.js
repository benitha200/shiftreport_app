import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Text } from 'react-native';
import { Card, Title, Paragraph, DataTable, TextInput, Button, Menu } from 'react-native-paper';

export default function ShiftDetailsScreen({ route, navigation }) {
  const { shiftId } = route.params;
  const [shiftDetails, setShiftDetails] = useState(null);
  const [supplier, setSupplier] = useState('');
  const [grade, setGrade] = useState('');
  const [showGradeDropDown, setShowGradeDropDown] = useState(false);
  const [totalkgs, setTotalkgs] = useState('');
  const [totalbags, setTotalbags] = useState('');
  const [batchnogrn, setBatchnogrn] = useState('');
  const [cell, setCell] = useState('');
  const [tableData, setTableData] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const gradeList = ['F.SC.15', 'F.SC.13', 'F.CSR.15', 'F.GTR.15', 'FW.TRI', 'SC.15', 'SC.13'];

  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        const response = await fetch(`http://192.168.81.129:8000/api/shifts/${shiftId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        setShiftDetails(result);
        setIsCompleted(result.status);
      } catch (error) {
        console.error('Error fetching shift details:', error);
        Alert.alert('Error', 'Failed to fetch shift details.');
      }
    };


    const fetchShiftEntries = async () => {
      try {
        const response = await fetch(`http://192.168.81.129:8000/api/shiftdetail/${shiftId}/`);
        if (response.ok) {
          const data = await response.json();
          setTableData(Array.isArray(data) ? data : []);
        } else {
          setTableData([]);
        }
      } catch (error) {
        console.error('Error fetching shift details:', error);
        Alert.alert('Error', 'Failed to fetch shift details.');
        setTableData([]);
      }
    };

    fetchShiftDetails();
    fetchShiftEntries();
  }, [shiftId]);

  const calculateBags = (kgs) => {
    const numKgs = parseFloat(kgs);
    if (isNaN(numKgs) || numKgs <= 0) return '0';
    if (numKgs <= 60) return '1';
    return Math.ceil(numKgs / 60).toString();
  };


  useEffect(() => {
    if (totalkgs) {
      const calculatedBags = calculateBags(totalkgs);
      setTotalbags(calculatedBags);
    }
  }, [totalkgs]);

  const handleTotalKgsChange = (value) => {
    setTotalkgs(value);
  };

  const canCloseShiftReport = () => {
    const inputEntries = tableData.filter(item => item.entry_type === 'Input').length;
    const outputEntries = tableData.filter(item => item.entry_type === 'Output').length;
    return inputEntries > 0 && outputEntries > 0;
  };
  const handleCloseShiftReport = () => {
    // Alert.alert('Shift Report Closed', 'The shift report has been successfully closed.');
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "csrftoken=m4Li2tWC0w0QKzBHV7e8tal2rnYqh6nj");

    const raw = JSON.stringify({
      "status": "True"
    });

    const requestOptions = {
      method: "PATCH",
      headers: myHeaders,
      body: raw,
    };

    fetch(`http://192.168.81.129:8000/api/shifts/${shiftId}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result)
        // setIsFormVisible(false);
        setIsCompleted(true);
        Alert.alert('Shift report completed!');
      })
      .catch((error) => console.error(error));
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

  const validateInputs = () => {
    if (!grade || !totalkgs || !totalbags || !batchnogrn || !cell) {
      Alert.alert('Error', 'All fields are required');
      return false;
    }
    return true;
  };

  const handleAddEntry = (type) => {
    if (!validateInputs()) return;

    const newEntry = {
      shift_id: shiftId,
      grade,
      total_kgs: totalkgs,
      total_bags: totalbags,
      batchno_grn: batchnogrn,
      cell,
      entry_type: type,
    };

    fetch('http://192.168.81.129:8000/api/shiftdetails/', {
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

  const renderTable = (type) => {
    const filteredData = Array.isArray(tableData)
      ? tableData.filter(item => item.entry_type === type)
      : [];

    const totals = filteredData.reduce((acc, item) => ({
      total_kgs: acc.total_kgs + parseFloat(item.total_kgs || 0),
      total_bags: acc.total_bags + parseInt(item.total_bags || 0)
    }), { total_kgs: 0, total_bags: 0 });

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{type} Entries</Title>
          <DataTable>
            <DataTable.Header style={styles.tableHeader}>
              {['Grade', 'Kgs', 'Bags', 'Batch No/GRN', 'Cell'].map((title, index) => (
                <DataTable.Title key={index} style={styles.cell}>
                  <Text style={styles.headerText}>{title}</Text>
                </DataTable.Title>
              ))}
            </DataTable.Header>

            {filteredData.map((item) => (
              <DataTable.Row key={item.id}>
                {['grade', 'total_kgs', 'total_bags', 'batchno_grn', 'cell'].map((field, index) => (
                  <DataTable.Cell key={index} style={styles.cell} numeric={field === 'total_kgs' || field === 'total_bags'}>
                    {item[field]}
                  </DataTable.Cell>
                ))}
              </DataTable.Row>
            ))}

            <DataTable.Row style={styles.totalRow}>
              <DataTable.Cell style={styles.cell}>
                <Text style={styles.totalText}>Total</Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.cell} numeric>
                <Text style={styles.totalText}>{totals.total_kgs.toFixed(0)} </Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.cell} numeric>
                <Text style={styles.totalText}>{totals.total_bags} </Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.cell}></DataTable.Cell>
              <DataTable.Cell style={styles.cell}></DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>
    );
  }

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
              <Paragraph>Shift Type: {shiftDetails.shift_type || 'N/A'}</Paragraph>
              <Paragraph>Supplier: <Paragraph style={styles.textStyle}>{shiftDetails.supplier || 'N/A'}</Paragraph></Paragraph>
              <Paragraph>Coffee Type: {shiftDetails.coffee_type || 'N/A'}</Paragraph>
            </View>
            {canCloseShiftReport() && !isCompleted &&(
              <View style={styles.closeShiftContainer}>
                <Button mode="contained" onPress={handleCloseShiftReport} style={styles.closeShiftButton}>
                  Complete Shift Report
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

{!isCompleted && (
      <Card style={styles.card}>
        <Card.Content>
          <Title>Add Entry</Title>
          {renderDropdown(grade, setGrade, showGradeDropDown, setShowGradeDropDown, gradeList, 'Grade')}

          <TextInput
            label="Total Kgs*"
            value={totalkgs}
            onChangeText={handleTotalKgsChange}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Total Bags*"
            value={totalbags}
            onChangeText={setTotalbags}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            readOnly="true"
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
              Add Outputs
            </Button>
            <Button mode="contained" onPress={() => handleAddEntry('Balance')} style={[styles.button, styles.balanceButton]}>
              Add Balance
            </Button>
          </View>
        </Card.Content>
      </Card>)}

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
    flexWrap: 'wrap',
    marginTop: 10,
  },
  button: {
    flexBasis: '45%',
    margin: 5,
    marginHorizontal: 5,
    textAlign: 'left',
  },
  inputButton: {
    backgroundColor: 'rgb(148 163 184)',
  },
  outputButton: {
    backgroundColor: 'rgb(5 150 105)',
  },
  balanceButton: {
    backgroundColor: 'rgb(2 132 199)',
  },
  cell: {
    flex: 1,
    justifyContent: 'left',
    padding: 5,
  },
  headerText: {
    fontWeight: 'bold',
  },
  tableHeader: {
    textAlign: 'left',
    backgroundColor: 'rgb(226 232 240)',
  },
  totalText: {
    fontWeight: 'bold',
    color: 'rgb(255 255 255)',
    padding: '0.02rem',
    textAlign: 'right',
    padding: 5,
  },
  totalRow: {
    backgroundColor: 'rgb(20 184 166)',
  },
  textStyle: {
    fontWeight: 'bold',
    color: 'rgb(15 118 110)',
    padding: 5,
  },
  closeShiftContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeShiftButton: {
    backgroundColor: 'rgb(21 128 61)', // Red color for attention
    padding: 2,
  },
});
