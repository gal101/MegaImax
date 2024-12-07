import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { initializeDatabase, checkProductExists, updateProductAisle, products } from '../database';
export default function AIScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [productOnShelf, setProductOnShelf] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  useEffect(() => {
    initializeDatabase();  // Initialize the database
  }, []);
  const handleSearch = async (query) => {
    checkProductExists(query, (products) => {
      setSearchResults(products);
      if (products.length > 0) {
        setProductOnShelf(products[0].aisle !== 'Not on shelf');
      }
    });
  };
  const handleToggleShelfStatus = (product) => {
    const newAisleStatus = product.aisle === 'Not on shelf' ? 'Fruits' : 'Not on shelf';
    updateProductAisle(product.id, newAisleStatus);
    setProductOnShelf(newAisleStatus !== 'Not on shelf');
    handleSearch(searchQuery);  // Refresh the search results
  };
  const handleInputChange = (text) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filteredProducts = products.filter(product =>
        product.name.toLowerCase().startsWith(text.toLowerCase())
      );
      setRecommendations(filteredProducts);
    } else {
      setRecommendations([]);
    }
  };
  const handleSelectRecommendation = (productName) => {
    setSearchQuery(productName);
    setRecommendations([]);
    handleSearch(productName);
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Search Bar</Text>
      <View style={styles.searchBarContainer}>
        <TextInput
          placeholder="Căutați un produs"
          value={searchQuery}
          onChangeText={handleInputChange}
          onSubmitEditing={() => handleSearch(searchQuery)}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
        {recommendations.length > 0 && (
          <View style={styles.recommendations}>
            {recommendations.map((product, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectRecommendation(product.name)}
                style={styles.recommendationItem}
              >
                <Text style={styles.recommendationText}>{product.name} ({product.type})</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <Text style={styles.searchResultsTitle}>Rezultate pentru "{searchQuery}":</Text>
          {searchResults.map((product, index) => (
            <View key={index} style={styles.productCard}>
              <Text style={styles.productText}>Nume: {product.name}</Text>
              <Text style={styles.productText}>Categorie: {product.category}</Text>
              <Text style={styles.productText}>Tip: {product.type}</Text>
              <Text style={styles.productText}>Raft: {product.aisle}</Text>
              <TouchableOpacity
                style={[
                  styles.shelfButton,
                  { backgroundColor: product.aisle !== 'Not on shelf' ? '#4CAF50' : '#F44336' }
                ]}
                onPress={() => handleToggleShelfStatus(product)}
              >
                <Text style={styles.shelfButtonText}>
                  {product.aisle !== 'Not on shelf' ? 'Pe raft' : 'Nu este pe raft'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    flexGrow: 1, // This will make sure the content fills the screen vertically
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  searchBarContainer: {
    marginBottom: 20,
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  input: {
    padding: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    width: '80%', // Adjust width as needed
  },
  recommendations: {
    position: 'absolute',
    top: 60, // Adjust this value based on the height of the input
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1,
  },
  recommendationItem: {
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  recommendationText: {
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
    color: '#333',
  },
  productCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  productText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  shelfButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  shelfButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});