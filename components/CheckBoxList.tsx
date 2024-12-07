import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type CheckboxItem = {
  id: number;
  label: string;
  checked?: boolean;
};

type CheckboxListProps = {
  items: CheckboxItem[];
  onToggle?: (id: number, checked: boolean) => void; // Callback for toggling
};

const CheckboxList: React.FC<CheckboxListProps> = ({ items, onToggle }) => {
  const [checkboxes, setCheckboxes] = useState<CheckboxItem[]>(
    items.map((item) => ({ ...item, checked: item.checked || false }))
  );

  const handlePress = (id: number) => {
    const updatedCheckboxes = checkboxes.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setCheckboxes(updatedCheckboxes);

    // Trigger the callback if provided
    const toggledItem = updatedCheckboxes.find((item) => item.id === id);
    if (onToggle && toggledItem) {
      onToggle(toggledItem.id, toggledItem.checked!);
    }
  };

  return (
    <View style={styles.checklist}>
      {checkboxes.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.checkboxContainer}
          onPress={() => handlePress(item.id)}
        >
          <View
            style={[styles.checkbox, item.checked && styles.checkboxChecked]}
          >
            {item.checked && <View style={styles.checkmark} />}
          </View>
          <Text style={[styles.label, item.checked && styles.labelChecked]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  checklist: {
    backgroundColor: '#fff',
    width: 200,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#414856',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#4f29f0',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#4f29f0',
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  label: {
    fontSize: 16,
    color: '#414856',
  },
  labelChecked: {
    color: '#c3c8de',
    textDecorationLine: 'line-through',
  },
});

export default CheckboxList;
