/**
 * Monthly View Component
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native';
import EventCountdown from './EventCountdown';

interface Event {
  title: string;
  date: string;
}

interface Props {
  remainingMonth: string;
  events: Event[];
  textColor: string;
}

const MonthlyView: React.FC<Props> = ({ remainingMonth, events, textColor }) => {
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
      <Text style={styles.header}>Days Left This Month</Text>
      <Text style={styles.time}>{remainingMonth}</Text>
      <EventCountdown events={events} textColor={textColor} />
    </>
  );
};

export default MonthlyView;
