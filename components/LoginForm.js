import {StyleSheet, View} from 'react-native';
import React, {useContext} from 'react';
import {primaryColour} from '../utils/variables';
import LeafSvg from './LeafSvg';
import {Card} from '@rneui/themed';
import PropTypes from 'prop-types';
import {Controller, useForm} from 'react-hook-form';
import FormInput from './formComponent/FormInput';
import {MainContext} from '../contexts/MainContext';
import {useAuthentication} from '../hooks/ApiHooks';
import FormButton from './formComponent/FormButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Main LoinForm function
const LoginForm = ({navigation}) => {
  const {setIsLoggedIn, setUser} = useContext(MainContext);
  const {postLogin} = useAuthentication();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      username: 'bibekShrestha',
      password: 'examplepass',
    },
    mode: 'onBlur',
  });

  const logIn = async (loginData) => {
    console.log('Login button pressed', loginData);

    try {
      const loginResult = await postLogin(loginData);
      console.log('logIn', loginResult);
      await AsyncStorage.setItem('userToken', loginResult.token);
      setUser(loginResult.user);
      setIsLoggedIn(true);
      navigation.navigate('Home');
    } catch (error) {
      console.error('logIn', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <LeafSvg />
        <Card.Title style={styles.welcomeText}>Welcome Back</Card.Title>
      </View>
      <View style={styles.inputView}>
        <Controller
          control={control}
          rules={{
            required: {value: true, message: 'username is required.'},
            minLength: {
              value: 3,
              message: 'min length is 3 char.',
            },
            // validate: checkUser,
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <FormInput
              onBlur={onBlur}
              onChange={onChange}
              label={'Username'}
              value={value}
              autoCapitalize="none"
              error={errors.username && errors.username.message}
            />
          )}
          name="username"
        />
        <Controller
          control={control}
          rules={{
            required: {
              value: true,
              message: 'password is required.',
            },
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <FormInput
              label={'Password'}
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              secureTextEntry={true}
              error={errors.password && errors.password.message}
            />
          )}
          name="password"
        />
      </View>
      <View style={styles.buttonView}>
        <FormButton
          text="Sign In"
          submit={logIn}
          handleSubmit={handleSubmit}
        ></FormButton>
      </View>
    </View>
  );
};

LoginForm.propTypes = {
  navigation: PropTypes.object,
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },

  logoContainer: {
    marginTop: '20%',
    alignItems: 'center',
  },

  // Welcome Back text
  welcomeText: {
    color: primaryColour,
    fontSize: 28,
    fontWeight: 'bold',
  },

  // view for input box area
  inputView: {
    marginTop: '10%',
    width: '85%',
  },

  // View for Sign in button
  buttonView: {
    marginTop: '10%',
    width: '100%',
  },
});

export default LoginForm;
