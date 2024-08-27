// import React, { useEffect, useState } from 'react';
// import { View, StyleSheet, ScrollView, Text, Dimensions, Alert, RefreshControl } from 'react-native';
// import { Card, Title, Paragraph, Button, Menu,Searchbar } from 'react-native-paper';
// import { LineChart, BarChart } from 'react-native-chart-kit';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import CustomDatePicker from '../components/CustomDatePicker';
// import axios from 'axios';

// const screenWidth = Dimensions.get('window').width;

// export default function DashboardScreen() {
//   const [summaryData, setSummaryData] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [startDate, setStartDate] = useState(new Date('2024-08-01'));
//   const [endDate, setEndDate] = useState(new Date('2024-08-31'));
//   const [showStartDatePicker, setShowStartDatePicker] = useState(false);
//   const [showEndDatePicker, setShowEndDatePicker] = useState(false);
//   const [selectedShift, setSelectedShift] = useState('All');
//   const [selectedActivity, setSelectedActivity] = useState('All');
//   const [shiftMenuVisible, setShiftMenuVisible] = useState(false);
//   const [activityMenuVisible, setActivityMenuVisible] = useState(false);
//   const [shiftSearchQuery, setShiftSearchQuery] = useState('');
//   const [activitySearchQuery, setActivitySearchQuery] = useState('');
  


//   const fetchSummaryData = async () => {
//     try {
//       console.log('Fetching summary data...');
      
//       const requestData = {
//         start_date: startDate.toISOString().split('T')[0],
//         end_date: endDate.toISOString().split('T')[0],
//       };
  
//       console.log('Request data:', requestData);
  
//       const response = await axios.post(
//         "http://192.168.81.57:8000/api/shift-summary-report/",
//         requestData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
  
//       console.log('Response status:', response.status);
//       console.log('Response data:', response.data);
  
//       // Apply filters
//       const filteredData = response.data.filter(item => {
//         const itemDate = new Date(item.date);
//         return (
//           itemDate >= startDate &&
//           itemDate <= endDate &&
//           (selectedShift === 'All' || item.shift_no === parseInt(selectedShift)) &&
//           (selectedActivity === 'All' || item.activity === selectedActivity)
//         );
//       });
  
//       console.log('Filtered data:', filteredData);
  
//       // Set the summary data state with the filtered data
//       setSummaryData(filteredData);
//     } catch (error) {
//       console.error("Error fetching summary data:", error);
//       if (error.response) {
//         console.error("Error data:", error.response.data);
//         console.error("Error status:", error.response.status);
//         console.error("Error headers:", error.response.headers);
//       } else if (error.request) {
//         console.error("Error request:", error.request);
//       } else {
//         console.error('Error message:', error.message);
//       }
//     }
//   };
  
//   useEffect(() => {
//     fetchSummaryData();
//   }, [startDate, endDate, selectedShift, selectedActivity]);

//   const onRefresh = React.useCallback(() => {
//     setRefreshing(true);
//     fetchSummaryData().then(() => setRefreshing(false));
//   }, []);

//   const renderCards = () => {
//     const totalShifts = summaryData.length;
//     const totalInputKgs = summaryData.reduce((total, item) => total + item.total_input_kgs, 0);
//     const totalOutputKgs = summaryData.reduce((total, item) => total + item.total_output_kgs, 0);
//     const totalProductionLoss = summaryData.reduce((total, item) => total + item.production_loss, 0);
//     const totalProductionGain = summaryData.reduce((total, item) => total + item.production_gain, 0);

