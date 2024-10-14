/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import {Card} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ou la bibliothèque que vous utilisez
import {useRoute} from '@react-navigation/native';
import {API_BASE_URL} from '@env';
const ArticlePriceReport = () => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const [latestScannedData, setLatestScannedData] = useState([]);
  const [articles, setArticles] = useState([]);
  const [marques, setMarques] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [newCapacity, setNewCapacity] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [scanning, setScanning] = useState(false);
  const route = useRoute();
  const missionId = route.params?.missionId;

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      setLatestScannedData(codes[0].value);
      const scannedArticle = articles.find(
        article => article.ean === codes[0].value,
      );
      if (scannedArticle) {
        handleAddItem(scannedArticle);
        // Fermer la caméra
        setScanning(false);
        // Afficher l'article sélectionné dans l'UI
        setSelectedArticle(scannedArticle);
      } else {
        Alert.alert(
          'Article non trouvé',
          'Aucun article correspondant au code EAN scanné.',
        );
      }
    },
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const articlesResponse = await axios.get(
          `${API_BASE_URL}RapportPrix/GetArticles`,
        );
        const marquesResponse = await axios.get(
          `${API_BASE_URL}RapportPrix/GetMarques`,
        );

        setArticles(
          articlesResponse.data.map(article => ({
            label: article.designation,
            value: article.id,
            ean: article.ean,
          })),
        );
        setMarques(
          marquesResponse.data.map(marque => ({
            label: marque.intitule,
            value: marque.idMarque,
          })),
        );
      } catch (error) {
        console.error('Erreur lors de la récupération des données', error);
      }
    };

    fetchData();
  }, []);

  const handleAddItem = item => {
    if (!item || !item.value) {
      return;
    }
    const existingItem = selectedItems.find(
      selected => selected.value === item.value,
    );
    if (!existingItem) {
      setSelectedItems([
        ...selectedItems,
        {label: item.label, value: item.value, qte: []},
      ]);
    }
    setSelectedArticle(item);
  };

  const handleAddDetails = async () => {
    if (!selectedArticle || !selectedArticle.value) {
      Alert.alert('Erreur', 'Veuillez sélectionner un article.');
      return;
    }
    if (!selectedBrand) {
      Alert.alert('Erreur', 'Veuillez sélectionner une marque.');
      return;
    }
    if (!newCapacity.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une contenance.');
      return;
    }
    if (!newPrice.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un prix.');
      return;
    }
    if (!missionId) {
      Alert.alert('Erreur', 'Mission ID manquant.');
      return;
    }

    const data = {
      IdArticle: selectedArticle.value,
      IdMarque: selectedBrand,
      Contenance: parseFloat(newCapacity),
      Prix: parseFloat(newPrice),
      IdMission: missionId,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}RapportPrix/AddLigneMarquePrix`,
        data,
      );
      console.log('Réponse du backend:', response.data);
      Alert.alert('Succès', 'Détails ajoutés avec succès.');
    } catch (error) {
      console.error("Erreur lors de l'ajout des détails:", error);
      Alert.alert('Erreur', "Impossible d'ajouter les détails.");
    }

    const updatedItems = selectedItems.map(item => {
      if (item.value === selectedArticle.value) {
        const marque = marques.find(m => m.value === selectedBrand);
        return {
          ...item,
          qte: [
            ...item.qte,
            {
              brand: marque ? marque.label : 'Marque inconnue',
              capacity: parseFloat(newCapacity),
              price: parseFloat(newPrice),
            },
          ],
        };
      }
      return item;
    });

    setSelectedItems(updatedItems);
    setSelectedBrand(null);
    setNewCapacity('');
    setNewPrice('');
    setSelectedArticle(null);
  };

  const renderQte = ({item}) => (
    <View style={styles.qteRow}>
      <Text style={styles.qteText}>{item.brand}</Text>
      <Text style={styles.qteText}>{item.capacity} ML</Text>
      <Text style={styles.qteText}>{item.price} DT</Text>
    </View>
  );

  const renderArticle = ({item}) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.label}</Text>
          <FlatList
            data={item.qte}
            keyExtractor={(qte, index) => index.toString()}
            renderItem={renderQte}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucun détail ajouté</Text>
            }
          />
        </View>
        {selectedArticle && selectedArticle.value === item.value && (
          <View style={styles.addQteContainer}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={marques}
              labelField="label"
              valueField="value"
              placeholder="Marque"
              value={selectedBrand}
              // eslint-disable-next-line no-shadow
              onChange={item => setSelectedBrand(item.value)}
            />
            <TextInput
              placeholder="Contenance"
              value={newCapacity}
              onChangeText={setNewCapacity}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Prix"
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button
              title="Ajouter marque"
              onPress={handleAddDetails}
              color="#007BFF"
            />
          </View>
        )}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setSelectedArticle(item)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (device == null || !hasPermission) {
    return (
      <View style={styles.noPermissionContainer}>
        <Text>Pas d'accès à la caméra ou caméra introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={selectedItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderArticle}
        ListHeaderComponent={
          <View style={styles.searchContainer}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              data={articles}
              search
              labelField="label"
              valueField="value"
              placeholder="Sélectionner un article"
              searchPlaceholder="Rechercher..."
              onChange={item => handleAddItem(item)}
              renderLeftIcon={() => (
                <Icon
                  style={styles.icon}
                  color="black"
                  name="security" // Par exemple "security" au lieu de "Safety"
                  size={20}
                />
              )}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setScanning(true)}>
              <Icon name="camera" size={24} color="black" />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun article sélectionné</Text>
        }
      />
      {scanning && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={scanning}
          onRequestClose={() => setScanning(false)}>
          <Camera
            style={StyleSheet.absoluteFill}
            codeScanner={codeScanner}
            device={device}
            isActive={true}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#F5F5F5',
  },
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  icon: {
    marginRight: 10, // ou toute autre personnalisation
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#888888',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#000000',
  },
  card: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  addButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  qteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  qteText: {
    fontSize: 16,
    color: '#555555',
    flex: 1, // Adjusts the width to be flexible
    textAlign: 'left',
    marginHorizontal: 5, // Add margin to align items with spacing
  },
  addQteContainer: {
    marginTop: 15,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  scanButton: {
    position: 'absolute',
    left: 380,
    top: 27,
  },
  searchContainer: {
    width: '97%',
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#888888',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
  },
});

export default ArticlePriceReport;
