/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import DatePicker from 'react-native-date-picker';
import { API_BASE_URL } from '@env';

const RapportPrix = () => {
  const [date, setDate] = useState(new Date()); // Utilisation d'une date par défaut
  const [userId, setUserId] = useState('');
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false); // Gérer l'ouverture du DatePicker

  const fetchRapports = useCallback(async () => {
    try {
      setLoading(true);
      const formattedDate = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      const response = await axios.get(`${API_BASE_URL}Rapporting/GetRapport`, {
        params: { date: formattedDate, user_id: userId },
      });
      setRapports(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des rapports:', err);
      setError('Erreur lors de la récupération des rapports.');
    } finally {
      setLoading(false);
    }
  }, [date, userId]);

  useEffect(() => {
    fetchRapports();
  }, [fetchRapports]);

  const groupByDateAndClient = (data) =>
    data.reduce((acc, rapport) => {
      const key = `${new Date(rapport.missionDate).toLocaleDateString()}-${rapport.raisonSocial}-${rapport.adresse}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(rapport);
      return acc;
    }, {});

  const calculateAdjustedPrice = (prix, contenanceA, contenanceB) =>
    contenanceA && contenanceB ? (prix / contenanceA) * contenanceB : 0;

  const calculateMarginRate = (prix, prixAjuste) =>
    prix ? ((prix - prixAjuste) / prix) * 100 : 0;

  const groupedRapports = groupByDateAndClient(rapports);

  const handleGeneratePDF = async () => {
    try {
      const pdfContent = `
        <html>
          <body>
            <h1 style="text-align: center;">Rapport Prix</h1>
            ${Object.keys(groupedRapports)
              .map((key) => {
                const [date, client, adresse] = key.split('-');
                const articles = groupedRapports[key];
                return `
                  <h2>${date} | ${client} | ${adresse}</h2>
                  <table border="1" style="width: 100%; text-align: left;">
                    <tr>
                      <th>Article</th>
                      <th>Marque</th>
                      <th>Prix</th>
                      <th>Contenance</th>
                      <th>Prix Ajusté</th>
                      <th>Taux de Marge (%)</th>
                    </tr>
                    ${articles
                      .map((rapport) => {
                        const prixAjuste = calculateAdjustedPrice(
                          rapport.prix,
                          articles[0].contenance,
                          rapport.contenance
                        );
                        const tauxMarge = calculateMarginRate(
                          rapport.prix,
                          prixAjuste
                        ).toFixed(2);
                        return `
                          <tr>
                            <td>${rapport.article}</td>
                            <td>${rapport.marque}</td>
                            <td>${rapport.prix}</td>
                            <td>${rapport.contenance}</td>
                            <td>${prixAjuste.toFixed(2)}</td>
                            <td>${tauxMarge} %</td>
                          </tr>`;
                      })
                      .join('')}
                  </table>`;
              })
              .join('')}
          </body>
        </html>`;

      const options = {
        html: pdfContent,
        fileName: 'Rapport_Prix',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      await Share.open({ url: `file://${file.filePath}` });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      Alert.alert('Erreur', 'Impossible de générer le PDF.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Rapport Prix</Text>

      <TouchableOpacity style={styles.input} onPress={() => setOpen(true)}>
        <Text>Sélectionner la date: {date.toLocaleDateString()}</Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        onConfirm={(selectedDate) => {
          setOpen(false);
          setDate(selectedDate);
        }}
        onCancel={() => setOpen(false)}
      />

      <TouchableOpacity style={styles.button} onPress={fetchRapports}>
        <Text style={styles.buttonText}>Charger les rapports</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        Object.keys(groupedRapports).map((key) => {
          const [date, client, adresse] = key.split('-');
          return (
            <View key={key} style={styles.reportContainer}>
              <Text style={styles.reportHeader}>
                {date} | {client} | {adresse}
              </Text>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Article</Text>
                <Text style={styles.tableHeaderCell}>Marque</Text>
                <Text style={styles.tableHeaderCell}>Prix</Text>
                <Text style={styles.tableHeaderCell}>Contenance</Text>
                <Text style={styles.tableHeaderCell}>Prix Ajusté</Text>
                <Text style={styles.tableHeaderCell}>Taux Marge (%)</Text>
              </View>
              {groupedRapports[key].map((rapport, index) => (
                <View key={index} style={styles.row}>
                  <Text>{rapport.article}</Text>
                  <Text>{rapport.marque}</Text>
                  <Text>{rapport.prix}</Text>
                  <Text>{rapport.contenance}</Text>
                  <Text>{calculateAdjustedPrice(
                    rapport.prix,
                    groupedRapports[key][0].contenance,
                    rapport.contenance
                  ).toFixed(2)}</Text>
                  <Text>{calculateMarginRate(
                    rapport.prix,
                    calculateAdjustedPrice(
                      rapport.prix,
                      groupedRapports[key][0].contenance,
                      rapport.contenance
                    )
                  ).toFixed(2)} %</Text>
                </View>
              ))}
            </View>
          );
        })
      )}

      <TouchableOpacity style={styles.button} onPress={handleGeneratePDF}>
        <Text style={styles.buttonText}>Générer PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = {
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f9f9f9',
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    formContainer: {
      marginBottom: 20,
    },
    button: {
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
    },
    loading: {
      textAlign: 'center',
      fontSize: 16,
      color: '#333',
    },
    error: {
      textAlign: 'center',
      fontSize: 16,
      color: 'red',
    },
    empty: {
      fontSize: 16,
      color: '#333',
      textAlign: 'center',
    },
    tableContainer: {
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      paddingBottom: 10,
    },
    heading: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    tableHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#007bff',
      padding: 10,
    },
    tableHeaderCell: {
      color: '#fff',
      fontWeight: 'bold',
    },
    tableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
    },
    tableCell: {
      flex: 1,
      textAlign: 'center',
    },
  };

export default RapportPrix;
