/**
 * Weekly View Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EventCountdown from './EventCountdown';

interface Event {
  title: string;
  date: string;
}

interface Props {
  remainingWeek: string;
  events: Event[];
  textColor: string;
}

const WeeklyView: React.FC<Props> = ({ remainingWeek, events, textColor }) => {
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
      <Text style={styles.header}>Days Left This Week</Text>
      <Text style={styles.time}>{remainingWeek}</Text>
      <EventCountdown events={events} textColor={textColor} />
    </>
  );
};

export default WeeklyView;
