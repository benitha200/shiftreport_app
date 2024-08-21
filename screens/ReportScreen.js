import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform, Text, ActivityIndicator } from 'react-native';
import { Title, TextInput, Button, Menu } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

const ReportScreen = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('');
  const [showReportTypeDropDown, setShowReportTypeDropDown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const reportTypeList = ['SHIFT SUMMARY REPORT', 'SHIFT ACTIVITY REPORT'];

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let requestOptions;

    if (reportType === 'SHIFT SUMMARY REPORT') {
      const raw = JSON.stringify({
        "start_date": startDate,
        "end_date": endDate
      });

      requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      try {
        const response = await fetch("http://127.0.0.1:8000/api/shift-summary-report/", requestOptions);
        const result = await response.json();
        setReportData(result);
      } catch (error) {
        setError("Failed to fetch the report. Please try again.");
      }
    } else if (reportType === 'SHIFT ACTIVITY REPORT') {
      requestOptions = {
        method: "GET",
        redirect: "follow"
      };

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/shiftdetail/${startDate}`, requestOptions);
        const result = await response.json();
        setReportData(result);
      } catch (error) {
        setError("Failed to fetch the report. Please try again.");
      }
    }

    setLoading(false);
  };

  const handleDownloadReport = async () => {
    if (!reportData || reportData.length === 0) {
      Alert.alert('No Data', 'No report data available to download.');
      return;
    }

    let headers;
    let data;

    if (reportType === 'SHIFT SUMMARY REPORT') {
      headers = ['Shift No', 'Date', 'Activity', 'Total Input (kgs)', 'Total Output (kgs)', 'Input/Output Ratio', 'Production Loss', 'Production Gain'];
      data = reportData;
    } else if (reportType === 'SHIFT ACTIVITY REPORT') {
      headers = ['Shift No', 'Supplier', 'Grade', 'Total Kgs', 'Total Bags', 'Batch No', 'Cell', 'Entry Type'];
      data = reportData.map(item => ({
        'Shift No': item.shift.shift_no,
        'Supplier': item.supplier,
        'Grade': item.grade,
        'Total Kgs': item.total_kgs,
        'Total Bags': item.total_bags,
        'Batch No': item.batchno_grn,
        'Cell': item.cell,
        'Entry Type': item.entry_type
      }));
    }

    // Create the worksheet with the data
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });

    // Define the header style
    const headerStyle = {
      fill: {
        fgColor: { rgb: '008080' },
      },
      font: {
        color: { rgb: 'FFFFFF' },
        bold: true,
      },
      alignment: {
        vertical: 'center',
        horizontal: 'center',
      },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    // Apply the header style
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1', styles: [headerStyle] });

    // Set the row height for the header and data rows
    worksheet['!rows'] = Array(data.length + 1).fill({ hpx: 30 });

    // Apply the data style to all rows
    const dataStyle = {
      alignment: {
        vertical: 'center',
        horizontal: 'center',
      },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };
    XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A2', skipHeader: true, styles: dataStyle });

    // Create a new workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    // Generate the Excel file as a buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    if (Platform.OS === 'web') {
      // Web platform code
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', 'ShiftReport.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } else {
      // Mobile platform code
      const fileUri = `${FileSystem.documentDirectory}ShiftReport.xlsx`;

      await FileSystem.writeAsStringAsync(fileUri, Buffer.from(excelBuffer).toString('base64'), {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Download', 'Report has been saved successfully!');
      }
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
      <Text style={styles.header}>Generate Report</Text>

      {renderDropdown(reportType, setReportType, showReportTypeDropDown, setShowReportTypeDropDown, reportTypeList, 'Report Type')}

      {reportType === 'SHIFT ACTIVITY REPORT' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Shift No:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Shift No"
            value={startDate}
            onChangeText={setStartDate}
          />
        </View>
      )}

      {reportType === 'SHIFT SUMMARY REPORT' && (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Start Date:</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>End Date:</Text>
            <TextInput
              style={              styles.input}
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#008080" />
      ) : (
        <Button style={{ width: '50%', marginTop: 20 }} mode="contained" onPress={handleGenerateReport}>
          Generate Report
        </Button>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {reportData && (
        <Button style={{ width: '50%', marginTop: 20 }} mode='outlined' onPress={handleDownloadReport}>
          Download Report
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
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
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default ReportScreen;



// import React, { useState } from 'react';
// import { View, StyleSheet, Alert, Platform, Text, ActivityIndicator } from 'react-native';
// import { Title, TextInput, Button, Menu } from 'react-native-paper';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
// import * as XLSX from 'xlsx';

// const ReportScreen = () => {
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [reportType, setReportType] = useState('');
//   const [showReportTypeDropDown, setShowReportTypeDropDown] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [reportData, setReportData] = useState(null);
//   const [error, setError] = useState(null);

//   const reportTypeList = ['SHIFT SUMMARY REPORT'];

//   const handleGenerateReport = async () => {
//     setLoading(true);
//     setError(null);

//     const myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");

//     const raw = JSON.stringify({
//       "start_date": startDate,
//       "end_date": endDate
//     });

//     const requestOptions = {
//       method: "POST",
//       headers: myHeaders,
//       body: raw,
//       redirect: "follow"
//     };

//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/shift-summary-report/", requestOptions);
//       const result = await response.json();
//       setReportData(result);
//       setLoading(false);
//     } catch (error) {
//       setError("Failed to fetch the report. Please try again.");
//       setLoading(false);
//     }
//   };

//   const handleDownloadReport = async () => {
//     if (!reportData || reportData.length === 0) {
//       Alert.alert('No Data', 'No report data available to download.');
//       return;
//     }
  
//     // Define the header names
//     const headers = ['Shift No', 'Date', 'Activity', 'Total Input (kgs)', 'Total Output (kgs)', 'Input/Output Ratio', 'Production Loss', 'Production Gain'];
  
//     // Create the worksheet with the data
//     const worksheet = XLSX.utils.json_to_sheet(reportData, { header: headers });
  
//     // Define the header style
//     const headerStyle = {
//       fill: {
//         fgColor: { rgb: '008080' }, // Background color of the headers
//       },
//       font: {
//         color: { rgb: 'FFFFFF' },
//         bold: true,
//       },
//       alignment: {
//         vertical: 'center',
//         horizontal: 'center',
//       },
//       border: {
//         top: { style: 'thin', color: { rgb: '000000' } },
//         bottom: { style: 'thin', color: { rgb: '000000' } },
//         left: { style: 'thin', color: { rgb: '000000' } },
//         right: { style: 'thin', color: { rgb: '000000' } },
//       },
//     };
  
//     // Apply the header style
//     XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1', styles: [headerStyle] });
  
//     // Set the row height for the header and data rows
//     worksheet['!rows'] = Array(reportData.length + 1).fill({ hpx: 30 });
  
//     // Apply the data style to all rows
//     const dataStyle = {
//       alignment: {
//         vertical: 'center',
//         horizontal: 'center',
//       },
//       border: {
//         top: { style: 'thin', color: { rgb: '000000' } },
//         bottom: { style: 'thin', color: { rgb: '000000' } },
//         left: { style: 'thin', color: { rgb: '000000' } },
//         right: { style: 'thin', color: { rgb: '000000' } },
//       },
//     };
//     XLSX.utils.sheet_add_json(worksheet, reportData, { origin: 'A2', skipHeader: true, styles: dataStyle });
  
//     // Create a new workbook and add the worksheet
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  
//     // Generate the Excel file as a buffer
//     const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
//     if (Platform.OS === 'web') {
//       // Web platform code
//       const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//       const fileUrl = URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = fileUrl;
//       link.setAttribute('download', 'ShiftReport.xlsx');
//       document.body.appendChild(link);
//       link.click();
//       link.parentNode.removeChild(link);
//     } else {
//       // Mobile platform code
//       const fileUri = `${FileSystem.documentDirectory}ShiftReport.xlsx`;
  
//       await FileSystem.writeAsStringAsync(fileUri, Buffer.from(excelBuffer).toString('base64'), {
//         encoding: FileSystem.EncodingType.Base64,
//       });
  
//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(fileUri);
//       } else {
//         Alert.alert('Download', 'Report has been saved successfully!');
//       }
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
//             <Button mode="outlined" onPress={() => setShowDropDown(true)} style={styles.input}>
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
//       <Text style={styles.header}>Generate Report</Text>

//       {renderDropdown(reportType, setReportType, showReportTypeDropDown, setShowReportTypeDropDown, reportTypeList, 'reportType')}

//       <View style={styles.formGroup}>
//         <Text style={styles.label}>Start Date:</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="YYYY-MM-DD"
//           value={startDate}
//           onChangeText={setStartDate}
//         />
//       </View>

//       <View style={styles.formGroup}>
//         <Text style={styles.label}>End Date:</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="YYYY-MM-DD"
//           value={endDate}
//           onChangeText={setEndDate}
//         />
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" color="#008080" />
//       ) : (
//         <Button style={{ width: '50%', marginTop: 20 }} mode="contained" onPress={handleGenerateReport}>
//           Generate Report
//         </Button>
//       )}

//       {error && <Text style={styles.error}>{error}</Text>}

//       {reportData && (
//         <Button style={{ width: '50%', marginTop: 20 }} mode='outlined' onPress={handleDownloadReport}>
//           Download Report
//         </Button>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#333',
//   },
//   formGroup: {
//     marginBottom: 15,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#555',
//     marginBottom: 5,
//   },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     backgroundColor: '#fff',
//   },
//   selectContainer: {
//     marginBottom: 10,
//   },
//   select: {
//     width: '100%',
//     height: 40,
//     borderColor: '#000',
//     borderWidth: 1,
//     borderRadius: 4,
//     paddingLeft: 8,
//     paddingRight: 8,
//   },
//   inputLabel: {
//     fontSize: 12,
//     marginBottom: 4,
//   },
//   error: {
//     color: 'red',
//     marginTop: 10,
//   },
// });

// export default ReportScreen;