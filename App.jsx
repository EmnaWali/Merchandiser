// App.js
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigation from './Screens/AppNavigation';
import {API_BASE_URL, ENVIRONMENT} from '@env'; // Import des variables d'environnement

export default function App() {
  console.log('API_BASE_URL:', API_BASE_URL); // Vérification de l'URL chargée
  console.log('ENVIRONMENT:', ENVIRONMENT); // Vérification de l'environnement

  return (
    <NavigationContainer>
      <AppNavigation />
    </NavigationContainer>
  );
}
