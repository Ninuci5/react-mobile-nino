import { Image } from "expo-image";
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";

export default function Index() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardDismissMode="on-drag"
    >
      <Text>Welcome to React Native!</Text>
      <Button title="ყიდვა" />
      <Text>Welcome to React Native!</Text>
      <Button title="ყიდვა" />

      <Text>Welcome to React Native!</Text>
      <Button title="ყიდვა" />
      <Text>Welcome to React Native!</Text>
      <Button title="ყიდვა" />

      <Text>Welcome to React Native!</Text>
      <Button title="ყიდვა" />

      <Text>Welcome to React Native!</Text>
      <Button title="ყიდვა" />
      <Text>Welcome to React Native!</Text>
      <Button title="ყიდვა" />
      <Text>Welcome to React Native!</Text>
      <Button title="ყიდვა" />

      <Text>Welcome to React Native!</Text>
      <Button title="ყიდვა" />
      <Text>Welcome to React Native!</Text>
      <Button title="ყიდვა" />

      <Pressable
        onPress={() => console.log("Pressed!")}
        style={styles.pressable}
      >
        <Text style={styles.listItem}>Press Me</Text>
      </Pressable>

      <TouchableOpacity
        onPress={() => console.log("TouchableOpacity Pressed!")}
        activeOpacity={0.5}
        style={styles.pressable}
      >
        <Text style={styles.listItem}>Touchable Press Me</Text>
      </TouchableOpacity>

      <TouchableHighlight
        onPress={() => console.log("TouchableHighlight Pressed!")}
        underlayColor="lightgray"
        style={styles.pressable}
        activeOpacity={0.2}
      >
        <Text style={styles.listItem}>Touchable Highlight Press Me</Text>
      </TouchableHighlight>

      <TextInput
        placeholder="Enter text"
        style={styles.input}
        keyboardType="numeric"
        keyboardAppearance="dark"
        secureTextEntry={true}
      />

      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.image}
        contentFit="contain"
      />
      <Text
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "200%",
    borderWidth: 10,
    borderColor: "black",
    paddingBottom: 200,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  listItem: {
    fontSize: 18,
    paddingVertical: 10,
  },
  pressable: {
    backgroundColor: "lightblue",
    borderRadius: 4,
    marginTop: 16,
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    padding: 8,
    marginTop: 16,
    width: "80%",
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 16,
  },
});
