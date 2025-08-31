import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList, AppData, Participant, Expense} from '../types';
import {StorageService} from '../services/storage';
import {ParticipantSelector} from '../components/ParticipantSelector';
import {colors, commonStyles, spacing} from '../styles/common';

type AddExpenseScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddExpense'
>;

export const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<AddExpenseScreenNavigationProp>();
  const [data, setData] = useState<AppData>({expenses: [], participants: []});
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [payer, setPayer] = useState<Participant[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    amount: '',
    description: '',
    payer: '',
    participants: '',
  });

  useEffect(() => {
    loadData();
    
    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      try {
        const numericAmount = parseFloat(amount);
        const newExpense: Omit<Expense, 'id'> = {
          amount: numericAmount,
          description: description.trim(),
          payer: payer[0],
          participants: participants,
          date: new Date().toISOString(),
        };

        await StorageService.addExpense(newExpense, data);
        navigation.goBack();
      } catch (error) {
        console.error('Error adding expense:', error);
        Alert.alert('Error', 'Failed to add expense. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    navigation.setOptions({
      headerTitle: 'Add Expense',
      headerLeft: () => (
        <TouchableOpacity
          style={commonStyles.headerButton}
          onPress={() => navigation.goBack()}>
          <Text style={commonStyles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={commonStyles.headerButton}
          onPress={handleSubmit}
          disabled={loading}>
          <Text
            style={[
              commonStyles.headerButtonText,
              loading && {color: colors.textSecondary},
            ]}>
            Save
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, loading, amount, description, payer, participants, data]);

  const loadData = async () => {
    try {
      const appData = await StorageService.loadData();
      setData(appData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      amount: '',
      description: '',
      payer: '',
      participants: '',
    };

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(numericAmount) || numericAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    // Validate description
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Validate payer
    if (payer.length === 0) {
      newErrors.payer = 'Please select who paid';
    }

    // Validate participants
    if (participants.length === 0) {
      newErrors.participants = 'Please select at least one participant';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  const handleAddParticipant = async (participant: Participant) => {
    try {
      const updatedData = await StorageService.addParticipant(
        participant,
        data,
      );
      setData(updatedData);
    } catch (error) {
      console.error('Error adding participant:', error);
      Alert.alert('Error', 'Failed to add participant');
    }
  };

  const handleAmountChange = (text: string) => {
    // Allow only numbers and decimal point
    const numericText = text.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const decimalCount = (numericText.match(/\./g) || []).length;
    if (decimalCount <= 1) {
      setAmount(numericText);
      if (errors.amount) {
        setErrors((prev) => ({...prev, amount: ''}));
      }
    }
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (errors.description) {
      setErrors((prev) => ({...prev, description: ''}));
    }
  };

  const handlePayerChange = (selectedPayers: Participant[]) => {
    setPayer(selectedPayers);
    if (errors.payer) {
      setErrors((prev) => ({...prev, payer: ''}));
    }
  };

  const handleParticipantsChange = (selectedParticipants: Participant[]) => {
    setParticipants(selectedParticipants);
    if (errors.participants) {
      setErrors((prev) => ({...prev, participants: ''}));
    }
  };

  const calculateSplitAmount = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || participants.length === 0) {
      return null;
    }
    return numericAmount / participants.length;
  };

  const splitAmount = calculateSplitAmount();

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.formSection}>
          <Text style={commonStyles.label}>Amount *</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[commonStyles.input, styles.amountInput]}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              keyboardType="decimal-pad"
              returnKeyType="next"
            />
          </View>
          {errors.amount && (
            <Text style={commonStyles.errorText}>{errors.amount}</Text>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={commonStyles.label}>Description *</Text>
          <TextInput
            style={commonStyles.input}
            value={description}
            onChangeText={handleDescriptionChange}
            placeholder="What was this expense for?"
            returnKeyType="next"
            maxLength={100}
          />
          {errors.description && (
            <Text style={commonStyles.errorText}>{errors.description}</Text>
          )}
        </View>

        <View style={styles.formSection}>
          <ParticipantSelector
            participants={data.participants}
            selectedParticipants={payer}
            onParticipantsChange={handlePayerChange}
            onAddParticipant={handleAddParticipant}
            allowMultiple={false}
            label="Who paid? *"
            placeholder="Select who paid for this expense"
          />
          {errors.payer && (
            <Text style={commonStyles.errorText}>{errors.payer}</Text>
          )}
        </View>

        <View style={styles.formSection}>
          <ParticipantSelector
            participants={data.participants}
            selectedParticipants={participants}
            onParticipantsChange={handleParticipantsChange}
            onAddParticipant={handleAddParticipant}
            allowMultiple={true}
            label="Split between *"
            placeholder="Select participants to split this expense"
          />
          {errors.participants && (
            <Text style={commonStyles.errorText}>{errors.participants}</Text>
          )}
        </View>

        {splitAmount && (
          <View style={[commonStyles.card, styles.splitPreview]}>
            <Text style={styles.splitPreviewTitle}>Split Preview</Text>
            <Text style={styles.splitPreviewText}>
              Each person owes:{' '}
              <Text style={styles.splitAmount}>${splitAmount.toFixed(2)}</Text>
            </Text>
            <Text style={styles.splitParticipants}>
              Split between: {participants.map((p) => p.name).join(', ')}
            </Text>
          </View>
        )}

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>💡 How it works</Text>
          <Text style={styles.helpText}>
            • Select who paid for the expense{'\n'}• Choose who should split the
            cost{'\n'}• The amount will be divided equally{'\n'}• Balances are
            calculated automatically
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingLeft: 12,
  },
  amountInput: {
    flex: 1,
    borderWidth: 0,
    fontSize: 18,
    fontWeight: '600',
  },
  splitPreview: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  splitPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  splitPreviewText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  splitAmount: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  splitParticipants: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  helpCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  helpText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
