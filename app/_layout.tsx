import "react-native-reanimated";
import { Text, View } from "react-native";

const RootLayout = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
      <Text style={{ fontSize: 45, textAlign: "center", fontWeight: "bold" }}>
        {"Go to"}
      </Text>
      <Text style={{ fontSize: 25, textAlign: "center"}}>
        {"Settings > Apps > Messages > Filters > Unknown and Unwanted"}
      </Text>
      <Text style={{ fontSize: 20, fontWeight: "300", textAlign: "center", marginTop: 20}}>
        {"And enable the pocapp as spam sms filter"}
      </Text>
    </View>
  );
};

export default RootLayout;
