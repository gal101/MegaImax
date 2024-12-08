import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { checkProductExists, clearProductReport, products } from '../database';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { initializeDatabase } from '../database';

export default function EmployeesScreen() {
  const { searchQuery: initialSearch } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useFocusEffect(
    useCallback(() => {
      // Initialize database when tab is focused
      initializeDatabase();

      if (initialSearch) {
        setSearchQuery(initialSearch.toString());
        handleSearch(initialSearch.toString());
      }
    }, [initialSearch])
  );

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch.toString());
      handleSearch(initialSearch.toString());
    }
  }, [initialSearch]);

  const handleSearch = (query) => {
    checkProductExists(query, (products) => {
      setSearchResults(products);
    });
  };

  const handleInputChange = (text) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(text.toLowerCase())
      );
      setRecommendations(filteredProducts);
    } else {
      setRecommendations([]);
    }
  };

  const handleSelectRecommendation = (productTitle) => {
    setSearchQuery(productTitle);
    setRecommendations([]);
    handleSearch(productTitle);
  };

  const handleResolveReport = (productId) => {
    clearProductReport(productId);
    handleSearch(searchQuery); // Refresh results
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Employee Dashboard</Text>

      <View style={styles.searchSection}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search product to resolve"
            value={searchQuery}
            onChangeText={handleInputChange}
            onSubmitEditing={() => handleSearch(searchQuery)}
            style={styles.input}
          />
        </View>
        {recommendations.length > 0 && (
          <View style={styles.recommendations}>
            {recommendations.map((product, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectRecommendation(product.title)}
                style={styles.recommendationItem}
              >
                <Image 
                  source={{ uri: product.image }} 
                  style={styles.recommendationImage}
                />
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>{product.title}</Text>
                  <Text style={styles.recommendationPrice}>${product.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          {searchResults.map((product, index) => (
            <View key={index} style={styles.productCard}>
              <Image 
                source={{ uri: product.image }} 
                style={styles.productImage}
                resizeMode="contain"
              />
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{product.title}</Text>
                <Text style={styles.priceText}>${product.price}</Text>
              </View>
              <Text style={styles.description}>{product.description}</Text>
              
              {(product.status === 'Not available' || product.status === 'Expired') && (
                <TouchableOpacity
                  style={styles.resolveButton}
                  onPress={() => handleResolveReport(product.id)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.resolveButtonText}>Mark as Available</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    paddingTop: 60, // Add this to match other tabs
    padding: 20,
  },
  title: { // Change to headerTitle to match other tabs
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  recommendations: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    zIndex: 1,
    elevation: 3,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recommendationText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  searchResults: {
    marginTop: 20,
  },
  searchResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  productDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  detailText: {
    color: '#666',
    marginVertical: 3,
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  resolveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  priceText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  description: {
    color: '#666',
    marginVertical: 5,
  },
  recommendationImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  recommendationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  recommendationTitle: {
    fontSize: 16,
    color: '#333',
  },
  recommendationPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
