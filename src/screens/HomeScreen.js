import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { createWallet, getBalance } from "../wallet";

export default function HomeScreen({ navigation }) {
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    const acc = createWallet();
    setAddress(acc.address);
    setPrivateKey(acc.privateKey);

    getBalance(acc.address).then(setBalance);
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Address: {address}</Text>
      <Text>Balance: {balance} ETH</Text>
      <Button title="Send ETH" onPress={() => navigation.navigate("Send", { address, privateKey })} />
    </View>
  );
}
