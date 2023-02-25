import {FlatList} from 'react-native';
import {useMedia} from '../hooks/ApiHooks';
import SecondaryListItem from './SecondaryListItem';
import PropTypes from 'prop-types';

const SecondaryList = ({navigation}) => {
  const {filteredMedia} = useMedia(true);
  return (
    <FlatList
      horizontal={false}
      numColumns={3}
      data={filteredMedia}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({item}) => (
        <SecondaryListItem navigation={navigation} singleMedia={item} />
      )}
    />
  );
};

SecondaryList.propTypes = {
  navigation: PropTypes.object,
};

export default SecondaryList;
