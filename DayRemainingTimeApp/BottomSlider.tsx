/**
 * Bottom Slider Component
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
      alignItems: 'center',
    },
    sliderIcon: {
      color: textColor,
    },
    activeSliderIcon: {
      color: '#007aff', // Blue accent
    },
    sliderText: {
      color: textColor,
      fontSize: 12,
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    activeSliderText: {
      color: '#007aff', // Blue accent
      fontSize: 12,
      fontWeight: 'bold',
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
  });

  return (
    <View style={styles.sliderContainer}>
      <TouchableOpacity
        style={styles.sliderOption}
        onPress={() => handleViewChange('Daily')}>
        <Icon
          name="calendar-outline"
          size={30}
          style={
            activeView === 'Daily'
              ? styles.activeSliderIcon
              : styles.sliderIcon
          }
        />
        <Text
          style={
            activeView === 'Daily'
              ? styles.activeSliderText
              : styles.sliderText
          }>
          Daily
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.sliderOption}
        onPress={() => handleViewChange('Weekly')}>
        <Icon
          name="calendar"
          size={30}
          style={
            activeView === 'Weekly'
              ? styles.activeSliderIcon
              : styles.sliderIcon
          }
        />
        <Text
          style={
            activeView === 'Weekly'
              ? styles.activeSliderText
              : styles.sliderText
          }>
          Weekly
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.sliderOption}
        onPress={() => handleViewChange('Monthly')}>
        <Icon
          name="grid-outline"
          size={30}
          style={
            activeView === 'Monthly'
              ? styles.activeSliderIcon
              : styles.sliderIcon
          }
        />
        <Text
          style={
            activeView === 'Monthly'
              ? styles.activeSliderText
              : styles.sliderText
          }>
          Monthly
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.sliderOption}
        onPress={() => handleViewChange('Quotes')}>
        <Icon
          name="chatbubble-ellipses-outline"
          size={30}
          style={
            activeView === 'Quotes'
              ? styles.activeSliderIcon
              : styles.sliderIcon
          }
        />
        <Text
          style={
            activeView === 'Quotes'
              ? styles.activeSliderText
              : styles.sliderText
          }>
          Quotes
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomSlider;
