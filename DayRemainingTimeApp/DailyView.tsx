/**
 * Daily View Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MotivationalQuote from './MotivationalQuote';

interface Props {
  remainingTime: string;
  textColor: string;
  active: boolean;
}

const DailyView: React.FC<Props> = ({ remainingTime, textColor, active }) => {
  const styles = StyleSheet.create({
    header: {
      color: textColor,
      fontSize: 32,
      fontWeight: 'bold',
      fontFamily: 'Helvetica Neue',
    },
    time: {
      color: textColor,
      fontSize: 64,
      fontWeight: 'bold',
      marginVertical: 20,
      fontFamily: 'Helvetica Neue',
    },
  });

  return (
    <>
      <Text style={styles.header}>Time Left Today</Text>
      <Text style={styles.time}>{remainingTime}</Text>
      <MotivationalQuote textColor={textColor} active={active} />
    </>
  );
};

export default DailyView;
