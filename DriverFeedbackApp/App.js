import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import axios from 'axios';

export default function App() {
  const [location, setLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [isCollecting, setIsCollecting] = useState(false);

  // Request permissions and start GPS tracking
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Enable location permissions to use the app.');
        return;
      }
    })();

    Accelerometer.setUpdateInterval(1000); // Set accelerometer update interval to 1 second
  }, []);

  const startDataCollection = () => {
    setIsCollecting(true);

    // Start location tracking
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
      (locationData) => {
        setLocation(locationData.coords);
        setSpeed(locationData.coords.speed * 3.6); // Convert m/s to km/h
      }
    );

    // Start accelerometer tracking
    Accelerometer.addListener((data) => {
      setAccelerometerData(data);
    });
  };

  const stopDataCollection = () => {
    setIsCollecting(false);
    Accelerometer.removeAllListeners();
  };

  const sendDataToBackend = async () => {
    if (!location) {
      Alert.alert('Data Missing', 'GPS data is not available yet.');
      return;
    }

    try {
      const response = await axios.post('http://172.16.45.70:5000/collect-data', {
        speed,
        accelerometer: accelerometerData,
        location: {
            latitude: location.latitude,
            longitude: location.longitude,
        },
    });
   
      Alert.alert('Data Sent', response.data.message);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send data to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Speed: {speed.toFixed(2)} km/h</Text>
      <Text style={styles.text}>Accelerometer X: {accelerometerData.x.toFixed(2)}</Text>
      <Text style={styles.text}>Accelerometer Y: {accelerometerData.y.toFixed(2)}</Text>
      <Text style={styles.text}>Accelerometer Z: {accelerometerData.z.toFixed(2)}</Text>
      <Text style={styles.text}>
        Location: {location ? `${location.latitude}, ${location.longitude}` : 'Fetching...'}
      </Text>
      <Button
        title={isCollecting ? 'Stop Data Collection' : 'Start Data Collection'}
        onPress={isCollecting ? stopDataCollection : startDataCollection}
      />
      <Button title="Send Data to Backend" onPress={sendDataToBackend} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
});
