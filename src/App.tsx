import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootStackParamList} from './types';
import {HomeScreen} from './screens/HomeScreen';
import {AddExpenseScreen} from './screens/AddExpenseScreen';
import {BalancesScreen} from './screens/BalancesScreen';
import {PremiumScreen} from './screens/PremiumScreen';
import {colors} from './styles/common';

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            headerTintColor: colors.primary,
            headerTitleStyle: {
              fontWeight: 'bold',
              color: colors.text,
            },
            cardStyle: {
              backgroundColor: colors.background,
            },
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AddExpense"
            component={AddExpenseScreen}
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen name="Balances" component={BalancesScreen} />
          <Stack.Screen
            name="Premium"
            component={PremiumScreen}
            options={{
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
