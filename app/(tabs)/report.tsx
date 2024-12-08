import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { products, databaseEvents, initializeDatabase, clearAllProductsByStatus } from '../database';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function ReportScreen() {
  const router = useRouter();
  const [reportedProducts, setReportedProducts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      // Initialize database when tab is focused
      initializeDatabase();
      
      // Initial load
      loadReportedProducts();

      // Add database events listener
      const handleDatabaseUpdate = () => {
        loadReportedProducts();
      };
      databaseEvents.addListener('productsUpdated', handleDatabaseUpdate);

      return () => {
        databaseEvents.removeListener('productsUpdated', handleDatabaseUpdate);
      };
    }, [])
  );

  const loadReportedProducts = () => {
    const filtered = products.filter(
      product => product.status === 'Not available' || product.status === 'Expired'
    );
    setReportedProducts(filtered);
  };

  const handleProductPress = (product) => {
    // Navigate to employees tab with search query
    router.push({
      pathname: '/employees',
      params: { searchQuery: product.title }
    });
  };

  const clearProductsByCategory = (category) => {
    clearAllProductsByStatus(category);
  };

  const groupedReports = {
    'Not available': reportedProducts.filter(p => p.status === 'Not available'),
    'Expired': reportedProducts.filter(p => p.status === 'Expired')
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Reports</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="alert-circle" size={24} color="#ff4444" />
          <Text style={styles.statNumber}>
            {groupedReports['Not available'].length}
          </Text>
          <Text style={styles.statLabel}>Not available</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="warning" size={24} color="#ff8c00" />
          <Text style={styles.statNumber}>
            {groupedReports['Expired'].length}
          </Text>
          <Text style={styles.statLabel}>Expired</Text>
        </View>
      </View>

      {Object.entries(groupedReports).map(([type, products]) => (
        <View key={type} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons 
                name={type === 'Expired' ? 'warning' : 'alert-circle'} 
                size={24} 
                color={type === 'Expired' ? '#ff8c00' : '#ff4444'}
                style={styles.sectionHeaderIcon} 
              />
              <Text style={styles.sectionTitle}>{type}</Text>
            </View>
            {products.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => clearProductsByCategory(type)}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          {products.map((product, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.productCard}
              onPress={() => handleProductPress(product)}
            >
              <Image 
                source={{ uri: product.image }} 
                style={styles.productImage}
                resizeMode="contain"
              />
              <Text style={styles.productName}>{product.title}</Text>
              <View style={styles.productDetails}>
                <Text style={styles.detailText}>Price: ${product.price}</Text>
                <Text style={styles.detailText}>Category: {product.category}</Text>
                <Text style={[styles.reportText, 
                  { color: type === 'Expired' ? '#ff8c00' : '#ff4444' }]}>
                  Status: {product.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {products.length === 0 && (
            <Text style={styles.noReports}>No reports of this type</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60, // Add padding instead of spacer
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '45%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 5,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 0, // Remove bottom margin since parent has padding
    color: '#666',
  },
  clearButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDetails: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailText: {
    color: '#666',
    marginVertical: 2,
  },
  reportText: {
    marginTop: 5,
    fontWeight: 'bold',
  },
  noReports: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
});
