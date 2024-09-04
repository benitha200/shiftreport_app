
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions, Alert, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Menu, Searchbar } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomDatePicker from '../components/CustomDatePicker';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [summaryData, setSummaryData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(new Date('2024-08-01'));
  const [endDate, setEndDate] = useState(new Date('2024-08-31'));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedShift, setSelectedShift] = useState('All');
  const [selectedActivity, setSelectedActivity] = useState('All');
  const [shiftMenuVisible, setShiftMenuVisible] = useState(false);
  const [activityMenuVisible, setActivityMenuVisible] = useState(false);
  const [shiftSearchQuery, setShiftSearchQuery] = useState('');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');

  // New DatePickerButton component
  const DatePickerButton = ({ date, onPress, label }) => (
    <Button
      mode="outlined"
      onPress={onPress}
      style={styles.datePickerButton}
      icon="calendar"
    >
      {`${label}: ${formatDate(date)}`}
    </Button>
  );


  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      return 'Select a date';
    }
    return date.toISOString().split('T')[0];
  };

  console.log('Start Date:', startDate);
  console.log('End Date:', endDate);


  const onStartDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setStartDate(new Date(selectedDate));
    } else {
      console.error('Selected date is undefined or null');
    }
    setShowStartDatePicker(false);
  };

  const onEndDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setEndDate(new Date(selectedDate));
    } else {
      console.error('Selected date is undefined or null');
    }
    setShowEndDatePicker(false);
  };



  // const fetchSummaryData = async () => {
  //   try {
  //     console.log('Fetching summary data...');

  //     const requestData = {
  //       start_date: startDate.toISOString().split('T')[0],
  //       end_date: endDate.toISOString().split('T')[0],
  //     };

  //     console.log('Request data:', requestData);

  //     // Change the IP address to 10.0.2.2 when using an emulator
  //     const response = await axios.post(
  //       "http://38.242.200.169/api/shift-summary-report/",
  //       requestData,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     console.log('Response status:', response.status);
  //     console.log('Response data:', response.data);

  //     // Apply filters
  //     const filteredData = response.data.filter(item => {
  //       const itemDate = new Date(item.date);
  //       return (
  //         itemDate >= startDate &&
  //         itemDate <= endDate &&
  //         (selectedShift === 'All' || item.shift_no === parseInt(selectedShift)) &&
  //         (selectedActivity === 'All' || item.activity === selectedActivity)
  //       );
  //     });

  //     console.log('Filtered data:', filteredData);

  //     // Set the summary data state with the filtered data
  //     setSummaryData(filteredData);
  //   } catch (error) {
  //     console.error("Error fetching summary data:", error);
  //     if (error.response) {
  //       console.error("Error data:", error.response.data);
  //       console.error("Error status:", error.response.status);
  //       console.error("Error headers:", error.response.headers);
  //     } else if (error.request) {
  //       console.error("Error request:", error.request);
  //     } else {
  //       console.error('Error message:', error.message);
  //     }
  //   }
  // };

  const fetchSummaryData = async () => {
    try {
      console.log('Fetching summary data...');
  
      const requestData = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      };
  
      console.log('Request data:', requestData);
  
      // Change the IP address to 10.0.2.2 when using an emulator
      const response = await axios.post(
        "http://38.242.200.169/api/shift-summary-report/",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
  
      if (response.status === 200 && response.data.length > 0) {
        // Apply filters
        const filteredData = response.data.filter(item => {
          const itemDate = new Date(item.date);
          return (
            itemDate >= startDate &&
            itemDate <= endDate &&
            (selectedShift === 'All' || item.shift_no === parseInt(selectedShift)) &&
            (selectedActivity === 'All' || item.activity === selectedActivity)
          );
        });
  
        console.log('Filtered data:', filteredData);
  
        // Set the summary data state with the filtered data
        setSummaryData(filteredData);
      } else {
        setSummaryData([]); // No data found
        Alert.alert("No shifts found within the specified date range.");
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
      if (error.response && error.response.status === 404) {
        console.error("Error data:", error.response.data);
        setSummaryData([]); // Set to empty array if no data found
        Alert.alert("No shifts found within the specified date range.");
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, [startDate, endDate, selectedShift, selectedActivity]);
  
  useEffect(() => {
    if (summaryData.length > 0) {
      renderInputOutputChart(summaryData);
    }
  }, [summaryData]);
  

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSummaryData().then(() => setRefreshing(false));
  }, []);

  
  const renderCards = () => {
    const totalShifts = summaryData.length || 0;
    const totalInputKgs = summaryData.reduce((total, item) => total + item.total_input_kgs, 0) || 0;
    const totalOutputKgs = summaryData.reduce((total, item) => total + item.total_output_kgs, 0) || 0;
    const totalProductionLoss = summaryData.reduce((total, item) => total + item.production_loss, 0) || 0;
    const totalProductionGain = summaryData.reduce((total, item) => total + item.production_gain, 0) || 0;
  
    return (
      <View style={styles.cardsContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="calendar-clock" size={24} color="#4CAF50" style={{ alignSelf: 'center' }} />
            <Title style={{ alignSelf: 'center' }}>Total Shifts</Title>
            <Paragraph style={styles.cardValue}>{totalShifts}</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="weight-kilogram" size={24} color="#2196F3" style={{ alignSelf: 'center' }} />
            <Title style={{ alignSelf: 'center' }}>Total Input</Title>
            <Paragraph style={styles.cardValue}>{totalInputKgs.toFixed(0)} Kgs</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="package-variant" size={24} color="#FFC107" style={{ alignSelf: 'center' }} />
            <Title style={{ alignSelf: 'center' }}>Total Output</Title>
            <Paragraph style={styles.cardValue}>{totalOutputKgs.toFixed(0)} Kgs</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="trending-down" size={24} color="#F44336" style={{ alignSelf: 'center' }} />
            <Title style={{ alignSelf: 'center' }}>Production Loss</Title>
            <Paragraph style={styles.cardValue}>{totalProductionLoss.toFixed(0)} Kgs</Paragraph>
          </Card.Content>
        </Card>
    
      </View>
    );
  };
  
  const renderInputOutputChart = (data = summaryData) => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.noDataText}>No Data Available</Text>
        </View>
      );
    }
  
    const labels = data.map(item => `${item.shift_no}`);
    const inputData = data.map(item => item.total_input_kgs || 0);
    const outputData = data.map(item => item.total_output_kgs || 0);
  
    const chartData = {
      labels: labels,
      datasets: [
        {
          data: inputData,
          color: (opacity = 0.5) => `rgba(0, 0, 255, ${opacity})`, // Blue for input
          strokeWidth: 2,
        },
        {
          data: outputData,
          color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // Orange for output
          strokeWidth: 2,
        },
      ],
      legend: ['Input', 'Output'],
    };
  
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.title}>Input vs Output per Shift</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };
  
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.filterContainer}>
        {/* Date Filter */}
        <DatePickerButton
          date={startDate}
          onPress={() => setShowStartDatePicker(true)}
          label="Start"
        />
        <DatePickerButton
          date={endDate}
          onPress={() => setShowEndDatePicker(true)}
          label="End"
        />
        {/* Show Date Pickers */}
        {showStartDatePicker && (
          <CustomDatePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}
        {showEndDatePicker && (
          <CustomDatePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}
      </View>

      {renderCards()}
      {renderInputOutputChart()}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: 'rgb(255 255 255)',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexBasis: '100%',
    gap: 5,
    flexWrap: 'wrap',
    marginTop: 20,
    marginBottom: 30,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 20,
    justifyContent: 'center',
    textAlign: 'center',
    gap: 15,
  },
  searchbar: {
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  card: {
    flexBasis: '45%',
    marginBottom: 20,
    justifyContent: 'left',
    backgroundColor: 'rgb(248 250 252)',
    boxShadow: 'none',
    elevation: 1,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  tooltipText: {
    color: 'white',
    fontSize: 12,
  },
  chartContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  }
});