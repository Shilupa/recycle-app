import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainContext = React.createContext({});

const MainProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [update, setUpdate] = useState(true);
  const [toggleForm, setToggleForm] = useState(true);
  const [token, setToken] = useState(null);
  const [updateAvatar, setUpdateAvatar] = useState(0);

  /**
   * Saving user data and token from async storage to global variables
   */
  const saveData = async () => {
    try {
      const asyncToken = await AsyncStorage.getItem('userToken');
      const asyncUser = await AsyncStorage.getItem('user');

      if (asyncToken !== null) {
        setUser(JSON.parse(asyncUser));
        setToken(asyncToken);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('logIn', error);
    }
  };

  useEffect(() => {
    saveData();
  }, [isLoggedIn]);

  return (
    <MainContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        update,
        setUpdate,
        toggleForm,
        setToggleForm,
        token,
        updateAvatar,
        setUpdateAvatar,
      }}
    >
      {props.children}
    </MainContext.Provider>
  );
};

MainProvider.propTypes = {
  children: PropTypes.node,
};

export {MainContext, MainProvider};
