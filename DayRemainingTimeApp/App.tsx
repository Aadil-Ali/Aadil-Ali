/**
 * Day Remaining Time App
 */

import React from 'react';
import {
  StatusBar,
  useColorScheme,
  View,
  TouchableOpacity,
  Text,
  Platform,
  StyleSheet,
  Animated,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import DailyView from './DailyView';
import WeeklyView from './WeeklyView';
import MonthlyView from './MonthlyView';
import AddEventModal from './AddEventModal';
import BottomSlider from './BottomSlider';
import QuotesView from './QuotesView';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface Event {
  title: string;
  date: string;
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeView, setActiveView] = React.useState('Daily');
  const [remainingTime, setRemainingTime] = React.useState('');
  const [remainingWeek, setRemainingWeek] = React.useState('');
  const [remainingMonth, setRemainingMonth] = React.useState('');
  const [events, setEvents] = React.useState<Event[]>([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const textColor = isDarkMode ? '#fff' : '#000';

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [activeView]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Daily
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);

      // Weekly
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
      const weekDiff = endOfWeek.getTime() - now.getTime();
      const daysLeftInWeek = Math.floor(weekDiff / (1000 * 60 * 60 * 24));
      setRemainingWeek(`${daysLeftInWeek} days`);

      // Monthly
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const monthDiff = endOfMonth.getTime() - now.getTime();
      const daysLeftInMonth = Math.floor(monthDiff / (1000 * 60 * 60 * 24));
      setRemainingMonth(`${daysLeftInMonth} days`);

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAddEvent = (title: string, date: Date) => {
    if (title) {
      setEvents([...events, { title, date: date.toISOString().split('T')[0] }]);
      setModalVisible(false);
    }
  };

  const handleViewChange = (view: string) => {
    fadeAnim.setValue(0);
    setActiveView(view);
  };

  const getWeeklyEvents = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  };

  const getMonthlyEvents = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addEventButton: {
      position: 'absolute',
      bottom: 100,
      right: 20,
      backgroundColor: '#007aff',
      borderRadius: 50,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addEventButtonText: {
      color: '#fff',
      fontSize: 30,
    },
  });

  return (
    <LinearGradient
      colors={['#0a192f', '#1c3a63', '#3a66a7']}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent={true}
        />
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          {activeView === 'Daily' && <DailyView remainingTime={remainingTime} textColor={textColor} active={activeView === 'Daily'} />}
          {activeView === 'Weekly' && <WeeklyView remainingWeek={remainingWeek} events={getWeeklyEvents()} textColor={textColor} />}
          {activeView === 'Monthly' && <MonthlyView remainingMonth={remainingMonth} events={getMonthlyEvents()} textColor={textColor} />}
          {activeView === 'Quotes' && <QuotesView textColor={textColor} />}
        </Animated.View>
        <TouchableOpacity style={styles.addEventButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addEventButtonText}>+</Text>
        </TouchableOpacity>
        <AddEventModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          handleAddEvent={handleAddEvent}
        />
        <BottomSlider activeView={activeView} handleViewChange={handleViewChange} textColor={textColor} />
      </SafeAreaView>
    </LinearGradient>
  );
}

export default App;
