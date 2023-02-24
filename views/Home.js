import {
  Platform,
  StyleSheet,
  SafeAreaView,
  View,
  StatusBar,
} from 'react-native';
import List from '../components/List';
import PropTypes from 'prop-types';
import {Tab, TabView, Text, Card} from '@rneui/themed';
import {useContext, useEffect, useState} from 'react';
import {appId, primaryColour} from '../utils/variables';
import {MainContext} from '../contexts/MainContext';
import {useTag} from '../hooks/ApiHooks';

const Home = ({navigation}) => {
  const [index, setIndex] = useState();
  const {isLoggedIn, user, update} = useContext(MainContext);
  const clothing = `${appId}_Clothing`;
  const furniture = `${appId}_Furniture`;
  const {getFilesByTag} = useTag();
  const [category, setCategory] = useState([]);

  const getFilesWithTag = async () => {
    const tagResponse = await getFilesByTag(clothing);
    const furResponse = await getFilesByTag(furniture);
    setCategory([...category, ...furResponse, ...tagResponse]);
  };

  // Removing duplicates from list
  const filteredMedia = category.reduce((acc, current) => {
    const media = acc.find((item) => item.file_id === current.file_id);
    if (!media) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  // Hello there
  console.log('====================================');
  console.log(filteredMedia);
  console.log('====================================');
  console.log(filteredMedia.length);

  useEffect(() => {
    getFilesWithTag();
  }, [update]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>Home</Text>
        {!isLoggedIn ? (
          <Text
            style={styles.logIn}
            onPress={() => navigation.navigate('Login')}
          >
            Sign In
          </Text>
        ) : (
          <Text style={styles.logIn}>
            Hi {user !== null ? user.username : 'User'}!{' '}
          </Text>
        )}
      </View>

      <Tab
        value={index}
        scrollable={true}
        onChange={(e) => {
          setIndex(e);
        }}
        indicatorStyle={{
          backgroundColor: 'black',
          height: 3,
        }}
      >
        <Tab.Item
          title="All"
          titleStyle={{fontSize: 12, color: 'black'}}
          icon={{name: 'infinite', type: 'ionicon', color: 'black'}}
        />
        <Tab.Item
          title="Furniture"
          titleStyle={{fontSize: 12, color: 'black'}}
          icon={{name: 'bed', type: 'ionicon', color: 'black'}}
        />
        <Tab.Item
          title="Clothing"
          titleStyle={{fontSize: 12, color: 'black'}}
          icon={{name: 'shirt', type: 'ionicon', color: 'black'}}
        />
        <Tab.Item
          title="Electronic Device"
          titleStyle={{fontSize: 12, color: 'black'}}
          icon={{name: 'tv', type: 'ionicon', color: 'black'}}
        />
      </Tab>
      <Card.Divider />
      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item style={{width: '100%'}}>
          <List navigation={navigation} />
        </TabView.Item>
        <TabView.Item style={{backgroundColor: 'blue', width: '100%'}}>
          <Text h1>Furniture</Text>
        </TabView.Item>
        <TabView.Item style={{backgroundColor: 'green', width: '100%'}}>
          <Text h1>Clothing</Text>
        </TabView.Item>
        <TabView.Item style={{backgroundColor: 'red', width: '100%'}}>
          <Text h1>Electronic Device</Text>
        </TabView.Item>
      </TabView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  titleBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },

  title: {
    marginVertical: 25,
    marginHorizontal: 25,
    fontSize: 25,
    fontWeight: 'bold',
    color: primaryColour,
  },

  logIn: {
    marginVertical: 25,
    marginHorizontal: 25,
    color: primaryColour,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

Home.propTypes = {
  navigation: PropTypes.object,
};

export default Home;
