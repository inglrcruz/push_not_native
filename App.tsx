import { useEffect, useState } from 'react'
import { Alert, Animated, NativeSyntheticEvent, PanResponder, StyleSheet, Text, View } from 'react-native'
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';

export const PUSH_NOTIFICATION_CONFIG = {
  APP_PROJECTID: "54b3396b-2649-4b4e-b7b2-96a647544c85",
  FIREBASE: {
    APIKEY: "AIzaSyDPUOyBWgtdID4p-ZW5fmn62ckAqDGi2FM",
    AUTHDOMAIN: "com.ish.ishrn",
    PROJECTID: "exposure-919ed",
    STORAGEBUCKET: "exposure-919ed.appspot.com",
  }
}

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

export default function App() {

  const [step, setStep] = useState(20)
  const min = -20, max = 20
  const [previousPanX, setPreviousPanX] = useState<number>(2)
  const [nextMove, setNextMove] = useState(0)
  const [connect, setConnect] = useState<boolean>(false);

  useEffect(() => {

    async function name() {
      const random = Math.floor(Math.random() * (100000 - 1 + 1)) + 1;

      firebase.initializeApp({
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
  
      messaging().getToken().then((fcmToken: any) => {
        if (fcmToken) {
          console.log('FCM token:', fcmToken);
          // Send the token to your server for further processing
        } else {
          console.log('No FCM token available');
        }
      }).catch((error: any) => {
        console.error('Error retrieving FCM token:', error);
      })


      messaging().onMessage(async remoteMessage => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      })
      
    }

    name()

  }, [])

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, null], {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<any>) => {
        const { pageX } = event.nativeEvent
        const delta = pageX - previousPanX
        if (nextMove === 10) {
          if (delta > 0) {
            setStep((min >= step) ? min : (step - 1))
            setNextMove(0)
          }
          if (delta < 0) {
            setStep((max <= step) ? max : (step + 1))
            setNextMove(0)
          }
        }
        setPreviousPanX(pageX)
        setNextMove(prev => prev + 1)
      }
    })
  })

  return (
    <View style={[styles.sliderWrap, { alignItems: 'center', overflow: 'hidden' }]} >
      <View style={{ flexDirection: 'row', padding: 10 }} {...panResponder.panHandlers}>
        {[...Array(20).keys()].map((val: number) => <View style={[styles.sliderLine, { backgroundColor: step >= (val - max) ? "red" : "#FFF" }]} key={val} />)}
        <View style={{ alignItems: "center", marginTop: -10, width: 20 }}>
          <Text style={{ color: "#ffa800", fontSize: 12, fontWeight: "bold" }}>{step}</Text>
          <View style={[styles.sliderLine, { backgroundColor: "#ffa800", height: 20 }]}></View>
        </View>
        {[...Array(20).keys()].map((val: number) => <View style={[styles.sliderLine, { backgroundColor: step >= val ? "red" : "#FFF" }]} key={val} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sliderWrap: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "#000",
    bottom: 500,
    width: "100%",
    paddingLeft: 20,
    paddingRight: 20,
    marginLeft: 10,
    marginRight: 10
  },
  sliderLine: {
    width: 2,
    height: 20,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 20,
    alignSelf: 'center'
  }
})