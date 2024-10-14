/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native'; // Pour la navigation
import axios from 'axios';
import {API_BASE_URL} from '@env';
const logo = require('../assets/logo.png');
export default function Login() {
  const [click, setClick] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation(); // Utilisez le hook de navigation

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}Login`,
        null,
        {
          params: {
            login: username,
            password: password,
          },
        },
      );

      if (response.status === 200) {
        navigation.navigate('Calendar');
      }
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'An error occurred',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={logo} style={styles.image} resizeMode="contain" />

      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder="EMAIL"
          value={username}
          onChangeText={setUsername}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="MOT DE PASSE"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.rememberView}>
        <View style={styles.switch}>
          <Switch
            value={click}
            onValueChange={setClick}
            trackColor={{true: '#232c63', false: 'gray'}}
            thumbColor={click ? '#bdbfd0' : '#f4f3f4'}
          />
          <Text style={styles.rememberText}>Remember Me</Text>
        </View>
      </View>

      <View style={styles.buttonView}>
        <Pressable
          style={styles.button}
          onPress={handleLogin} // Appel de la fonction pour gérer le clic
        >
          <Text style={styles.buttonText}>LOGIN</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 70,
  },
  image: {
    height: 160,
    width: 170,
    marginBottom: 80,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingVertical: 40,
    color: '#232c63',
  },
  inputView: {
    gap: 15,
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 10,
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: '#232c63',
    borderWidth: 1,
    borderRadius: 7,
  },
  rememberView: {
    width: '100%',
    paddingHorizontal: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  switch: {
    flexDirection: 'row',
    gap: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 13,
  },
  button: {
    backgroundColor: '#232c63',
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonView: {
    width: '100%',
    paddingHorizontal: 50,
  },
});
