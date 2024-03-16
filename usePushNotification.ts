import { Platform } from "react-native"
import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import { initializeApp } from "firebase/app"
import "firebase/messaging"
import { useRef, useState } from "react"
import { PUSH_NOTIFICATION_CONFIG } from "@/config"

// Initialize Firebase
const firebaseConfig = {
  apiKey: PUSH_NOTIFICATION_CONFIG.FIREBASE.APIKEY,
  authDomain: PUSH_NOTIFICATION_CONFIG.FIREBASE.AUTHDOMAIN,
  projectId: PUSH_NOTIFICATION_CONFIG.FIREBASE.PROJECTID,
  storageBucket: PUSH_NOTIFICATION_CONFIG.FIREBASE.STORAGEBUCKET
}

initializeApp(firebaseConfig)

// Sets up the notification handler function that specifies how notifications should be handled when received.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  })
})

/**
 * Registers the device for push notifications.
 *
 * Sets up notification channel on Android.
 *
 * Checks and requests permissions on physical devices to get the push token.
 * Retrieves Expo push token with provided project ID.
 * Displays alert if device is not physical.
 *
 * @returns {string | undefined} Expo push token data if successful; otherwise, undefined.
 */
async function registerForPushNotificationsAsync() {

  let token: any

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C"
    })
  }

  if (Device.isDevice) {

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!")
      return
    }

    token = await Notifications.getExpoPushTokenAsync({
      projectId: PUSH_NOTIFICATION_CONFIG.APP_PROJECTID
    })
  } else {
    alert("Must use physical device for Push Notifications")
  }

  return token?.data
}

type SchedulePushNot = {
  title: string;
  body: string;
  data?: any;
  seconds: any;
}

export const usePushNotification = () => {

  const notificationListener = useRef<any>()
  const responseListener = useRef<any>()
  const [notification, setNotification] = useState<any>()
  const [response, setResponse] = useState<any>()

  /**
   * Function to observe notifications and handle registration on component mount.
   *
   * Registers the device for push notifications and sets the token state.
   * Sets up listeners for received notifications and notification responses, updating state accordingly.
   * Removes notification listeners on component unmount.
   */
  const notificationObserver = () => {

    registerForPushNotificationsAsync()

    // Set up a listener to handle received notifications. When a notification is received, 
    // update the state with the received notification data.
    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      const remoteMessage = notification.request.trigger.remoteMessage
      setNotification((remoteMessage) ? remoteMessage : notification.request.content)
    })

    // Set up a listener to handle notification responses. When a notification response is received, 
    // update the state with the associated notification data.
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const remoteMessage = response.notification.request.trigger.remoteMessage
      setResponse((remoteMessage) ? remoteMessage : response.notification.request.content)
    })

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current)
      Notifications.removeNotificationSubscription(responseListener.current)
    }
  }

  /**
   * Sets a scheduled push notification using the provided data.
   *
   * @param {SchedulePushNot} data The data for the scheduled push notification.
   */
  const setSchedulePushNotification = async (data: SchedulePushNot) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: data.title,
        body: data.body,
        data: data.data
      },
      trigger: { seconds: data.seconds }
    })
  }

  /**
   * Gets the Expo Push Token for this device.
   * 
   * @returns {Promise<string>} A promise that resolves to the token.
   */
  const getExpoPushToken = async () => {
    return await Notifications.getExpoPushTokenAsync({
      projectId: PUSH_NOTIFICATION_CONFIG.APP_PROJECTID
    })
  }

  /**
   * This function unregisters the device for receiving push notifications.
   *
   * @returns {Promise<void>} A promise that resolves when the device has been successfully unregistered.
   */
  const unregisterNotification = () => {
    Notifications.unregisterForNotificationsAsync()
  }

  return { notificationObserver, notification, response, setSchedulePushNotification, getExpoPushToken, unregisterNotification }
}