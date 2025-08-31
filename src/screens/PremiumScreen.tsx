import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import {PurchaseService} from '../services/purchases';
import {colors, commonStyles, spacing} from '../styles/common';

type PremiumScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Premium'
>;

export const PremiumScreen: React.FC = () => {
  const navigation = useNavigation<PremiumScreenNavigationProp>();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
    navigation.setOptions({
      headerTitle: 'Premium',
    });
  }, [navigation]);

  const checkPremiumStatus = async () => {
    try {
      const premiumStatus = await PurchaseService.isPremium();
      setIsPremium(premiumStatus);
    } catch (error) {
      console.error('Error checking premium status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const purchaseResult = await PurchaseService.makePurchase(
        'premium_unlock',
      );
      if (purchaseResult) {
        setIsPremium(true);
        Alert.alert(
          'Purchase Successful! 🎉',
          'You now have access to all premium features!',
          [{text: 'Great!', onPress: () => navigation.goBack()}],
        );
      } else {
        Alert.alert('Purchase Failed', 'Please try again or contact support.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Purchase Error', 'Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    try {
      const restored = await PurchaseService.restorePurchases();
      if (restored) {
        setIsPremium(true);
        Alert.alert(
          'Purchases Restored',
          'Your premium access has been restored!',
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found to restore.',
        );
      }
    } catch (error) {
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const renderFeatureItem = (
    icon: string,
    title: string,
    description: string,
    isPremiumFeature = false,
  ) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>{icon}</Text>
      </View>
      <View style={styles.featureContent}>
        <View style={styles.featureHeader}>
          <Text style={styles.featureTitle}>{title}</Text>
          {isPremiumFeature && !isPremium && (
            <View style={commonStyles.premiumBadge}>
              <Text style={commonStyles.premiumBadgeText}>PREMIUM</Text>
            </View>
          )}
        </View>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  const renderPremiumFeatures = () => (
    <View style={styles.featuresSection}>
      <Text style={styles.sectionTitle}>Premium Features</Text>

      {renderFeatureItem(
        '∞',
        'Unlimited Expenses',
        'Add as many expenses as you need without limits',
        true,
      )}

      {renderFeatureItem(
        '📄',
        'PDF Export',
        'Generate professional PDF reports of your expenses',
        true,
      )}

      {renderFeatureItem(
        '📊',
        'Advanced Analytics',
        'Get detailed insights into your spending patterns',
        true,
      )}

      {renderFeatureItem(
        '☁️',
        'Cloud Backup',
        'Automatic backup of your data to the cloud',
        true,
      )}

      {renderFeatureItem(
        '🔄',
        'Multi-Device Sync',
        'Access your expenses across all your devices',
        true,
      )}
    </View>
  );

  const renderFreeFeatures = () => (
    <View style={styles.featuresSection}>
      <Text style={styles.sectionTitle}>Free Features</Text>

      {renderFeatureItem(
        '✅',
        'Basic Expense Tracking',
        `Track up to ${PurchaseService.getFreeExpenseLimit()} expenses`,
      )}

      {renderFeatureItem(
        '👥',
        'Expense Splitting',
        'Split expenses between multiple participants',
      )}

      {renderFeatureItem(
        '⚡',
        'Smart Balance Calculations',
        'Automatic balance calculations and debt optimization',
      )}

      {renderFeatureItem(
        '📱',
        'Basic Sharing',
        'Share balances via text, WhatsApp, and email',
      )}
    </View>
  );

  const renderPremiumStatus = () => {
    if (isPremium) {
      return (
        <View
          style={[
            commonStyles.card,
            styles.statusCard,
            styles.premiumStatusCard,
          ]}>
          <Text style={styles.statusIcon}>👑</Text>
          <Text style={styles.statusTitle}>Premium Active</Text>
          <Text style={styles.statusDescription}>
            You have access to all premium features!
          </Text>
          <TouchableOpacity
            style={[commonStyles.button, styles.statusButton]}
            onPress={() => navigation.goBack()}>
            <Text style={commonStyles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[commonStyles.card, styles.statusCard]}>
        <Text style={styles.statusIcon}>🚀</Text>
        <Text style={styles.statusTitle}>Upgrade to Premium</Text>
        <Text style={styles.statusDescription}>
          Unlock unlimited expenses and advanced features
        </Text>
        <Text style={styles.priceText}>
          {PurchaseService.getPremiumPrice()}
        </Text>
        <Text style={styles.priceSubtext}>
          One-time purchase • No subscription
        </Text>

        <TouchableOpacity
          style={[commonStyles.button, styles.purchaseButton]}
          onPress={handlePurchase}
          disabled={purchasing}>
          {purchasing ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={commonStyles.buttonText}>
              Upgrade Now - {PurchaseService.getPremiumPrice()}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}>
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {renderPremiumStatus()}
        {renderPremiumFeatures()}
        {renderFreeFeatures()}

        <View style={styles.bottomSection}>
          <Text style={styles.bottomTitle}>Why Upgrade?</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>
              ✨ Support continued development
            </Text>
            <Text style={styles.benefitItem}>
              🔓 Unlock all premium features
            </Text>
            <Text style={styles.benefitItem}>📈 No usage limits</Text>
            <Text style={styles.benefitItem}>
              💎 One-time purchase, lifetime access
            </Text>
          </View>

          <Text style={styles.disclaimer}>
            * Features may vary based on device capabilities. Premium purchase
            is a one-time payment with no recurring charges.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  premiumStatusCard: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success,
    borderWidth: 1,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  priceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  priceSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  purchaseButton: {
    minWidth: 250,
    marginBottom: spacing.md,
  },
  restoreButton: {
    paddingVertical: spacing.sm,
  },
  restoreButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
  statusButton: {
    minWidth: 150,
  },
  featuresSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureIconText: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
    flex: 1,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomSection: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  bottomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  benefitsList: {
    marginBottom: spacing.lg,
  },
  benefitItem: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
