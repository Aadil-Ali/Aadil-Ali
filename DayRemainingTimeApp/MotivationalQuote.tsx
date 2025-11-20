/**
 * Motivational Quote Component
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface Props {
  textColor: string;
  active: boolean;
}

const MotivationalQuote: React.FC<Props> = ({ textColor, active }) => {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    if (active) {
      fetch('https://api.quotable.io/random')
        .then(response => response.json())
        .then(data => {
          setQuote(data.content);
          setAuthor(data.author);
        })
        .catch(error => console.error(error));
    }
  }, [active]);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 20,
      marginTop: 20,
    },
    quote: {
      color: textColor,
      fontSize: 20,
      fontStyle: 'italic',
      textAlign: 'center',
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

  return (
    <View style={styles.container}>
      <Text style={styles.quote}>"{quote}"</Text>
      <Text style={styles.author}>- {author}</Text>
    </View>
  );
};

export default MotivationalQuote;
