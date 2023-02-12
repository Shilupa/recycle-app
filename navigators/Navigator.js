const {createBottomTabNavigator} = require('@react-navigation/bottom-tabs');
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Icon} from '@rneui/themed';
import Chats from '../views/Chats';
import Home from '../views/Home';
import Login from '../views/Login';
import Profile from '../views/Profile';
import Search from '../views/Search';
import Single from '../views/Single';
import Upload from '../views/Upload';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#19a119',
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{tabBarIcon: ({color}) => <Icon name="home" color={color} />}}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({color}) => <Icon name="search" color={color} />,
        }}
      />
      <Tab.Screen
        name="Upload"
        component={Upload}
        options={{
          tabBarIcon: ({color}) => <Icon name="cloud-upload" color={color} />,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={Chats}
        options={{
          tabBarIcon: ({color}) => <Icon name="chat" color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({color}) => <Icon name="person" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const StackScreen = () => {
  const isLoggedIn = true;
  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <>
          <Stack.Screen
            name="Tabs"
            component={TabScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen name="Single" component={Single} />
          {/* <Stack.Screen name="MyFiles" component={MyFiles} />
          <Stack.Screen name="Modify" component={Modify} /> */}
        </>
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
};

const Navigator = () => {
  return (
    <NavigationContainer>
      <StackScreen />
    </NavigationContainer>
  );
};

export default Navigator;
