import { Product } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'liked_products';
let likedProducts: Product[] = [];
const listeners: (() => void)[] = [];

const saveToStorage = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(likedProducts));
  } catch (error) {
    console.error('Error saving liked products:', error);
  }
};

const loadFromStorage = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      likedProducts = JSON.parse(stored);
      notifyListeners();
    }
  } catch (error) {
    console.error('Error loading liked products:', error);
  }
};

export const getLikedProducts = () => [...likedProducts];

export const addLikedProduct = async (product: Product) => {
  if (!likedProducts.some(p => p.id === product.id)) {
    likedProducts = [...likedProducts, product];
    await saveToStorage();
    notifyListeners();
    return true;
  }
  return false;
};

export const removeLikedProduct = async (product: Product) => {
  const initialLength = likedProducts.length;
  likedProducts = likedProducts.filter(p => p.id !== product.id);
  if (initialLength !== likedProducts.length) {
    await saveToStorage();
    notifyListeners();
    return true;
  }
  return false;
};

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const addListener = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

// Initialize by loading saved products
loadFromStorage();
