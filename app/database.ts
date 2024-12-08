import { EventEmitter } from 'events';

const JSONBIN_BIN_ID = '67551fb1e41b4d34e461b1d3';
const JSONBIN_MASTER_KEY = '$2a$10$8Iblx7QYFXoRdZJlQKtG1.vYKlhodTx/6w0G1bsgIWjMRsthflNC2';
const JSONBIN_API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  description: string;
  category: string;
  status: 'Available' | 'Not available' | 'Expired';
}

export const products: Product[] = [];
export const databaseEvents = new EventEmitter();

export const initializeDatabase = async () => {
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
    // JSONbin.io wraps the data in a record object, we need the actual array
    const productsData = data.record;
    
    // Clear existing products and add new ones
    products.splice(0, products.length, ...productsData);
    databaseEvents.emit('productsUpdated', products);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export const refreshLikedProducts = async () => {
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
    const productsData = data.record;
    
    // Update products array
    products.splice(0, products.length, ...productsData);
    databaseEvents.emit('productsUpdated', products);
  } catch (error) {
    console.error('Error refreshing products:', error);
  }
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

export const updateProductStatus = async (id: number, newStatus: Product['status']) => {
  const productIndex = products.findIndex(product => product.id === id);
  if (productIndex !== -1) {
    products[productIndex].status = newStatus;
    
    try {
      // Update JSONbin.io with the new data
      const response = await fetch(JSONBIN_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_MASTER_KEY,
        },
        body: JSON.stringify(products),
      });

      if (!response.ok) {
        throw new Error('Failed to update data in JSONbin.io');
      }

      databaseEvents.emit('productsUpdated', products);
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  }
};

export const clearProductReport = async (id: number) => {
  await updateProductStatus(id, 'Available');
};

export { products };