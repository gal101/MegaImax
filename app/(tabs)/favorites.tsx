import React, { useState, useCallback } from 'react';
import { FlatList, View, Image, StyleSheet, Text, TouchableOpacity, Platform, Modal, ScrollView } from 'react-native';
import { getLikedProducts, removeLikedProduct, addListener } from './likedProducts';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Product } from './types';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { updateProductStatus } from '../database';

export default function FavoritesScreen() {
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showReportOptions, setShowReportOptions] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLikedProducts(getLikedProducts());
      const unsubscribe = addListener(() => {
        setLikedProducts(getLikedProducts());
      });
      return () => unsubscribe();
    }, [])
  );

  const removeFromFavorites = useCallback(async (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await removeLikedProduct(product);
    setLikedProducts(getLikedProducts());
  }, []);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowReportOptions(false);
  };

  const handleReport = () => {
    if (selectedProduct) {
      setShowReportOptions(true);
    }
  };

  const submitReport = (reason: 'Not available' | 'Expired') => {
    if (selectedProduct) {
      updateProductStatus(selectedProduct.id, reason);
      setShowReportOptions(false);
      setSelectedProduct(null);
    }
  };

  const renderFavorite = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.favoriteCard}
      onPress={() => handleProductSelect(item)}
    >
      <Image source={{ uri: item.image }} style={styles.favoriteImage} />
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.productTitle}>{item.title}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.productPrice}>{item.price.toFixed(2)} RON</Text>
          <Text style={styles.categoryTag}>{item.category}</Text>
          {item.status !== 'Available' && (
            <Text style={[styles.statusTag, 
              { backgroundColor: item.status === 'Expired' ? '#ff8c00' : '#ff4444' }]}>
              {item.status}
            </Text>
          )}
        </View>
        <TouchableOpacity 
          onPress={() => removeFromFavorites(item)}
          style={styles.removeButton}
        >
          <Icon name="trash" size={20} color="#ff4d4d" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Favorites</Text>
      {likedProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="heart-o" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No favorite products yet</Text>
        </View>
      ) : (
        <FlatList
          data={likedProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFavorite}
          contentContainerStyle={styles.list}
        />
      )}

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
                    onPress={() => removeFromFavorites(selectedProduct)}
                  >
                    <Icon name="heart" size={20} color="#ff4d4d" />
                    <Text style={styles.likeButtonText}>Remove from Favorites</Text>
                  </TouchableOpacity>

                  {selectedProduct.status === 'Available' && (
                    <>
                      <TouchableOpacity
                        style={styles.reportButton}
                        onPress={handleReport}
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
  list: {
    padding: 16,
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    margin: Platform.OS === 'android' ? 1 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  favoriteImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  textContainer: {
    flex: 1,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2f2f2f',
    marginBottom: 8,
  },
  categoryTag: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  removeButton: {
    padding: 8,
    marginLeft: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statusTag: {
    fontSize: 12,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
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
    height: 200,
    marginBottom: 15,
  },
  modalHeader: {
    marginBottom: 10,
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
  },
  actionButtons: {
    marginBottom: 15,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
  },
  likeButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  reportButton: {
    padding: 15,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportOptionsContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});