//     return (
//       <View style={styles.cardsContainer}>
//         <Card style={styles.card}>
//           <Card.Content>
//             <Icon name="calendar-clock" size={24} color="#4CAF50" style={styles.cardIcon} />
//             <Title>Total Shifts</Title>
//             <Paragraph style={styles.cardValue}>{totalShifts}</Paragraph>
//           </Card.Content>
//         </Card>
//         <Card style={styles.card}>
//           <Card.Content>
//             <Icon name="weight-kilogram" size={24} color="#2196F3" style={styles.cardIcon} />
//             <Title>Total Input</Title>
//             <Paragraph style={styles.cardValue}>{totalInputKgs.toFixed(2)} Kgs</Paragraph>
//           </Card.Content>
//         </Card>
//         <Card style={styles.card}>
//           <Card.Content>
//             <Icon name="package-variant" size={24} color="#FFC107" style={styles.cardIcon} />
//             <Title>Total Output</Title>
//             <Paragraph style={styles.cardValue}>{totalOutputKgs.toFixed(2)} Kgs</Paragraph>
//           </Card.Content>
//         </Card>
//         <Card style={styles.card}>
//           <Card.Content>
//             <Icon name="trending-down" size={24} color="#F44336" style={styles.cardIcon} />
//             <Title>Production Loss</Title>
//             <Paragraph style={styles.cardValue}>{totalProductionLoss.toFixed(2)} Kgs</Paragraph>
//           </Card.Content>
//         </Card>
//         <Card style={styles.card}>
//           <Card.Content>
//             <Icon name="trending-up" size={24} color="#4CAF50" style={styles.cardIcon} />
//             <Title>Production Gain</Title>
//             <Paragraph style={styles.cardValue}>{totalProductionGain.toFixed(2)} Kgs</Paragraph>
//           </Card.Content>
//         </Card>
//       </View>
//     );
//   };

//   const renderInputOutputChart = () => {
//     const inputData = summaryData.map(item => item.total_input_kgs);
//     const outputData = summaryData.map(item => item.total_output_kgs);
//     const labels = summaryData.map(item => `Shift ${item.shift_no}`);
  
//     return (
//       <View style={styles.chartContainer}>
//         <Text style={styles.chartTitle}>Input vs Output per Shift</Text>
//         <BarChart
//             data={{
//                 labels,
//                 datasets: [
//                 {
//                     data: inputData,
//                     color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, // Blue for input
//                 },
//                 {
//                     data: outputData,
//                     color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`, // Yellow for output
//                 },
//                 ],
//                 legend: ["Input", "Output"]
//             }}
//             width={screenWidth - 40} // Adjust this value based on your screen size
//             height={220}
//             yAxisLabel=""
//             chartConfig={{
//                 backgroundColor: '#2596be',
//                 backgroundGradientFrom: '#ffffff',
//                 backgroundGradientTo: '#ffffff',
//                 decimalPlaces: 0,
//                 color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                 labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                 style: {
//                 borderRadius: 16,
//                 },
//                 propsForLabels: {
//                 fontSize: 10,
//                 fill: 'black', // Ensure labels are visible
//                 },
//                 barPercentage: 0.5,
//                 grouped: false, // This makes it a stacked bar chart
//             }}
//             style={styles.chart}
//             showValuesOnTopOfBars
//             fromZero
//             />

//         <View style={styles.legendContainer}>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendColor, { backgroundColor: 'rgba(33, 150, 243, 1)' }]} />
//             <Text>Input</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 193, 7, 1)' }]} />
//             <Text>Output</Text>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   const renderEfficiencyChart = () => {
//     const efficiencyData = summaryData.map(item => (item.total_output_kgs / item.total_input_kgs) * 100);
//     const labels = summaryData.map(item => `Shift ${item.shift_no}`);

//     return (
//       <View style={styles.chartContainer}>
//         <Text style={styles.chartTitle}>Efficiency per Shift</Text>
//         <LineChart
//           data={{
//             labels,
//             datasets: [{ data: efficiencyData }],
//           }}
//           width={screenWidth - 40}
//           height={220}
//           yAxisLabel=""
//           yAxisSuffix="%"
//           chartConfig={{
//             backgroundColor: '#ffffff',
//             backgroundGradientFrom: '#ffffff',
//             backgroundGradientTo: '#ffffff',
//             decimalPlaces: 2,
//             color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
//             labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//             style: {
//               borderRadius: 16,
//             },
//             propsForDots: {
//               r: "6",
//               strokeWidth: "2",
//               stroke: "#9C27B0"
//             },
//             propsForLabels: {
//               fontSize: 10,
//             },
//           }}
//           bezier
//           style={styles.chart}
//         />
//       </View>
//     );
//   };

