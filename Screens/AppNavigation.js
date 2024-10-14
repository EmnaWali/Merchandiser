/* eslint-disable prettier/prettier */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Login';
import CalendarComponent from './Calendar';
import MissionDetail from './MissionDetail';
import ArticlePriceReport from './ArticlePriceReport';
import ArticleQteReport from './ArticleQteReport';
import Facing from './Facing';
import RapportQte from './RapportQte';
import RapportPrix from './RapportPrix';

const Stack = createStackNavigator();

function AppNavigation() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ header: () => null }}>
       <Stack.Screen name="Calendar" component={CalendarComponent} options={{ title: 'Calendar' }} />
       <Stack.Screen name="MissionDetail" component={MissionDetail} options={{ title: 'Pointage' }} />
       <Stack.Screen name="ArticleQteReport" component={ArticleQteReport} />
       <Stack.Screen name="ArticlePriceReport" component={ArticlePriceReport} />
       <Stack.Screen name="Facing" component={Facing} />
       <Stack.Screen name="RapportQte" component={RapportQte} />
       <Stack.Screen name="RapportPrix" component={RapportPrix} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}

export default AppNavigation;
