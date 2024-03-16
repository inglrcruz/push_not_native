import { useEffect, useState } from 'react'
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';


// Initialize Firebase
export const PUSH_NOTIFICATION_CONFIG = {
  APP_PROJECTID: "54b3396b-2649-4b4e-b7b2-96a647544c85",
  FIREBASE: {
    APIKEY: "AIzaSyDPUOyBWgtdID4p-ZW5fmn62ckAqDGi2FM",
    AUTHDOMAIN: "com.ish.ishrn",
    PROJECTID: "exposure-919ed",
    STORAGEBUCKET: "exposure-919ed.appspot.com",
  }
}

export const usePushNotificationNative = () => {

  const [notification, setNotification] = useState<any>()
  const [response, setResponse] = useState<any>()

  const registerForPushNotificationsAsync = async () => {
    const random = Math.floor(Math.random() * (100000 - 1 + 1)) + 1;
    await firebase.initializeApp({
      apiKey: PUSH_NOTIFICATION_CONFIG.FIREBASE.APIKEY,
      appId: "940768875390",
      storageBucket: PUSH_NOTIFICATION_CONFIG.FIREBASE.STORAGEBUCKET,
      authDomain: PUSH_NOTIFICATION_CONFIG.FIREBASE.AUTHDOMAIN,
      projectId: PUSH_NOTIFICATION_CONFIG.FIREBASE.PROJECTID,
      clientId: '',
      databaseURL: '',
      messagingSenderId: '',
    }, `expouseConnct${random}`).then((to) => {
      console.log("== Connect ==")
    }).catch((err) => console.log(err))
  }

  const notificationObserver = async () => {

    await registerForPushNotificationsAsync()


  }

  /**
   * Sets a scheduled push notification using the provided data.
   *
   * @param {SchedulePushNot} data The data for the scheduled push notification.
   */
  const setSchedulePushNotification = async () => {

  }

  /**
   * Gets the Expo Push Token for this device.
   * 
   * @returns {Promise<string>} A promise that resolves to the token.
   */
  const getExpoPushToken = async () => {
    return await messaging().getToken()
  }

  /**
   * This function unregisters the device for receiving push notifications.
   *
   * @returns {Promise<void>} A promise that resolves when the device has been successfully unregistered.
   */
  const unregisterNotification = async () => {
    return await messaging().unregisterDeviceForRemoteMessages()
  }

  return { notificationObserver, notification, response, setSchedulePushNotification, getExpoPushToken, unregisterNotification }
}