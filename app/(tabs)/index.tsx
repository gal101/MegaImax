import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Button, Text, Modal, TextInput, TouchableOpacity } from 'react-native';
import NiceButton from '@/components/NiceButton';
import CheckboxList from '@/components/CheckBoxList';
import listsData from '@/lists.json';
import * as FileSystem from 'expo-file-system';

<<<<<<< Updated upstream
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12'
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
=======
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
      setNewItemLabel('');
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
>>>>>>> Stashed changes
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
