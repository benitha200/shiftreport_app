import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions, Alert, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Menu,Searchbar } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomDatePicker from '../components/CustomDatePicker';

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
  

  const fetchSummaryData = async () => {
    try {
      // Prepare headers and request body
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
  
      const raw = JSON.stringify({
        "start_date": startDate.toISOString().split('T')[0],
        "end_date": endDate.toISOString().split('T')[0],
      });
  
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
  
      // Fetch data from API
      const response = await fetch("http://127.0.0.1:8000/api/shift-summary-report/", requestOptions);
      const result = await response.json(); // Parse response to JSON
  
      // Apply filters
      const filteredData = result.filter(item => {
        const itemDate = new Date(item.date);
        return (
          itemDate >= startDate &&
          itemDate <= endDate &&
          (selectedShift === 'All' || item.shift_no === parseInt(selectedShift)) &&
          (selectedActivity === 'All' || item.activity === selectedActivity)
        );
      });
  
      // Set the summary data state with the filtered data
      setSummaryData(filteredData);
    } catch (error) {
      console.error("Error fetching summary data:", error);
    }
  };
  
  useEffect(() => {
    fetchSummaryData();
  }, [startDate, endDate, selectedShift, selectedActivity]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSummaryData().then(() => setRefreshing(false));
  }, []);

  const renderCards = () => {
    const totalShifts = summaryData.length;
    const totalInputKgs = summaryData.reduce((total, item) => total + item.total_input_kgs, 0);
    const totalOutputKgs = summaryData.reduce((total, item) => total + item.total_output_kgs, 0);
    const totalProductionLoss = summaryData.reduce((total, item) => total + item.production_loss, 0);
    const totalProductionGain = summaryData.reduce((total, item) => total + item.production_gain, 0);

    return (
      <View style={styles.cardsContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="calendar-clock" size={24} color="#4CAF50" style={styles.cardIcon} />
            <Title>Total Shifts</Title>
            <Paragraph style={styles.cardValue}>{totalShifts}</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="weight-kilogram" size={24} color="#2196F3" style={styles.cardIcon} />
            <Title>Total Input</Title>
            <Paragraph style={styles.cardValue}>{totalInputKgs.toFixed(2)} Kgs</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="package-variant" size={24} color="#FFC107" style={styles.cardIcon} />
            <Title>Total Output</Title>
            <Paragraph style={styles.cardValue}>{totalOutputKgs.toFixed(2)} Kgs</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="trending-down" size={24} color="#F44336" style={styles.cardIcon} />
            <Title>Production Loss</Title>
            <Paragraph style={styles.cardValue}>{totalProductionLoss.toFixed(2)} Kgs</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="trending-up" size={24} color="#4CAF50" style={styles.cardIcon} />
            <Title>Production Gain</Title>
            <Paragraph style={styles.cardValue}>{totalProductionGain.toFixed(2)} Kgs</Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderInputOutputChart = () => {
    const inputData = summaryData.map(item => item.total_input_kgs);
    const outputData = summaryData.map(item => item.total_output_kgs);
    const labels = summaryData.map(item => `Shift ${item.shift_no}`);
  
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Input vs Output per Shift</Text>
        <BarChart
            data={{
                labels,
                datasets: [
                {
                    data: inputData,
                    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, // Blue for input
                },
                {
                    data: outputData,
                    color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`, // Yellow for output
                },
                ],
                legend: ["Input", "Output"]
            }}
            width={screenWidth - 40} // Adjust this value based on your screen size
            height={220}
            yAxisLabel=""
            chartConfig={{
                backgroundColor: '#2596be',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                borderRadius: 16,
                },
                propsForLabels: {
                fontSize: 10,
                fill: 'black', // Ensure labels are visible
                },
                barPercentage: 0.5,
                grouped: false, // This makes it a stacked bar chart
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
            />

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(33, 150, 243, 1)' }]} />
            <Text>Input</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 193, 7, 1)' }]} />
            <Text>Output</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEfficiencyChart = () => {
    const efficiencyData = summaryData.map(item => (item.total_output_kgs / item.total_input_kgs) * 100);
    const labels = summaryData.map(item => `Shift ${item.shift_no}`);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Efficiency per Shift</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: efficiencyData }],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix="%"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#9C27B0"
            },
            propsForLabels: {
              fontSize: 10,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

const renderFilters = () => (
    <View style={styles.filtersContainer}>
     <View style={styles.datePickerContainer}>
        <CustomDatePicker
          date={startDate}
          onDateChange={setStartDate}
          label="Start Date"
        />
      </View>
      <View style={styles.datePickerContainer}>
        <CustomDatePicker
          date={endDate}
          onDateChange={setEndDate}
          label="End Date"
        />
      </View>
      <Menu
        visible={shiftMenuVisible}
        onDismiss={() => setShiftMenuVisible(false)}
        anchor={
          <Button 
            onPress={() => setShiftMenuVisible(true)}
            icon="clock-outline"
            mode="outlined"
          >
            Shift: {selectedShift}
          </Button>
        }
      >
        <Searchbar
          placeholder="Search shifts"
          onChangeText={setShiftSearchQuery}
          value={shiftSearchQuery}
          style={styles.searchbar}
        />
        <Menu.Item onPress={() => {setSelectedShift('All'); setShiftMenuVisible(false);}} title="All" />
        {['100', '200', '300'].filter(shift => 
          shift.includes(shiftSearchQuery) || 'all'.includes(shiftSearchQuery.toLowerCase())
        ).map(shift => (
          <Menu.Item 
            key={shift}
            onPress={() => {setSelectedShift(shift); setShiftMenuVisible(false);}} 
            title={`Shift ${shift}`} 
          />
        ))}
      </Menu>
      <Menu
        visible={activityMenuVisible}
        onDismiss={() => setActivityMenuVisible(false)}
        anchor={
          <Button 
            onPress={() => setActivityMenuVisible(true)}
            icon="folder-outline"
            mode="outlined"
          >
            Activity: {selectedActivity}
          </Button>
        }
      >
        <Searchbar
          placeholder="Search activities"
          onChangeText={setActivitySearchQuery}
          value={activitySearchQuery}
          style={styles.searchbar}
        />
        <Menu.Item onPress={() => {setSelectedActivity('All'); setActivityMenuVisible(false);}} title="All" />
        {['Processing', 'Bagging Off'].filter(activity => 
          activity.toLowerCase().includes(activitySearchQuery.toLowerCase()) || 'all'.includes(activitySearchQuery.toLowerCase())
        ).map(activity => (
          <Menu.Item 
            key={activity}
            onPress={() => {setSelectedActivity(activity); setActivityMenuVisible(false);}} 
            title={activity} 
          />
        ))}
      </Menu>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderFilters()}
      {renderCards()}
      {renderInputOutputChart()}
      {renderEfficiencyChart()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  datePickerContainer: {
    marginBottom: 10,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    marginBottom: 15,
    elevation: 4,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  cardIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16, // Ensures the border radius is applied to the chart container
    backgroundColor: '#f8f9fa', // You can set a consistent background color for the chart
    padding: 10, // Adds some padding around the chart
    elevation: 3, // Gives a subtle shadow effect on Android
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84, // Adds shadow for iOS
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  searchbar: {
    margin: 4,
    backgroundColor: '#f0f0f0',
  },
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