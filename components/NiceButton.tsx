import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { THEME_COLORS } from '@/theme/colors';

interface NiceButtonProps {
  onPress: () => void; // The callback function triggered on button press
}

const NiceButton: React.FC<NiceButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.content}>
        <Svg height={24} width={24} viewBox="0 0 24 24">
          <Path d="M0 0h24v24H0z" fill="none" />
          <Path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" fill="currentColor" />
        </Svg>
        <Text style={styles.text}>Create List</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 30,
    padding: 15,
    zIndex: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default NiceButton;
