import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000/api/v1/properties'
  : 'http://localhost:5000/api/v1/properties';


export default function App() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`${API_URL}?limit=100&offset=0`);
        if (!response.ok) {
          throw new Error(`Failed to load: ${response.status}`);
        }
        const data = await response.json();
        setProperties(data.items || []);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00bfff" />
        <Text style={styles.infoText}>Loading properties...</Text>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[styles.infoText, styles.errorText]}>Error: {error}</Text>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.propertyCard}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.city}, {item.state ?? ''}</Text>
      <Text style={styles.body}>Price: {item.currencyCode ?? item.currency_code ?? ''} {item.price}</Text>
      <Text style={styles.body}>Bedrooms: {item.bedrooms ?? 0}, Bathrooms: {item.bathrooms ?? 0}</Text>
      <Text style={styles.body}>Yield: {item.rentalYield ?? item.rental_yield ?? 'N/A'}%</Text>
      <Text style={styles.body}>AI Score: {item.aiValueScore ?? item.ai_value_score ?? 'N/A'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Investify - Properties</Text>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00bfff',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  propertyCard: {
    backgroundColor: '#101a30',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#343f64',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    color: '#5ec9ff',
    marginBottom: 6,
  },
  body: {
    color: '#cecece',
    marginBottom: 2,
  },
  infoText: {
    color: '#ffffff',
    marginTop: 16,
  },
  errorText: {
    color: '#ff6666',
  },
});
