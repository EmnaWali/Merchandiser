/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  Modal,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

const Facing = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [scanning, setScanning] = useState(false);
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null); // Create a ref for the Camera

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto(); // Use the camera ref
        console.log('Photo Object:', photo); // Log the photo object to see its structure
        setPhoto(photo);
        setScanning(false); // Close the camera after taking the photo
      } catch (error) {
        console.error('Erreur lors de la prise de photo:', error);
        Alert.alert('Erreur', 'Une erreur s\'est produite lors de la prise de photo.');
      }
    }
  };
  if (device == null || !hasPermission) {
    return (
      <View style={styles.noPermissionContainer}>
        <Text>Pas d'accès à la caméra ou caméra introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="Prendre une photo" onPress={() => setScanning(true)} />
      {photo && (
        <Image
          source={{ uri: photo.path }} // Ensure the image path is correct
          style={styles.image}
        />
      )}

      {scanning && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={scanning}
          onRequestClose={() => setScanning(false)}>
          <View style={styles.cameraContainer}>
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={true}
              photo={true} // Enable photo capture
              ref={cameraRef} // Assign ref to the Camera
            />
            <Button title="Prendre Photo" onPress={handleTakePhoto} />
            <Button title="Annuler" onPress={() => setScanning(false)} />
          </View>
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
  cameraContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    marginVertical: 10,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Facing;
