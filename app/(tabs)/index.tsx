import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Button, Text, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import NiceButton from '@/components/NiceButton';
import CheckboxList from '@/components/CheckBoxList';
import listsData from '@/lists.json';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { THEME_COLORS } from '@/theme/colors';

const JSON_FILE_PATH = FileSystem.documentDirectory + 'lists.json';

// Initialize the file system and file path
const initializeFileSystem = async () => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(JSON_FILE_PATH);
    if (!fileInfo.exists) {
      await FileSystem.writeAsStringAsync(
        JSON_FILE_PATH,
        JSON.stringify(listsData)
      );
      console.log('Initial file created successfully');
    }
  } catch (error) {
    console.error('Error initializing file system:', error);
  }
};

const TabScreen = () => {
  // State declarations
  const [lists, setLists] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [currentListId, setCurrentListId] = useState(null);

  useEffect(() => {
    // Load initial data from file
    const loadLists = async () => {
      try {
        await initializeFileSystem(); // Make sure file exists first
        const fileContent = await FileSystem.readAsStringAsync(JSON_FILE_PATH);
        const data = JSON.parse(fileContent);
        setLists(data.lists);
      } catch (error) {
        console.error('Error loading lists:', error);
        setLists(listsData.lists);
      }
    };
    loadLists();
  }, []);

  const handleCreateList = () => {
    setModalVisible(true);
  };

  const handleAddItem = (listId: number) => {
    setCurrentListId(listId);
    setItemModalVisible(true);
  };

  const handleSaveList = () => {
    if (newListTitle) {
      const maxId = lists.reduce((max, list) => Math.max(max, list.id), 0);
      const newList = {
        id: maxId + 1,
        title: newListTitle,
        items: [],
      };
      const updatedLists = [...lists, newList];
      setLists(updatedLists);
      saveListsToFile(updatedLists);
      setNewListTitle('');
      setModalVisible(false);
    }
  };

  const handleSaveItem = () => {
    if (newItemLabel && currentListId !== null) {
      const newLists = JSON.parse(JSON.stringify(lists)); // Deep copy
      const listToUpdate = newLists.find(list => list.id === currentListId);
      
      if (listToUpdate) {
        const maxItemId = listToUpdate.items.reduce((max, item) => Math.max(max, item.id), 0);
        const newItem = {
          id: maxItemId + 1,
          label: newItemLabel,
          checked: false,
        };
        listToUpdate.items.push(newItem);
        
        setLists(newLists);
        saveListsToFile(newLists);
        setNewItemLabel('');
        setItemModalVisible(false);
      }
    }
  };

  const handleToggle = (listId: number, itemId: number, checked: boolean) => {
    const newLists = JSON.parse(JSON.stringify(lists));
    const listToUpdate = newLists.find(list => list.id === listId);
    if (listToUpdate) {
      const item = listToUpdate.items.find(item => item.id === itemId);
      if (item) {
        item.checked = checked;
        setLists(newLists);
        saveListsToFile(newLists);
      }
    }
  };

  const handleDeleteItem = (listId: number, itemId: number) => {
    const newLists = JSON.parse(JSON.stringify(lists));
    const listToUpdate = newLists.find(list => list.id === listId);
    if (listToUpdate) {
      listToUpdate.items = listToUpdate.items.filter(item => item.id !== itemId);
      setLists(newLists);
      saveListsToFile(newLists);
    }
  };

  const handleDeleteList = (listId: number) => {
    const updatedLists = lists.filter(list => list.id !== listId);
    setLists(updatedLists);
    saveListsToFile(updatedLists);
  };

  const saveListsToFile = async (updatedLists) => {
    try {
      const dataToSave = { lists: updatedLists };
      await FileSystem.writeAsStringAsync(
        JSON_FILE_PATH,
        JSON.stringify(dataToSave, null, 2)
      );
      console.log('Lists saved to:', JSON_FILE_PATH);
      
      // Verify the save worked
      const verifyContent = await FileSystem.readAsStringAsync(JSON_FILE_PATH);
      const verifyData = JSON.parse(verifyContent);
      if (JSON.stringify(verifyData.lists) !== JSON.stringify(updatedLists)) {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Error saving lists:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Lists</Text>
      <FlatList
        data={lists}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>{item.title}</Text>
              {item.items.length === 0 && (
                <TouchableOpacity
                  style={styles.listDeleteButton}
                  onPress={() => handleDeleteList(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>
            <CheckboxList 
              key={String(item.id)}
              items={item.items}
              onToggle={(itemId, checked) => handleToggle(item.id, itemId, checked)}
              onDelete={(itemId) => handleDeleteItem(item.id, itemId)}
            />
            <TouchableOpacity 
              style={styles.addItemButton}
              onPress={() => handleAddItem(item.id)}
            >
              <Text style={styles.addItemButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <NiceButton onPress={handleCreateList} />
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalView, styles.slideUp]}>
              <Text style={styles.modalText}>Enter the name for the new list:</Text>
              <TextInput
                style={styles.input}
                value={newListTitle}
                onChangeText={setNewListTitle}
                autoFocus
                onSubmitEditing={() => handleSaveList()}
                keyboardType="default"
                returnKeyType="done"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  key="save-list"
                  style={[styles.button, styles.saveButton]} 
                  onPress={handleSaveList}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  key="cancel-list"
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="none"
        transparent={true}
        visible={itemModalVisible}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalView, styles.slideUp]}>
              <Text style={styles.modalText}>Enter the name for the new item:</Text>
              <TextInput
                style={styles.input}
                value={newItemLabel}
                onChangeText={setNewItemLabel}
                autoFocus
                onSubmitEditing={handleSaveItem}
                keyboardType="default"
                returnKeyType="done"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  key="save-item"
                  style={[styles.button, styles.saveButton]} 
                  onPress={handleSaveItem}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  key="cancel-item"
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setItemModalVisible(false)}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    marginTop: 10,
  },
  listContainer: {
    marginBottom: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listDeleteButton: {
    padding: 5,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  slideUp: {
    transform: [{ translateY: 0 }],
    animation: 'slideUp 0.3s ease-out',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: THEME_COLORS.primary,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME_COLORS.primary,
  },
  cancelButtonText: {
    color: THEME_COLORS.primary,
  },
  button: {
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  addItemButton: {
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  addItemButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default TabScreen;
