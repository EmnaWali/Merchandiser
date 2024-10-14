/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Card} from 'react-native-paper';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import { API_BASE_URL } from '@env';
// Configuration de la localisation du calendrier
LocaleConfig.locales.fr = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ],
  monthNamesShort: [
    'Janv.',
    'Févr.',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juil.',
    'Août',
    'Sept.',
    'Oct.',
    'Nov.',
    'Déc.',
  ],
  dayNames: [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: 'Aujourdhui',
};
LocaleConfig.defaultLocale = 'fr';

const CalendarComponent = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState('');
  const [todosForSelectedDate, setTodosForSelectedDate] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [noMissionMessage, setNoMissionMessage] = useState('');

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleDayPress = day => {
    setSelectedDate(day.dateString);
    fetchTodosForDate(day.dateString);
  };

  const fetchMissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}Mission/GetMissions`);
      const data = await response.json();

      console.log('Fetched missions data:', data);

      const marked = data.reduce((acc, mission) => {
        const missionDate = mission.missionDate;
        if (missionDate) {
          const date = missionDate.split('T')[0];
          if (!acc[date]) {
            acc[date] = {marked: true, dotColor: 'blue', activeOpacity: 0};
          }
        }
        return acc;
      }, {});

      console.log('Marked Dates:', marked);
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error fetching missions:', error);
      setNoMissionMessage('Erreur lors de la récupération des missions.');
    }
  };

  const fetchTodosForDate = async date => {
    setLoading(true);
    setNoMissionMessage('');
    try {
      const response = await fetch(
        `${API_BASE_URL}Mission/GetMissions?date=${date}`,
      );
      const data = await response.json();

      console.log('Fetched data for date:', date, data);

      if (data.length === 0) {
        setNoMissionMessage('Aucune mission pour ce jour.');
        setTodosForSelectedDate([]);
      } else {
        setTodosForSelectedDate(data);
      }
    } catch (error) {
      console.error('Error fetching todos for date:', error);
      setNoMissionMessage('Erreur lors de la récupération des missions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            selected: true,
            disableTouchEvent: true,
            selectedDotColor: 'orange',
          },
        }}
      />
      <Text style={styles.title}>Les missions du {selectedDate}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : noMissionMessage ? (
        <Text style={styles.noMissionText}>{noMissionMessage}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {todosForSelectedDate.length === 0 ? (
            <Text style={styles.noMissionText}>Aucune mission à afficher.</Text>
          ) : (
            todosForSelectedDate.map((todo, index) => (
              <Pressable
                key={index}
                onPress={() =>
                  navigation.navigate('MissionDetail', {
                    missionId: todo.missionId,
                  })
                }>
                <Card style={styles.card}>
                  <Card.Content>
                    <Text>Client Code: {todo.clientCode}</Text>
                    <Text>Gouvernorat: {todo.gouvernorat}</Text>
                    <Text>Date: {todo.missionDate}</Text>
                    <Text>Description: {todo.missionDescription}</Text>
                    <Text>Time: {todo.missionTime}</Text>
                  </Card.Content>
                </Card>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  title: {fontSize: 20, textAlign: 'center', margin: 10},
  scrollViewContent: {flexGrow: 1, paddingBottom: 20},
  card: {marginBottom: 10},
  noMissionText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 10,
    color: 'red',
  },
});

export default CalendarComponent;