// const renderFilters = () => (
//     <View style={styles.filtersContainer}>
//      <View style={styles.datePickerContainer}>
//         <CustomDatePicker
//           date={startDate}
//           onDateChange={setStartDate}
//           label="Start Date"
//         />
//       </View>
//       <View style={styles.datePickerContainer}>
//         <CustomDatePicker
//           date={endDate}
//           onDateChange={setEndDate}
//           label="End Date"
//         />
//       </View>
//       <Menu
//         visible={shiftMenuVisible}
//         onDismiss={() => setShiftMenuVisible(false)}
//         anchor={
//           <Button 
//             onPress={() => setShiftMenuVisible(true)}
//             icon="clock-outline"
//             mode="outlined"
//           >
//             Shift: {selectedShift}
//           </Button>
//         }
//       >
//         <Searchbar
//           placeholder="Search shifts"
//           onChangeText={setShiftSearchQuery}
//           value={shiftSearchQuery}
//           style={styles.searchbar}
//         />
//         <Menu.Item onPress={() => {setSelectedShift('All'); setShiftMenuVisible(false);}} title="All" />
//         {['100', '200', '300'].filter(shift => 
//           shift.includes(shiftSearchQuery) || 'all'.includes(shiftSearchQuery.toLowerCase())
//         ).map(shift => (
//           <Menu.Item 
//             key={shift}
//             onPress={() => {setSelectedShift(shift); setShiftMenuVisible(false);}} 
//             title={`Shift ${shift}`} 
//           />
//         ))}
//       </Menu>
//       <Menu
//         visible={activityMenuVisible}
//         onDismiss={() => setActivityMenuVisible(false)}
//         anchor={
//           <Button 
//             onPress={() => setActivityMenuVisible(true)}
//             icon="folder-outline"
//             mode="outlined"
//           >
//             Activity: {selectedActivity}
//           </Button>
//         }
//       >
//         <Searchbar
//           placeholder="Search activities"
//           onChangeText={setActivitySearchQuery}
//           value={activitySearchQuery}
//           style={styles.searchbar}
//         />
//         <Menu.Item onPress={() => {setSelectedActivity('All'); setActivityMenuVisible(false);}} title="All" />
//         {['Processing', 'Bagging Off'].filter(activity => 
//           activity.toLowerCase().includes(activitySearchQuery.toLowerCase()) || 'all'.includes(activitySearchQuery.toLowerCase())
//         ).map(activity => (
//           <Menu.Item 
//             key={activity}
//             onPress={() => {setSelectedActivity(activity); setActivityMenuVisible(false);}} 
//             title={activity} 
//           />
//         ))}
//       </Menu>
//     </View>
//   );

