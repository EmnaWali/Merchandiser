/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { API_BASE_URL } from '@env';

const RapportQte = () => {
  const [date, setDate] = useState('');
  const [userId] = useState('');
  const [missionId] = useState('');
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRapports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}Rapporting/GetRapportQte`, {
        params: {
          date: date,
          user_id: userId,
          mission_id: missionId,
        },
      });
      setRapports(response.data);
    // eslint-disable-next-line no-shadow, no-catch-shadow
    } catch (error) {
      console.error('Error fetching rapports:', error);
      setError('Erreur lors de la récupération des rapports.');
    } finally {
      setLoading(false);
    }
  }, [date, userId, missionId]);

  useEffect(() => {
    fetchRapports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, userId, missionId]);

  const groupByDateAndClient = rapports => {
    const grouped = rapports.reduce((acc, rapport) => {
      const dateClientKey = `${new Date(rapport.missionDate).toLocaleDateString()}-${rapport.raisonSocial}-${rapport.adresse}`;
      if (!acc[dateClientKey]) {
        acc[dateClientKey] = [];
      }
      acc[dateClientKey].push(rapport);
      return acc;
    }, {});

    return grouped;
  };

  const groupedRapports = groupByDateAndClient(rapports);

  const handleGeneratePDF = async () => {
    try {
      const pdfContent = `
        <html>
          <body>
            <img src='..assets/logo.png' style='width: 100px; height: 100px;' />
            <div style='text-align: center;'>
              <h1>Rapport Quantité</h1>
            </div>
            ${Object.keys(groupedRapports)
              .map(dateClientKey => {
                const [dateKey, clientKey, adresseKey] = dateClientKey.split('-');
                const groupedData = groupedRapports[dateClientKey];
                const groupedByArticle = groupedData.reduce((acc, rapport) => {
                  if (!acc[rapport.article]) {
                    acc[rapport.article] = [];
                  }
                  acc[rapport.article].push(rapport);
                  return acc;
                }, {});

                return `
                  <div style='margin-bottom: 10px;'>
                    <h3>Date: ${dateKey} </h3>
                    <h3>Client: ${clientKey} ${adresseKey}</h3>
                    <table border='1' cellspacing='0' cellpadding='5' style='width: 100%; text-align: center;'>
                      <thead>
                        <tr>
                          <th>Article</th>
                          <th>Marque</th>
                          <th>Quantité</th>
                          <th>Contenance</th>
                          <th>Taux OCC</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${Object.keys(groupedByArticle)
                          .map(article => {
                            const totalQuantite = groupedByArticle[article].reduce((sum, rapport) => sum + rapport.qte, 0);
                            return groupedByArticle[article]
                              .map(rapport => `
                                <tr>
                                  <td>${rapport.article}</td>
                                  <td>${rapport.marque}</td>
                                  <td>${rapport.qte}</td>
                                  <td>${rapport.contenance}</td>
                                  <td>${((rapport.qte / totalQuantite) * 100).toFixed(2)}%</td>
                                </tr>
                              `)
                              .join('');
                          })
                          .join('')}
                      </tbody>
                    </table>
                  </div>
                `;
              })
              .join('')}
          </body>
        </html>
      `;

      // Générer le PDF
      const options = {
        html: pdfContent,
        fileName: 'RapportQte',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);

      // Partager le fichier PDF généré
      const shareOptions = {
        title: 'Partager le Rapport',
        url: `file://${file.filePath}`,
        message: 'Voici votre rapport.',
      };

      await Share.open(shareOptions);

    // eslint-disable-next-line no-catch-shadow, no-shadow
    } catch (error) {
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Rapport Quantité</Text>
      <View style={styles.formContainer}>
        <TouchableOpacity onPress={handleGeneratePDF} style={styles.button}>
          <Text>Générer PDF et partager</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Chargement...</Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : Object.keys(groupedRapports).length === 0 ? (
        <Text style={styles.empty}>Aucun rapport à afficher.</Text>
      ) : (
        <ScrollView>
          {Object.keys(groupedRapports).map(dateClientKey => {
            const [dateKey, clientKey, adresseKey] = dateClientKey.split('-');
            const groupedData = groupedRapports[dateClientKey];
            const groupedByArticle = groupedData.reduce((acc, rapport) => {
              if (!acc[rapport.article]) {
                acc[rapport.article] = [];
              }
              acc[rapport.article].push(rapport);
              return acc;
            }, {});

            return (
              <View key={dateClientKey} style={styles.tableContainer}>
                <Text style={styles.heading}>
                  {`Mission du ${dateKey} | ${clientKey} ${adresseKey} | ${groupedData[0].userName}`}
                </Text>

                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderCell}>Article</Text>
                  <Text style={styles.tableHeaderCell}>Marque</Text>
                  <Text style={styles.tableHeaderCell}>Quantité</Text>
                  <Text style={styles.tableHeaderCell}>Contenance</Text>
                  <Text style={styles.tableHeaderCell}>Taux Occ</Text>
                </View>

                {Object.keys(groupedByArticle).map(article => {
                  const totalQuantite = groupedByArticle[article].reduce(
                    (sum, rapport) => sum + rapport.qte,
                    0,
                  );

                  return groupedByArticle[article].map((rapport, index) => (
                    <View key={`${article}-${index}`} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{rapport.article}</Text>
                      <Text style={styles.tableCell}>{rapport.marque}</Text>
                      <Text style={styles.tableCell}>{rapport.qte}</Text>
                      <Text style={styles.tableCell}>{rapport.contenance}</Text>
                      <Text style={styles.tableCell}>
                        {((rapport.qte / totalQuantite) * 100).toFixed(2)}%
                      </Text>
                    </View>
                  ));
                })}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = {
  container: {
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  header: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#007bff',
    color: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  loading: {
    fontSize: 16,
    color: '#007bff',
    textAlign: 'center',
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
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

export default RapportQte;
