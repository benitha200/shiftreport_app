import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { View, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './screens/HomeScreen';
import AddShiftScreen from './screens/AddShiftScreen';
import ShiftDetailsScreen from './screens/ShiftDetailsScreen';
import ReportScreen from './screens/ReportScreen';
import DashboardScreen from './screens/DashboardScreen';
import LoginScreen from './screens/LoginScreen';


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#008080',
    accent: '#00a86b',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
    error: '#B00020',
    disabled: '#9E9E9E',
    placeholder: '#757575',
    backdrop: '#00000080',
  },
  roundness: 4,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '100',
    },
  },
  animation: {
    scale: 1.0,
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
      <Stack.Screen name="ShiftDetailsScreen" component={ShiftDetailsScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    role: '',
    username: ''
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const email = await AsyncStorage.getItem('email');
        const name = await AsyncStorage.getItem('name');
        const role = await AsyncStorage.getItem('role');
        const username = await AsyncStorage.getItem('username');

        if (email && name && role && username) {
          console.log(email, name, role, username)
          setUserInfo({ email, name, role, username });
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('name');
      await AsyncStorage.removeItem('role');
      await AsyncStorage.removeItem('username');
      setIsLoggedIn(false);
      setUserInfo({ name: '', email: '', role: '', username: '' });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const CustomDrawerContent = (props) => {
    return (
      <View style={{flex: 1}}>
        <View style={{
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#ccc',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Ionicons name="person-circle-outline" size={150} color="#008080" />
          <Text style={{fontWeight: 'bold', fontSize: 18, marginTop: 8, textAlign: 'center'}}>{userInfo.name}</Text>
          <Text style={{textAlign: 'center'}}>{userInfo.email}</Text>
          <Text style={{textAlign: 'center'}}>{userInfo.role}</Text>
        </View>
        
        <DrawerContentScrollView {...props}>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
        
        <TouchableOpacity 
          style={{padding: 16, borderTopWidth: 1, borderTopColor: '#ccc'}}
          onPress={handleLogout}
        >
          <Text style={{color: '#008080'}}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        {isLoggedIn ? (
           <Drawer.Navigator
           initialRouteName="Main"
           drawerContent={(props) => <CustomDrawerContent {...props} />}
           screenOptions={{
             headerStyle: {
               backgroundColor: theme.colors.primary,
             },
             headerTintColor: '#fff',
             headerTitleStyle: {
               fontWeight: 'bold',
             },
             drawerStyle: {
               backgroundColor: '#fff',
               padding: 16,
             },
             drawerActiveTintColor: '#008080',
             drawerInactiveTintColor: '#000',
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