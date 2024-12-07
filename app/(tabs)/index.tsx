import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Button, Text, Modal, TextInput, TouchableOpacity } from 'react-native';
import NiceButton from '@/components/NiceButton';
import CheckboxList from '@/components/CheckBoxList';
import listsData from '@/lists.json';
import * as FileSystem from 'expo-file-system';

const TabScreen = () => {
  const [lists, setLists] = useState(listsData.lists);
  const [modalVisible, setModalVisible] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [currentListId, setCurrentListId] = useState(null);

  const handleCreateList = () => {
    setModalVisible(true);
  };

  const handleSaveList = () => {
    if (newListTitle) {
      const newList = {
        id: lists.length + 1,
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

  const handleAddItem = (listId) => {
    setCurrentListId(listId);
    setItemModalVisible(true);
  };

  const handleSaveItem = () => {
    if (newItemLabel && currentListId !== null) {
      const updatedLists = lists.map((list) => {
        if (list.id === currentListId) {
          const newItem = {
            id: list.items.length + 1 + currentListId * 100,
            label: newItemLabel,
            checked: false,
          };
          list.items.push(newItem);
        }
        return list;
      });
      setLists(updatedLists);
      saveListsToFile(updatedLists);
      setNewItemLabel(newItemLabel);
      setItemModalVisible(false);
    }
  };

  const saveListsToFile = async (updatedLists) => {
    const fileUri = FileSystem.documentDirectory + 'lists.json';
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify({ lists: updatedLists }));
  };

  return (
    <View style={styles.container}>
      <NiceButton onPress={handleCreateList} />
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <CheckboxList items={item.items} />
            <Button title="+" onPress={() => handleAddItem(item.id)} />
          </View>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Enter the name for the new list:</Text>
            <TextInput
              style={styles.input}
              value={newListTitle}
              onChangeText={setNewListTitle}
            />
            <TouchableOpacity style={styles.button} onPress={handleSaveList}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={itemModalVisible}
        onRequestClose={() => setItemModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Enter the name for the new item:</Text>
            <TextInput
              style={styles.input}
              value={newItemLabel}
              onChangeText={setNewItemLabel}
            />
            <TouchableOpacity style={styles.button} onPress={handleSaveItem}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setItemModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
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
  listContainer: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  button: {
    backgroundColor: '#24b4fb',
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
});

export default TabScreen;
