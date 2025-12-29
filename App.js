import { useEffect } from "react";
import { Alert, Button, StyleSheet, View, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";

// First, set the handler that will cause the notification
// to show the alert
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  useEffect(() => {
    console.log("App.js - useEffect - configurePushNotifications");
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;
      console.log("App.js - useEffect - configurePushNotifications2");
      if (finalStatus !== "granted") {
        console.log(
          "App.js - useEffect - configurePushNotifications2.5 NOT GRANTED"
        );
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      console.log(
        "App.js - useEffect - configurePushNotifications3 finalStatus:",
        finalStatus
      );
      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Push notifications need the appropriate permissions."
        );
        return;
      }
      console.log("App.js - useEffect - getExpoPushTokenAsync1:");
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "2428f91e-9a31-4bbf-81be-a65023e1548f",
      });
      console.log(
        "App.js - useEffect - getExpoPushTokenAsync2 pushTokenData:",
        pushTokenData
      );
      console.log("Push token data:", pushTokenData);

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    }

    configurePushNotifications();
  }, []);

  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received!");
        console.log(notification);
        const userName = notification.request.content.data.userName;
        Alert.alert(
          "Notification!",
          `Hello ${userName}, you have a new message.`
        );
      }
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification response received!");
        console.log(response);
        const userName = response.notification.request.content.data.userName;
        console.log(userName);
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  const permissionsHandler = async () => {
    const settings = await Notifications.getPermissionsAsync();

    const isGranted = settings.granted;
    if (isGranted) {
      Alert.alert(
        "Permission has already been granted!",
        "You can receive notifications"
      );
    } else {
      const request = await Notifications.requestPermissionsAsync();

      if (request.granted) {
        Alert.alert(
          "You have granted permissions",
          "You can now receive notifications"
        );
      } else {
        Alert.alert(
          "You did not grant permissions",
          "You will be unable to receive notifications"
        );
      }
    }
  };
  const scheduleNotificationHandler = () => {
    const triggerTime = new Date(Date.now() + 5000); // 5 seconds from now

    // Second, call scheduleNotificationAsync()
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Look at that notification",
        body: "I'm so proud of myself Wow!",
        data: { userName: "Max" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
  };

  function sendPushNotificationHandler() {
    // Replace with your actual Expo push token
    const expoPushToken = "ExponentPushToken[cWMAJ0FXDSk6lViW4Jl6jR]";

    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        title: "Test - Sent from a Device Push Notification",
        body: "This is a test push notification sent from the app!",
        data: { userName: "Max" },
      }),
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={{ marginBottom: 20 }}>
        <Button
          style={styles.pressed}
          title="Permissions"
          onPress={permissionsHandler}
        />
      </View>
      <Button
        title="Schedule Notification"
        onPress={scheduleNotificationHandler}
      />

      <Button
        title="Send Push Notification"
        onPress={sendPushNotificationHandler}
      ></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 1.0 },
});
