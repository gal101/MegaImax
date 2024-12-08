import { Product } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'liked_products';
const JSONBIN_BIN_ID = '67551fb1e41b4d34e461b1d3';
const JSONBIN_MASTER_KEY = '$2a$10$8Iblx7QYFXoRdZJlQKtG1.vYKlhodTx/6w0G1bsgIWjMRsthflNC2';
const JSONBIN_API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

let likedProducts: Product[] = [];
const listeners: (() => void)[] = [];

// Add this new function to fetch latest product data
const fetchLatestProductData = async () => {
  try {
    const response = await fetch(JSONBIN_API_URL, {
      method: 'GET',
      headers: {
        'X-Master-Key': JSONBIN_MASTER_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from JSONbin.io');
    }

    const data = await response.json();
    return data.record;
  } catch (error) {
    console.error('Error fetching latest product data:', error);
    return null;
  }
};

// Modify saveToStorage to include status refresh
const saveToStorage = async () => {
  try {
    // Fetch latest product data
    const latestProducts = await fetchLatestProductData();
    
    if (latestProducts) {
      // Update status of liked products
      likedProducts = likedProducts.map(liked => {
        const latest = latestProducts.find(p => p.id === liked.id);
        return latest ? { ...liked, status: latest.status } : liked;
      });
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(likedProducts));
    notifyListeners();
  } catch (error) {
    console.error('Error saving liked products:', error);
  }
};

const loadFromStorage = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      likedProducts = JSON.parse(stored);
      await saveToStorage(); // This will refresh statuses
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

// Add new function to manually refresh statuses
export const refreshProductStatuses = async () => {
  await saveToStorage();
};

// Initialize by loading saved products
loadFromStorage();
