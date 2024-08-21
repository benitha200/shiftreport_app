import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import HomeScreen from './screens/HomeScreen';
import AddShiftScreen from './screens/AddShiftScreen';
import ShiftDetailsScreen from './screens/ShiftDetailsScreen';
import ReportScreen from './screens/ReportScreen';
// import SettingsScreen from './screens/SettingsScreen';

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
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
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
          <Drawer.Screen name="Shifts" component={MainStack} />
          <Drawer.Screen name="Report" component={ReportScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
