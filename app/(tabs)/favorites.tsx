import React, { useState, useCallback } from 'react';
import { FlatList, View, Image, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { getLikedProducts, removeLikedProduct, addListener } from './likedProducts';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Product } from './types';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

export default function FavoritesScreen() {
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);

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

  const renderFavorite = ({ item }: { item: Product }) => (
    <View style={styles.favoriteCard}>
      <Image source={{ uri: item.image }} style={styles.favoriteImage} />
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.productTitle}>{item.title}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.productPrice}>{item.price.toFixed(2)} RON</Text>
          <Text style={styles.categoryTag}>{item.category}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => removeFromFavorites(item)}
          style={styles.removeButton}
        >
          <Icon name="trash" size={20} color="#ff4d4d" />
        </TouchableOpacity>
      </View>
    </View>
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
});
