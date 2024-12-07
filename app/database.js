import { Ionicons } from '@expo/vector-icons';
const products = [
  { id: 1, name: 'Banana', category: 'Fruit', type: 'Turkish', aisle: 'Fruits' },
  { id: 2, name: 'Banana', category: 'Fruit', type: 'Romanian', aisle: 'Fruits' },
  { id: 3, name: 'Apple', category: 'Fruit', type: 'Green', aisle: 'Fruits' },
  { id: 4, name: 'Grapes', category: 'Fruit', type: 'Red', aisle: 'Fruits' },
  { id: 5, name: 'Mango', category: 'Fruit', type: 'Indian', aisle: 'Fruits' },
  { id: 6, name: 'Carrot', category: 'Vegetable', type: 'Organic', aisle: 'Vegetables' },
  { id: 7, name: 'Broccoli', category: 'Vegetable', type: 'Fresh', aisle: 'Vegetables' },
  { id: 8, name: 'Chicken Breast', category: 'Meat', type: 'Boneless', aisle: 'Meat' },
  { id: 9, name: 'Salmon', category: 'Fish', type: 'Wild', aisle: 'Seafood' },
  { id: 10, name: 'Milk', category: 'Dairy', type: 'Whole', aisle: 'Dairy' },
  { id: 11, name: 'Cheddar Cheese', category: 'Dairy', type: 'Aged', aisle: 'Dairy' },
  { id: 12, name: 'Bread', category: 'Bakery', type: 'Whole Wheat', aisle: 'Bakery' },
  { id: 13, name: 'Croissant', category: 'Bakery', type: 'Butter', aisle: 'Bakery' },
  { id: 14, name: 'Orange Juice', category: 'Beverage', type: 'Fresh', aisle: 'Beverages' },
  { id: 15, name: 'Coffee', category: 'Beverage', type: 'Ground', aisle: 'Beverages' }
];
export const initializeDatabase = () => {
  // Inițializarea bazei de date
};
export const addProduct = (name, category, type, aisle) => {
  products.push({ id: products.length + 1, name, category, type, aisle });
};
export const checkProductExists = (name, callback) => {
  const foundProduct = products.filter(product => product.name.toLowerCase() === name.toLowerCase());
  callback(foundProduct);
};
export const updateProductAisle = (id, newAisle) => {
  const productIndex = products.findIndex(product => product.id === id);
  if (productIndex !== -1) {
    products[productIndex].aisle = newAisle;
  }
};
export { products };