/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {Picker} from '@react-native-picker/picker'; // Import du nouveau package
import {useRoute, useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import { API_BASE_URL } from '@env';
const getPointageDetails = async missionId => {
  try {
    const response = await fetch(
      `${API_BASE_URL}Pointage/GetPointageDetailsByMissionId/${missionId}`,
    );
    console.log('Response status:', response.status);
    if (response.ok) {
      const pointage = await response.json();
      console.log('Pointage details:', pointage);
      return pointage;
    } else {
      const error = await response.text();
      console.error('Error fetching pointage details:', error);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
};

const updatePointage = async (id, updatedData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}Pointage/UpdatePointage/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      },
    );

    if (!response.ok) {
      throw new Error('Error updating pointage: ' + (await response.text()));
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating pointage:', error);
  }
};

const MissionDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {missionId} = route.params || {};
  const [pointageDetails, setPointageDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [etat, setEtat] = useState('Non spécifié');
  const [commentaire, setCommentaire] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchPointage = async () => {
      if (!missionId) {
        setError('ID de mission invalide.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      const details = await getPointageDetails(missionId);
      if (details) {
        setPointageDetails(details);
        setEtat(details.etat || 'Non spécifié');
        setCommentaire(details.commentaire || '');
        setArrivalTime(details.heureArrivee || '');
        setDepartureTime(details.heureDepart || '');
      } else {
        setError('Impossible de récupérer les détails du pointage.');
      }
      setLoading(false);
    };

    fetchPointage();
  }, [missionId]);

  const handleUpdate = async () => {
    if (etat === 'Annulé' && !commentaire.trim()) {
      setError("Un commentaire est obligatoire lorsque l'état est Annulé");
      return;
    }
    const updatedData = {
      DatePointage: pointageDetails?.datePointage,
      HeureArrivee: arrivalTime,
      HeureDepart: departureTime,
      Etat: etat,
      Commentaire: commentaire,
    };

    const result = await updatePointage(
      pointageDetails?.idPointage,
      updatedData,
    );
    if (result) {
      navigation.goBack();
    } else {
      setError('Erreur lors de la mise à jour du pointage.');
    }
  };

  const handleSetCurrentTime = type => {
    const currentTime = format(new Date(), 'HH:mm:ss');
    if (type === 'arrival') {
      setArrivalTime(currentTime);
    } else {
      setDepartureTime(currentTime);
    }
  };

  const goToArticlePriceReport = () => {
    navigation.navigate('ArticlePriceReport', {missionId: missionId});
  };
  const goToArticleQteReport = () => {
    navigation.navigate('ArticleQteReport', {missionId: missionId});
  };
  const goToFacing = () => {
    navigation.navigate('Facing', {missionId: missionId});
  };
  const goToRapportQte = () => {
  navigation.navigate('RapportQte', {missionId: missionId});
 };
 const goToRapportPrix = () => {
  navigation.navigate('RapportPrix', {missionId: missionId});
 };
   // Fonction pour afficher la popup
   const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Rendre la popup avec les boutons
  const renderModal = () => (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isModalVisible}
      onRequestClose={toggleModal}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choisissez un rapport</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={goToRapportQte}>
            <Text style={styles.buttonText}>Consulter rapport prix</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={goToRapportPrix}>
            <Text style={styles.buttonText}>Consulter rapport quantité</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={goToFacing}>
            <Text style={styles.buttonText}>Consulter rapport Facing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
            <Text style={styles.buttonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );


  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View>
          <Text style={styles.title}>Détails du Pointage :</Text>
          {pointageDetails ? (
            <View>
              <Text style={styles.text}>
                Client : {pointageDetails.clientCode || 'Non spécifié'}
              </Text>
              <Text style={styles.text}>
                Mission Affectée :{' '}
                {pointageDetails.missionAffectee || 'Non spécifiée'}
              </Text>
              <Text style={styles.text}>
                Date : {pointageDetails.datePointage || 'Non spécifiée'}
              </Text>

              <View style={styles.row}>
                <Text style={styles.text}>Heure d'arrivée :</Text>
                <Text style={styles.text}>
                  {arrivalTime || 'Non spécifiée'}
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleSetCurrentTime('arrival')}>
                  <Text style={styles.buttonText}>Arrivée</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <Text style={styles.text}>Heure de Sortie :</Text>
                <Text style={styles.text}>
                  {departureTime || 'Non spécifiée'}
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleSetCurrentTime('departure')}>
                  <Text style={styles.buttonText}> Sortie </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.text}>État :</Text>
              <Picker
                selectedValue={etat}
                onValueChange={itemValue => setEtat(itemValue)}
                style={styles.picker}>
                <Picker.Item label="Annulé" value="Annulé" />
                <Picker.Item label="En cours" value="En cours" />
                <Picker.Item label="Complété" value="Complété" />
              </Picker>

              <Text style={styles.text}>Commentaire :</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Commentaire"
                value={commentaire || ''}
                onChangeText={setCommentaire}
              />

              <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Mettre à jour</Text>
              </TouchableOpacity>

              <View style={styles.reportButtonsContainer}>
                <TouchableOpacity
                  style={styles.navigationButton}
                  onPress={goToArticlePriceReport}>
                  <Text style={styles.buttonText}>Voir le Rapport de Prix</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navigationButton}
                  onPress={goToArticleQteReport}>
                  <Text style={styles.buttonText}>
                    Voir le Rapport de Quantité
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navigationButton}
                  onPress={goToFacing}>
                  <Text style={styles.buttonText}>
                    Voir le Rapport de Facing
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navigationButton}
                  onPress={toggleModal}>
                  <Text style={styles.buttonText}>Consulter les rapports</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.text}>
              Aucun détail de pointage disponible.
            </Text>
          )}
        </View>
      )}
      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 5,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  picker: {
    height: 50,
    width: 200,
    marginVertical: 5,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  reportButtonsContainer: {
    marginTop: 10,
  },
  navigationButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },

 modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
  },
  modalCloseButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
  },
});

export default MissionDetail;
