import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import {Participant} from '../types';
import {colors, commonStyles} from '../styles/common';
import {generateUniqueId} from '../utils/calculations';

interface ParticipantSelectorProps {
  participants: Participant[];
  selectedParticipants: Participant[];
  onParticipantsChange: (participants: Participant[]) => void;
  onAddParticipant: (participant: Participant) => void;
  allowMultiple?: boolean;
  label: string;
  placeholder?: string;
}

export const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  participants,
  selectedParticipants,
  onParticipantsChange,
  onAddParticipant,
  allowMultiple = true,
  label,
  placeholder,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');

  const handleParticipantSelect = (participant: Participant) => {
    if (allowMultiple) {
      const isSelected = selectedParticipants.some(
        (p) => p.id === participant.id,
      );
      if (isSelected) {
        onParticipantsChange(
          selectedParticipants.filter((p) => p.id !== participant.id),
        );
      } else {
        onParticipantsChange([...selectedParticipants, participant]);
      }
    } else {
      onParticipantsChange([participant]);
      setModalVisible(false);
    }
  };

  const handleAddNewParticipant = () => {
    if (newParticipantName.trim()) {
      const newParticipant: Participant = {
        id: generateUniqueId(),
        name: newParticipantName.trim(),
      };
      onAddParticipant(newParticipant);
      setNewParticipantName('');
      if (!allowMultiple) {
        onParticipantsChange([newParticipant]);
        setModalVisible(false);
      }
    }
  };

  const displayText =
    selectedParticipants.length > 0
      ? allowMultiple
        ? selectedParticipants.map((p) => p.name).join(', ')
        : selectedParticipants[0].name
      : placeholder || 'Select participants';

  const renderParticipantItem = ({item}: {item: Participant}) => {
    const isSelected = selectedParticipants.some((p) => p.id === item.id);

    return (
      <TouchableOpacity
        style={[
          styles.participantItem,
          isSelected && styles.participantItemSelected,
        ]}
        onPress={() => handleParticipantSelect(item)}>
        <Text
          style={[
            styles.participantItemText,
            isSelected && styles.participantItemTextSelected,
          ]}>
          {item.name}
        </Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={commonStyles.label}>{label}</Text>
      <TouchableOpacity
        style={[commonStyles.input, styles.selector]}
        onPress={() => setModalVisible(true)}>
        <Text
          style={[
            styles.selectorText,
            selectedParticipants.length === 0 && styles.placeholderText,
          ]}>
          {displayText}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {allowMultiple ? 'Select Participants' : 'Select Participant'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addParticipantSection}>
              <TextInput
                style={commonStyles.input}
                placeholder="Add new participant"
                value={newParticipantName}
                onChangeText={setNewParticipantName}
                onSubmitEditing={handleAddNewParticipant}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={commonStyles.button}
                onPress={handleAddNewParticipant}>
                <Text style={commonStyles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={participants}
              keyExtractor={(item) => item.id}
              renderItem={renderParticipantItem}
              style={styles.participantList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  arrow: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  addParticipantSection: {
    marginBottom: 20,
  },
  participantList: {
    maxHeight: 300,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: colors.background,
  },
  participantItemSelected: {
    backgroundColor: colors.primary,
  },
  participantItemText: {
    fontSize: 16,
    color: colors.text,
  },
  participantItemTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  checkmark: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
