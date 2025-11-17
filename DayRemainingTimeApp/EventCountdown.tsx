/**
 * Event Countdown Component
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Event {
  title: string;
  date: string;
}

interface Props {
  events: Event[];
  textColor: string;
}

const EventCountdown: React.FC<Props> = ({ events, textColor }) => {
  const [remainingTimes, setRemainingTimes] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newRemainingTimes = events.map(event => {
        const eventDate = new Date(event.date);
        const diff = eventDate.getTime() - now.getTime();

        if (diff <= 0) {
          return 'Event has passed';
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      });
      setRemainingTimes(newRemainingTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [events]);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 20,
    },
    header: {
      color: textColor,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      fontFamily: 'Helvetica Neue',
    },
    eventContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
    },
    eventTitle: {
      color: textColor,
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'Helvetica Neue',
    },
    eventDate: {
      color: textColor,
      fontSize: 16,
      fontFamily: 'Helvetica Neue',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Events</Text>
      {events.map((event, index) => (
        <View key={index} style={styles.eventContainer}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>{remainingTimes[index]}</Text>
        </View>
      ))}
    </View>
  );
};

export default EventCountdown;
