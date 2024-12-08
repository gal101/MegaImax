import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, View, Image, TouchableOpacity, StyleSheet, Text, TextInput, Platform, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { addLikedProduct, removeLikedProduct, getLikedProducts, addListener } from './likedProducts';
import productsData from '../database.json';
import { Product } from './types';
import * as Haptics from 'expo-haptics';
import { updateProductStatus } from '../database';
import { products as dbProducts, databaseEvents } from '../database';
import { useFocusEffect } from '@react-navigation/native';
import { initializeDatabase } from '../database';
import { addXP, ISSUE_NOT_AVAILABLE, ISSUE_EXPIRED } from '../userProgress';

export default function ProductsScreen() {
  const [products, setProducts] = useState(dbProducts);
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'title'>('title');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [reportingProduct, setReportingProduct] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      // Initialize database and update products when tab is focused
      initializeDatabase();

      // Existing liked products listener
      setLikedProducts(getLikedProducts());
      const likedUnsubscribe = addListener(() => {
        setLikedProducts(getLikedProducts());
      });

      // Add database events listener
      const handleDatabaseUpdate = () => {
        setProducts([...dbProducts]);
      };
      databaseEvents.addListener('productsUpdated', handleDatabaseUpdate);

      return () => {
        likedUnsubscribe();
        databaseEvents.removeListener('productsUpdated', handleDatabaseUpdate);
      };
    }, [])
  );

  const isLiked = useCallback((product: Product) => {
    return likedProducts.some(p => p.id === product.id);
  }, [likedProducts]);

  const toggleLike = useCallback(async (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isLiked(product)) {
      await removeLikedProduct(product);
    } else {
      await addLikedProduct(product);
    }
    setLikedProducts(getLikedProducts());
  }, [isLiked]);

  const handleReport = (productId: number) => {
    if (selectedProduct) {
      // If in modal, show modal options
      setShowReportOptions(true);
    } else {
      // If in panel, show panel options
      setReportingProduct(productId);
    }
  };

  const submitReport = (status: 'Not available' | 'Expired') => {
    if (selectedProduct) {
      updateProductStatus(selectedProduct.id, status);
      addXP(); // Add XP for reporting
      setShowReportOptions(false);
      setSelectedProduct(null);
    }
  };

  const handlePanelReport = (product: Product, issueType: number) => {
    updateProductStatus(product.id, issueType);
    addXP(10); // Award XP for reporting
    setReportingProduct(null);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setReportingProduct(null);
    setShowReportOptions(false);
  };

  const filteredProducts = products.filter((product: Product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a: Product, b: Product) => {
    if (sortBy === 'price') return a.price - b.price;
    return a.title.localeCompare(b.title);
  });

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductSelect(item)}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productDescription} numberOfLines={1}>{item.description}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{item.price.toFixed(2)} RON</Text>
          <TouchableOpacity 
            onPress={() => toggleLike(item)} 
            style={styles.heartButton}
          >
            <Icon 
              name="heart" 
              size={20} 
              color={isLiked(item) ? '#ff4d4d' : '#ddd'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Products</Text>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortBy(sortBy === 'price' ? 'title' : 'price')}
        >
          <Icon name="sort" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={selectedProduct !== null}
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedProduct(null)}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            
            {selectedProduct && (
              <ScrollView>
                <Image 
                  source={{ uri: selectedProduct.image }} 
                  style={styles.modalImage} 
                  resizeMode="contain"
                />
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedProduct.title}</Text>
                  <Text style={styles.modalPrice}>
                    {selectedProduct.price.toFixed(2)} RON
                  </Text>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.likeButton}
                    onPress={() => toggleLike(selectedProduct)}
                  >
                    <Icon 
                      name="heart" 
                      size={20} 
                      color={isLiked(selectedProduct) ? '#ff4d4d' : '#666'} 
                    />
                    <Text style={styles.likeButtonText}>
                      {isLiked(selectedProduct) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Text>
                  </TouchableOpacity>

                  {selectedProduct.status === 'Available' && (
                    <>
                      <TouchableOpacity
                        style={styles.reportButton}
                        onPress={() => handleReport(selectedProduct.id)}
                      >
                        <Text style={styles.reportButtonText}>Report Issue</Text>
                      </TouchableOpacity>

                      {showReportOptions && (
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
                    </>
                  )}
                </View>

                <View style={styles.modalDetails}>
                  <Text style={styles.modalDetailText}>
                    Category: {selectedProduct.category}
                  </Text>
                  <Text style={styles.modalDetailText}>
                    Status: {selectedProduct.status}
                  </Text>
                  <Text style={styles.modalDetailText}>
                    <Icon name="map-marker" size={16} color="#666" /> Location: {selectedProduct.location}
                  </Text>
                </View>

                <Text style={styles.modalDescription}>
                  {selectedProduct.description}
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60, // Add padding instead of spacer
  },
  searchContainer: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      },
      android: {
        elevation: 4,
        marginBottom: 4,
      },
    }),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  sortButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: Platform.OS === 'android' ? 1 : 0, // Fix shadow clipping on Android
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
        backgroundColor: '#fff',
      },
    }),
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2f2f2f',
  },
  heartButton: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
    padding: 5,
  },
  modalImage: {
    width: '100%',
    height: 200, // Reduced height
    marginBottom: 15,
  },
  modalHeader: {
    marginBottom: 10,
  },
  actionButtons: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2f2f2f',
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 20,
  },
  modalDetails: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  modalDetailText: {
    fontSize: 16,
    color: '#444',
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  likeButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  reportButton: {
    marginTop: 10,
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
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
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniReportButton: {
    padding: 6,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportButtonsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  reportOptionButton: {
    backgroundColor: '#666',
    borderRadius: 4,
    padding: 4,
  },
  miniReportText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});
