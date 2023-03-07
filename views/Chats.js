import {Platform, StyleSheet, SafeAreaView, View} from 'react-native';
import PropTypes from 'prop-types';
import ChatList from '../components/ChatList';
import {Divider, Text} from '@rneui/themed';
import {StatusBar} from 'react-native';
import {messageId, primaryColour} from '../utils/variables';
import {useContext, useEffect, useState} from 'react';
import {MainContext} from '../contexts/MainContext';
import {useComments, useMedia, useUser} from '../hooks/ApiHooks';

const Chats = ({navigation}) => {
  const {user, token, updateMessage} = useContext(MainContext);
  const {searchMedia} = useMedia();
  const [chatGroupList, setChatGroupList] = useState();
  const {getMediaByFileId} = useMedia();
  const {getCommentsByFileId} = useComments();
  const {getUserById} = useUser();

  /*   const id1 = 111;
  const id2 = 222;

  const description = {};
  description[id1] = false;

  description[id2]= false;

  console.log('Description Test: ', JSON.stringify(description));
 */
  const loadChatGroups = async () => {
    // console.log('load message function called');
    const title = user.user_id + messageId;
    console.log('Title : ', title);

    try {
      const chatGroups = await searchMedia(title, token);

      // console.log('all Chat Groups: ', chatGroups);
      const chatGroupWithComment = await Promise.all(
        chatGroups.map(async (group) => {
          /*           const fileId = group.title.split('_').pop();
          const id1 = group.title.split('_')[0].replace(messageId, '');
          const id2 = group.title.split('_')[1].replace(messageId, ''); */

          // console.log('group.file_id: ', group.file_id);

          const commentResponse = await getCommentsByFileId(group.file_id);
          group.allComments = await commentResponse;
          // console.log('COmment Response', commentResponse);

          /*
          const fileResponse = await getMediaByFileId(fileId);
          group.file = await fileResponse;

          //console.log('Group file Id: ', group.file_id);

          if (id1 == user.user_id) {
            const ownerResponse = await getUserById(id2, token);
            group.owner = await ownerResponse;
          } else {
            const ownerResponse = await getUserById(id1, token);
            group.owner = await ownerResponse;
          } */
          return await group;
        })
      );

      console.log('chatGroupWithComment', chatGroupWithComment);

      const filteredChatGroupWithComment = chatGroupWithComment.filter(
        (obj) => obj.allComments.length != 0
      );

      console.log('filteredChatGroupWithComment', filteredChatGroupWithComment);

      const chatGroupWithFile = await Promise.all(
        filteredChatGroupWithComment.map(async (group) => {
          const fileId = group.title.split('_').pop();
          const fileResponse = await getMediaByFileId(fileId);
          group.file = await fileResponse;
          return await group;
        })
      );

      const chatGroupWithOwner = await Promise.all(
        chatGroupWithFile.map(async (group) => {
          const id1 = group.title.split('_')[0].replace(messageId, '');
          const id2 = group.title.split('_')[1].replace(messageId, '');

          if (id1 == user.user_id) {
            const ownerResponse = await getUserById(id2, token);
            group.owner = await ownerResponse;
          } else {
            const ownerResponse = await getUserById(id1, token);
            group.owner = await ownerResponse;
          }
          return await group;
        })
      );

      chatGroupWithOwner.sort((a, b) => {
        return (
          b.allComments[b.allComments.length - 1].comment_id -
          a.allComments[a.allComments.length - 1].comment_id
        );
      });

      setChatGroupList(chatGroupWithOwner);

      console.log('All file with comment: ', chatGroupWithOwner);
    } catch (error) {
      throw new Error('loadChatGroups error: ' + error.message);
    }
  };

  /*   useEffect(() => {
    const interval = setInterval(() => {
      getAllComment();
    }, 10000);
    return () => clearInterval(interval);
  }, []); */

  useEffect(() => {
    loadChatGroups();
  }, [updateMessage]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>Chats</Text>
      </View>
      <Divider />
      <ChatList navigation={navigation} chatGroupList={chatGroupList} />
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
});

Chats.propTypes = {
  navigation: PropTypes.object,
};

export default Chats;
