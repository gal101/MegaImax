import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { initializeDatabase, checkProductExists, updateProductStatus, products } from '../database';

export default function AIScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [productOnShelf, setProductOnShelf] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    initializeDatabase();  // Initialize the database
  }, []);

  const handleSearch = async (query) => {
    checkProductExists(query, (products) => {
      setSearchResults(products);
      if (products.length > 0) {
        setProductOnShelf(products[0].status === 'Available');
      }
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

  const handleReport = (product) => {
    setSelectedProduct(product);
    setShowReportOptions(true);
  };

  const submitReport = (reason: 'Not available' | 'Expired') => {
    if (selectedProduct) {
      updateProductStatus(selectedProduct.id, reason);
      setShowReportOptions(false);
      setSelectedProduct(null);
      handleSearch(searchQuery);
    }
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
                onPress={() => handleSelectRecommendation(product.title)}
                style={styles.recommendationItem}
              >
                <Image 
                  source={{ uri: product.image }} 
                  style={styles.recommendationImage}
                />
                <View style={styles.recommendationText}>
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
          <Text style={styles.searchResultsTitle}>Results for "{searchQuery}":</Text>
          {searchResults.map((product, index) => (
            <View key={index} style={styles.productCard}>
              <Image 
                source={{ uri: product.image }} 
                style={styles.productImage}
                resizeMode="contain"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productText}>{product.title}</Text>
                <Text style={styles.productText}>Price: ${product.price}</Text>
                <Text style={styles.productText}>Category: {product.category}</Text>
                <Text style={styles.productText}>Status: {product.status}</Text>
                
                {product.status === 'Available' && (
                  <TouchableOpacity
                    style={styles.reportButton}
                    onPress={() => handleReport(product)}
                  >
                    <Text style={styles.reportButtonText}>Report Issue</Text>
                  </TouchableOpacity>
                )}
              </View>

              {showReportOptions && selectedProduct?.id === product.id && (
                <View style={styles.reportOptionsContainer}>
                  <TouchableOpacity
                    style={styles.reportOption}
                    onPress={() => submitReport('Not available')}
                  >
                    <Text style={styles.reportOptionText}>Not available</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.reportOption}
                    onPress={() => submitReport('Expired')}
                  >
                    <Text style={styles.reportOptionText}>Expired</Text>
                  </TouchableOpacity>
                </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  recommendationImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
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
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    width: 80,  // Make button smaller
  },
  shelfButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  reportButton: {
    marginTop: 10,
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    width: 80,
    backgroundColor: '#FF0000',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportOptionsContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  reportOption: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#666',
    alignItems: 'center',
  },
  reportOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reportedContainer: {
    marginTop: 10,
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#666',
    alignItems: 'center',
  },
  reportedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
});