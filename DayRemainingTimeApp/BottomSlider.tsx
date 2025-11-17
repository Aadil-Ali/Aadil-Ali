/**
 * Bottom Slider Component
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  activeView: string;
  handleViewChange: (view: string) => void;
  textColor: string;
}

const BottomSlider: React.FC<Props> = ({
  activeView,
  handleViewChange,
  textColor,
}) => {
  const styles = StyleSheet.create({
    sliderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingVertical: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)', // Glass effect
    },
    sliderOption: {
      color: textColor,
      fontSize: 18,
      fontFamily: 'Helvetica Neue',
    },
    activeSliderOption: {
      color: '#007aff', // Blue accent
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'Helvetica Neue',
    },
  });

  return (
    <View style={styles.sliderContainer}>
      <TouchableOpacity onPress={() => handleViewChange('Daily')}>
        <Text
          style={
            activeView === 'Daily'
              ? styles.activeSliderOption
              : styles.sliderOption
          }>
          Daily
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleViewChange('Weekly')}>
        <Text
          style={
            activeView === 'Weekly'
              ? styles.activeSliderOption
              : styles.sliderOption
          }>
          Weekly
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleViewChange('Monthly')}>
        <Text
          style={
            activeView === 'Monthly'
              ? styles.activeSliderOption
              : styles.sliderOption
          }>
          Monthly
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomSlider;
