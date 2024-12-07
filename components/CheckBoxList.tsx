import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME_COLORS } from '@/theme/colors';

type CheckboxItem = {
  id: number;
  label: string;
  checked?: boolean;
};

type CheckboxListProps = {
  items: CheckboxItem[];
  onToggle?: (id: number, checked: boolean) => void; // Callback for toggling
  onDelete?: (id: number) => void;
};

const CheckboxList: React.FC<CheckboxListProps> = ({ items, onToggle, onDelete }) => {
  const handlePress = (id: number, currentChecked: boolean) => {
    if (onToggle) {
      onToggle(id, !currentChecked);
    }
  };

  return (
    <View style={styles.checklist}>
      {items.map((item) => (
        <View key={item.id} style={styles.itemContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handlePress(item.id, item.checked || false)}
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
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete?.(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#888" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  checklist: {
    backgroundColor: '#fff',
    width: '100%', // Changed from 200 to full width
    padding: 20,
    borderRadius: 10,
    shadowColor: '#414856',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingRight: 0, // Remove any padding that might affect alignment
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10, // Add some space between checkbox and delete button
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: THEME_COLORS.primary,
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  label: {
    fontSize: 16,
    color: THEME_COLORS.text,
  },
  labelChecked: {
    color: THEME_COLORS.textLight,
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: 8,
    position: 'absolute',
    right: 0,
    alignSelf: 'center',
  },
});

export default CheckboxList;
