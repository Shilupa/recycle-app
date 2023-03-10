import {
  Platform,
  StyleSheet,
  SafeAreaView,
  View,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import PropTypes from 'prop-types';
import {Button, Divider, Icon, Image, Input, Text} from '@rneui/themed';
import {StatusBar} from 'react-native';
import {
  inputBackground,
  primaryColour,
  uploadsUrl,
  appId,
  messageId,
  avatarUrl,
  primaryColourDark,
} from '../utils/variables';
import MessageList from '../components/MessageList';
import {Controller, useForm} from 'react-hook-form';
import {useContext, useEffect, useState} from 'react';
import {useComments, useMedia, useRating, useTag} from '../hooks/ApiHooks';
import {MainContext} from '../contexts/MainContext';

const Message = ({navigation, route}) => {
  const {file, owner} = route.params;
  const {user} = useContext(MainContext);

  const senderId = user.user_id === file.user_id ? owner.user_id : file.user_id;
  const userId = user.user_id;
  const fileId = file.file_id;

  const {title} = JSON.parse(file.description);
  const {postComment, getCommentsByFileId} = useComments();
  const {token, updateMessage, setUpdateMessage} = useContext(MainContext);
  const assetImage = avatarUrl;
  const commentImage = 'http://placekitten.com/g/200/300';
  const {getFilesByTag} = useTag();
  const [senderAvatar, setSenderAvatar] = useState(assetImage);
  const [receiverAvatar, setReceiverAvatar] = useState(assetImage);
  const {postMedia, searchMedia} = useMedia();
  const {postRating, getRatingsByFileId, deleteRating} = useRating();
  const {postTag} = useTag();
  // const [chatGroupList, setChatGroupList] = useState();
  const [groupName, setGroupName] = useState();
  const [allMessage, setAllMessage] = useState();
  const [existChatGroup, setExistChatGroup] = useState(false);

  const {control, handleSubmit, reset} = useForm({
    defaultValues: {message: ''},
    mode: 'onBlur',
  });

  const sendAvatar = async () => {
    try {
      const avatarArray = await getFilesByTag('avatar_' + senderId);
      if (avatarArray.length > 0) {
        setSenderAvatar(uploadsUrl + avatarArray.pop().filename);
      }
    } catch (error) {
      console.error('sender Avatar fetch failed', error.message);
    }
  };

  // getting user avatar
  const receiveAvatar = async () => {
    try {
      const avatarArray = await getFilesByTag('avatar_' + userId);
      if (avatarArray.length > 0) {
        setReceiverAvatar(uploadsUrl + avatarArray.pop().filename);
      }
    } catch (error) {
      console.error('sender Avatar fetch failed', error.message);
    }
  };

  const loadAllMessage = async () => {
    try {
      if (groupName != undefined) {
        const searchResponse = await searchMedia(groupName, token);

        if (searchResponse.length > 0) {
          const chatFileId = searchResponse[0].file_id;
          const commentResponse = await getCommentsByFileId(chatFileId);
          const reverseMessage = commentResponse.reverse();
          setAllMessage(reverseMessage);

          const ratingResponse = await getRatingsByFileId(chatFileId);

          const id1 = groupName.split('_')[0].replace(messageId, '');
          const id2 = groupName.split('_')[1].replace(messageId, '');
          const otherId = id1 == userId ? id2 : id1;

          const userRating = ratingResponse.find(
            (singleRating) => singleRating.user_id == userId
          );

          const otherRating = ratingResponse.find(
            (singleRating) => singleRating.user_id == otherId
          );

          if (otherRating === undefined) {
            // do nothing
          } else if (otherRating != undefined && userRating === undefined) {
            // Post rating same as other
            await postRating(chatFileId, otherRating.rating);
            // update message
            setUpdateMessage(updateMessage + 1);
          } else if (userRating.rating === 3 && otherRating.rating === 4) {
            // delete previous rating
            await deleteRating(chatFileId);
            // post same rating as other
            await postRating(chatFileId, otherRating.rating);
            // update the message
            setUpdateMessage(updateMessage + 1);
          } else if (userRating.rating === 4 && otherRating.rating === 5) {
            // delete previous rating
            await deleteRating(chatFileId);
            // post same rating as other
            await postRating(chatFileId, otherRating.rating);
            // update the message
            setUpdateMessage(updateMessage + 1);
          } else if (userRating.rating === 5 && otherRating.rating === 3) {
            // delete previous rating
            await deleteRating(chatFileId);
            // post same rating as other
            await postRating(chatFileId, otherRating.rating);
            // update the message
            setUpdateMessage(updateMessage + 1);
          }
        }
      }
    } catch (error) {
      console.error('loadAllMessage error: ' + error.message);
    }
  };

  const searchSetGroupName = async () => {
    const name1 =
      senderId + messageId + '_' + userId + messageId + '_' + fileId;
    const name2 =
      userId + messageId + '_' + senderId + messageId + '_' + fileId;
    try {
      const response = await getFilesByTag(appId + messageId);

      if (response.filter((obj) => obj.title === name1).length > 0) {
        setGroupName(name1);
        setExistChatGroup(true);
      } else if (response.filter((obj) => obj.title === name2).length > 0) {
        setExistChatGroup(true);
        setGroupName(name2);
      } else {
        setGroupName(name2);
      }
    } catch (error) {
      console.error('searchSetGroupName error: ' + error.message);
    }
  };

  const sendMessage = async (data) => {
    try {
      if (!existChatGroup) {
        const formData = new FormData();

        formData.append('file', {
          uri: commentImage,
          name: 'commentFile',
          type: 'image/png',
        });

        formData.append('title', groupName);

        formData.append('description', '');

        const result = await postMedia(formData, token);

        const appTag = {
          file_id: result.file_id,
          tag: appId + messageId,
        };
        await postTag(appTag, token);
      }

      // find the file with title with chatGroupName
      const ChatGroupFile = await searchMedia(groupName, token);
      const chatFileId = ChatGroupFile[0].file_id;

      // post a comment / message
      await postComment(token, chatFileId, data.message);
      reset();

      // post and delete rating based on message
      const ratingResponse = await getRatingsByFileId(chatFileId);

      const id1 = groupName.split('_')[0].replace(messageId, '');
      const id2 = groupName.split('_')[1].replace(messageId, '');

      const otherId = id1 == userId ? id2 : id1;

      const userRating = ratingResponse.find(
        (singleRating) => singleRating.user_id == userId
      );

      const otherRating = ratingResponse.find(
        (singleRating) => singleRating.user_id == otherId
      );

      if (otherRating === undefined && userRating === undefined) {
        // post rating 3
        await postRating(chatFileId, 3);
      } else if (otherRating === undefined && userRating != undefined) {
        // do nothing
      } else if (otherRating != undefined && userRating === undefined) {
        // unlikely at this point but if happens then
        // Post rating same as other
        await postRating(chatFileId, otherRating.rating);
      } else if (otherRating.rating === 5) {
        // delete previous rating
        await deleteRating(chatFileId);
        // post same rating 3
        await postRating(chatFileId, 3);
      } else {
        // delete previous rating
        await deleteRating(chatFileId);
        // post same rating as other +1
        await postRating(chatFileId, otherRating.rating + 1);
      }

      // post and delete rating ends here
      setUpdateMessage(updateMessage + 1);
    } catch (error) {
      console.error('sendMessage error: ' + error.message);
    }
  };

  useEffect(() => {
    sendAvatar();
    receiveAvatar();
    searchSetGroupName();
  }, []);

  useEffect(() => {
    loadAllMessage();
  }, [groupName, updateMessage]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadAllMessage();
    }, 10000);
    return () => clearInterval(interval);
  }, [allMessage]);

  return (
    <SafeAreaView
      onPress={() => Keyboard.dismiss()}
      style={{flex: 1}}
      activeOpacity={1}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.titleBar}>
          <View style={styles.backIcon}>
            <Button
              type="solid"
              buttonStyle={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" color="black" />
            </Button>
          </View>
          <View style={styles.itemContainer}>
            <Image
              onPress={() => {
                navigation.navigate('ProductDetails', file);
              }}
              style={styles.itemPicture}
              source={{uri: uploadsUrl + file.thumbnails?.w160}}
            />
            <Text style={styles.itemTitle}>{title}</Text>
          </View>
        </View>

        <Divider />
        <MessageList
          navigation={navigation}
          singleItem={allMessage}
          senderAvatar={senderAvatar}
          receiverAvatar={receiverAvatar}
        />
        <Divider />

        <View style={styles.sendMessage}>
          <View style={styles.sendMessageInput}>
            <Controller
              control={control}
              rules={{
                required: {
                  value: true,
                },
                minLength: {
                  value: 1,
                },
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <Input
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={styles.inputStyle}
                  placeholder={'Message'}
                  multiline={true}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="message"
            />
          </View>
          <View style={styles.sendIcon}>
            <Button
              containerStyle={{
                width: 45,
                height: 45,
                borderRadius: 25,
              }}
              buttonStyle={{
                backgroundColor: 'white',
              }}
              onPress={handleSubmit(sendMessage)}
            >
              <Icon
                style={{transform: [{rotateZ: '-30deg'}]}}
                name="send"
                size={30}
                color={primaryColourDark}
              />
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    alignItems: 'baseline',
    position: 'relative',
  },

  backIcon: {
    position: 'absolute',
    top: '30%',
    left: '10%',
  },

  backBtn: {
    borderRadius: 25,
    backgroundColor: '#81C784',
  },

  itemContainer: {
    alignItems: 'center',
  },

  itemPicture: {
    height: 100,
    width: 100,
    borderRadius: 50,
  },

  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  title: {
    marginVertical: 25,
    marginHorizontal: 25,
    fontSize: 25,
    fontWeight: 'bold',
    color: primaryColour,
  },

  sendMessage: {
    flexDirection: 'row',
    // justifyContent: 'space-evenly',
    alignItems: 'flex-start',
  },

  sendMessageInput: {
    width: '85%',
  },

  inputContainerStyle: {
    borderBottomWidth: 0,
    backgroundColor: inputBackground,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginTop: 5,
  },

  inputStyle: {
    textAlign: 'left',
    fontSize: 14,
  },
});

Message.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};

export default Message;
