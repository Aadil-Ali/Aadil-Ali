/**
 * Add Event Modal Component
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  handleAddEvent: (title: string, date: Date) => void;
}

const AddEventModal: React.FC<Props> = ({
  modalVisible,
  setModalVisible,
  handleAddEvent,
}) => {
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || newEventDate;
    setShowDatePicker(Platform.OS === 'ios');
    setNewEventDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.header}>Add New Event</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Event Title"
            value={newEventTitle}
            onChangeText={setNewEventTitle}
          />
          <TouchableOpacity onPress={showDatepicker}>
            <Text style={styles.dateText}>{newEventDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={newEventDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}
          <Button
            title="Add Event"
            onPress={() => handleAddEvent(newEventTitle, newEventDate)}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  dateText: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    marginBottom: 20,
  },
});

export default AddEventModal;