//   return (
//     <ScrollView 
//       style={styles.container}
//       refreshControl={
//         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//       }
//     >
//       {renderFilters()}
//       {renderCards()}
//       {renderInputOutputChart()}
//       {renderEfficiencyChart()}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   filtersContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     flexWrap: 'wrap',
//   },
//   datePickerContainer: {
//     marginBottom: 10,
//   },
//   cardsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   card: {
//     width: '48%',
//     marginBottom: 15,
//     elevation: 4,
//     backgroundColor: '#ffffff',
//     borderRadius: 8,
//   },
//   cardIcon: {
//     alignSelf: 'center',
//     marginBottom: 10,
//   },
//   cardValue: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginTop: 5,
//   },
//   chartContainer: {
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//   },
//   chartTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   chart: {
//     marginVertical: 8,
//     borderRadius: 16, // Ensures the border radius is applied to the chart container
//     backgroundColor: '#f8f9fa', // You can set a consistent background color for the chart
//     padding: 10, // Adds some padding around the chart
//     elevation: 3, // Gives a subtle shadow effect on Android
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84, // Adds shadow for iOS
//   },
//   legendContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 10,
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 10,
//   },
//   legendColor: {
//     width: 20,
//     height: 20,
//     marginRight: 5,
//   },
//   searchbar: {
//     margin: 4,
//     backgroundColor: '#f0f0f0',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 20,
//     margin: 20,
//     borderRadius: 4,
//   },
//   webDateInput: {
//     fontSize: 16,
//     padding: 10,
//     marginBottom: 10,
//   },
// });


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
        "http://10.0.2.2:8000/api/shift-summary-report/",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

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
    } catch (error) {
      console.error("Error fetching summary data:", error);
      if (error.response) {
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
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
            <Icon name="calendar-clock" size={24} color="#4CAF50" style={{alignSelf:'center'}} />
            <Title style={{alignSelf:'center'}}>Total Shifts</Title>
            <Paragraph style={styles.cardValue}>{totalShifts}</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="weight-kilogram" size={24} color="#2196F3" style={{alignSelf:'center'}} />
            <Title style={{alignSelf:'center'}}>Total Input</Title>
            <Paragraph style={styles.cardValue}>{totalInputKgs.toFixed(2)} Kgs</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="package-variant" size={24} color="#FFC107" style={{alignSelf:'center'}} />
            <Title style={{alignSelf:'center'}}>Total Output</Title>
            <Paragraph style={styles.cardValue}>{totalOutputKgs.toFixed(2)} Kgs</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="trending-down" size={24} color="#F44336" style={{alignSelf:'center'}} />
            <Title style={{alignSelf:'center'}}>Production Loss</Title>
            <Paragraph style={styles.cardValue}>{totalProductionLoss.toFixed(2)} Kgs</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Icon name="trending-up" size={24} color="#4CAF50" style={{alignSelf:'center'}} />
            <Title style={{alignSelf:'center'}}>Production Gain</Title>
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
      {/* <Text style={styles.screenTitle}>Dashboard</Text> */}
      <View style={styles.filterContainer}>
        {/* Date Filter */}
        <Button mode="contained" onPress={() => setShowStartDatePicker(true)}>{`Start Date: ${startDate.toISOString().split('T')[0]}`}</Button>
        <Button mode="contained" onPress={() => setShowEndDatePicker(true)}>{`End Date: ${endDate.toISOString().split('T')[0]}`}</Button>

        {/* Shift Filter */}
        {/* <Menu
          visible={shiftMenuVisible}
          onDismiss={() => setShiftMenuVisible(false)}
          anchor={
            <Button mode="contained" onPress={() => setShiftMenuVisible(true)}>
              {`Shift: ${selectedShift}`}
            </Button>
          }
        >
          <Menu.Item onPress={() => setSelectedShift('All')} title="All" />
        </Menu> */}

{/* Shift and activity */}
      {/* <Menu
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
        {['100', '200', '400'].filter(shift => 
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
          <Menu.Item onPress={() => setSelectedActivity('All')} title="All" />
        </Menu> */}
      </View>

      {renderCards()}
      {renderInputOutputChart()}

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
    justifyContent:'center',
    textAlign: 'center',
    gap: 15,
  },
  searchbar:{
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  card: {
    flexBasis:'45%',
    marginBottom: 20,
    justifyContent: 'left',
    backgroundColor:'rgb(248 250 252)',
    boxShadow: 'none',
    elevation: 1,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
});




// import React from 'react';
// import {StyleSheet, Text, View} from 'react-native';

// const DashboardScreen = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.red}>just red</Text>
//       <Text style={styles.bigBlue}>just bigBlue</Text>
//       <Text style={[styles.bigBlue, styles.red]}>bigBlue, then red</Text>
//       <Text style={[styles.red, styles.bigBlue]}>red, then bigBlue</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 50,
//   },
//   bigBlue: {
//     color: 'blue',
//     fontWeight: 'bold',
//     fontSize: 30,
//   },
//   red: {
//     color: 'red',
//   },
// });

// export default DashboardScreen;