import { EventEmitter } from 'events';
import productsData from './database.json';

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  description: string;
  category: string;
  status?: 'Available' | 'Not available' | 'Expired';
}

// Initialize products with status
export const products: Product[] = productsData.map(product => ({
  ...product,
  status: 'Available'
}));

export const databaseEvents = new EventEmitter();

export const initializeDatabase = () => {
  // Inițializarea bazei de date
};

export const addProduct = (name: string, category: string, type: string, aisle: string) => {
  products.push({ id: products.length + 1, name, category, type, aisle });
};

export const checkProductExists = (query: string, callback: (products: Product[]) => void) => {
  const foundProducts = products.filter(product => 
    product.title.toLowerCase().includes(query.toLowerCase())
  );
  callback(foundProducts);
};

export const updateProductStatus = (id: number, newStatus: Product['status']) => {
  const productIndex = products.findIndex(product => product.id === id);
  if (productIndex !== -1) {
    products[productIndex].status = newStatus;
    databaseEvents.emit('productsUpdated', products);
  }
};

export const clearProductReport = (id: number) => {
  updateProductStatus(id, 'Available');
};

export { products };