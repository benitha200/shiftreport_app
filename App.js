// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
// import HomeScreen from './screens/HomeScreen';
// import AddShiftScreen from './screens/AddShiftScreen';
// import ShiftDetailsScreen from './screens/ShiftDetailsScreen';
// import ReportScreen from './screens/ReportScreen';
// import DashboardScreen from './screens/DashboardScreen';

// const Stack = createStackNavigator();
// const Drawer = createDrawerNavigator();

// const theme = {
//   ...DefaultTheme,
//   colors: {
//     ...DefaultTheme.colors,
//     primary: '#008080',
//     accent: '#00a86b',
//   },
// };

// function MainStack() {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerStyle: {
//           backgroundColor: theme.colors.primary,
//         },
//         headerTintColor: '#fff',
//         headerTitleStyle: {
//           fontWeight: 'bold',
//         },
//       }}
//     >
//       <Stack.Screen name="Shift Reports" component={HomeScreen} />
//       <Stack.Screen name="Add Shift" component={AddShiftScreen} />
//       <Stack.Screen name="Shift Details" component={ShiftDetailsScreen} />
//       <Stack.Screen name="Dashboard" component={DashboardScreen} />
//     </Stack.Navigator>
//   );
// }

// export default function App() {
//   return (
//     <PaperProvider theme={theme}>
//       <NavigationContainer>
//         <Drawer.Navigator 
//           initialRouteName="Main"
//           screenOptions={{
//             headerStyle: {
//               backgroundColor: theme.colors.primary,
//             },
//             headerTintColor: '#fff',
//             headerTitleStyle: {
//               fontWeight: 'bold',
//             },
//             drawerStyle: {
//               backgroundColor: '#fff',  // Drawer background color
//             },
//             drawerActiveTintColor: '#008080',  // Text color for the active item
//             drawerInactiveTintColor: '#000',  // Text color for inactive items
//           }}
//         ><Drawer.Screen name="Dashboard" component={ReportScreen} />
//           <Drawer.Screen name="Shifts" component={MainStack} />
//           <Drawer.Screen name="Report" component={ReportScreen} />
          
//         </Drawer.Navigator>
//       </NavigationContainer>
//     </PaperProvider>
//   );
// }

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import HomeScreen from './screens/HomeScreen';
import AddShiftScreen from './screens/AddShiftScreen';
import ShiftDetailsScreen from './screens/ShiftDetailsScreen';
import ReportScreen from './screens/ReportScreen';
import DashboardScreen from './screens/DashboardScreen';
import LoginScreen from './screens/LoginScreen'; // Import your LoginScreen

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#008080',
    accent: '#00a86b',
  },
};

// MainStack with a Stack Navigator
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="Shift Reports" component={HomeScreen} />
      <Stack.Screen name="Add Shift" component={AddShiftScreen} />
      <Stack.Screen name="Shift Details" component={ShiftDetailsScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}

// App Component
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        {isLoggedIn ? (
          <Drawer.Navigator 
            initialRouteName="Main"
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              drawerStyle: {
                backgroundColor: '#fff',  // Drawer background color
              },
              drawerActiveTintColor: '#008080',  // Text color for the active item
              drawerInactiveTintColor: '#000',  // Text color for inactive items
            }}
          >
            <Drawer.Screen name="Dashboard" component={DashboardScreen} />
            <Drawer.Screen name="Shifts" component={MainStack} />
            <Drawer.Screen name="Report" component={ReportScreen} />
          </Drawer.Navigator>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}
