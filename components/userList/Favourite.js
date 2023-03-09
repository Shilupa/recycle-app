import {FlatList} from 'react-native';
import {useFavourite} from '../../hooks/ApiHooks';
import PropTypes from 'prop-types';
import {useContext, useEffect, useState} from 'react';
import {MainContext} from '../../contexts/MainContext';
import {loadMediaById} from '../../hooks/ApiHooks';
import UserList from './UserList';

const Favourite = ({navigation}) => {
  const {getFavouritesByUser} = useFavourite();
  const [favourites, setFavourites] = useState([]);
  const [favouriteList, setFavouriteList] = useState([]);
  const {update, updateFavourite, token} = useContext(MainContext);

  // Fetching user favourite list
  const fetchFavourite = async () => {
    try {
      const response = await getFavouritesByUser(token);
      setFavourites(response);
    } catch (error) {
      console.error('fetchFavourite error', error.message);
    }
  };

  // Mapping favourites
  const setList = async () => {
    try {
      const media = await Promise.all(
        favourites.map(async (favourite) => {
          const response = await loadMediaById(favourite.file_id);
          return response;
        })
      );
      setFavouriteList(media);
    } catch (error) {
      console.error('setList error', error.message);
    }
  };

  useEffect(() => {
    fetchFavourite();
  }, [update, updateFavourite]);

  useEffect(() => {
    setList();
  }, [update, favourites]);

  return (
    <FlatList
      horizontal={false}
      numColumns={3}
      data={favouriteList}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({item}) => (
        <UserList navigation={navigation} singleMedia={item} />
      )}
    />
  );
};

Favourite.propTypes = {
  navigation: PropTypes.object,
};

export default Favourite;
