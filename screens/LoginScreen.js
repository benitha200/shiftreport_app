import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'react-native-paper'; // Import to use the theme

export default function LoginScreen({ onLogin }) {
  const { colors } = useTheme(); // Destructure colors from theme
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({ email, password });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("http://127.0.0.1:8000/api/login/", requestOptions)
      .then(response => response.json())
      .then(result => {
        if (result.access) {
            console.log(result.access);
          AsyncStorage.setItem('token', result.access); // Save token in AsyncStorage
          onLogin(); // Trigger the login process
        } else {
          Alert.alert('Login failed', 'Invalid email or password');
        }
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <View style={styles.container}>
        <Text style={{color:colors.primary,textAlign:'center',margin:'2rem',textTransform:'uppercase',fontSize:'1.5rem',fontWeight:'bold'}}>Login</Text>    
    
      <TextInput
        style={[styles.input, { borderColor: colors.primary }]} // Apply theme color to input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { borderColor: colors.primary }]} // Apply theme color to input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  button: {
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
