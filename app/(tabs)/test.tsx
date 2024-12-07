import React from 'react';
import { View, StyleSheet } from 'react-native';
import CheckboxList from '@/components/CheckBoxList';

const TestScreen = () => {
  const items = [
    { id: 1, label: 'Bread' },
    { id: 2, label: 'Cheese' },
    { id: 3, label: 'Coffee' },
  ];

  const handleToggle = (id: number, checked: boolean) => {
    console.log(`Item ${id} is now ${checked ? 'checked' : 'unchecked'}`);
  };

  return (
    <View style={styles.container}>
      <CheckboxList items={items} onToggle={handleToggle} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default TestScreen;
