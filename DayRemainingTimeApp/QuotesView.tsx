/**
 * Quotes View Component
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';

interface Quote {
  content: string;
  author: string;
}

interface Props {
  textColor: string;
}

const QuotesView: React.FC<Props> = ({ textColor }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    fetch('https://api.quotable.io/quotes?limit=20')
      .then(response => response.json())
      .then(data => {
        setQuotes(data.results);
      })
      .catch(error => console.error(error));
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    header: {
      color: textColor,
      fontSize: 32,
      fontWeight: 'bold',
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
      textAlign: 'center',
      marginVertical: 20,
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 10,
      padding: 20,
      marginVertical: 10,
      marginHorizontal: 20,
    },
    quote: {
      color: textColor,
      fontSize: 20,
      fontStyle: 'italic',
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    author: {
      color: textColor,
      fontSize: 18,
      textAlign: 'right',
      marginTop: 10,
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
  });

  const renderItem = ({ item }: { item: Quote }) => (
    <View style={styles.card}>
      <Text style={styles.quote}>"{item.content}"</Text>
      <Text style={styles.author}>- {item.author}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Motivational Quotes</Text>
      <FlatList
        data={quotes}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default QuotesView;
