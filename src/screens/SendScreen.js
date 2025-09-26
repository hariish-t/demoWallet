import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { sendTx } from "../wallet";

export default function SendScreen({ route }) {
  const { address, privateKey } = route.params;
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("0.1");
  const [status, setStatus] = useState("");

  async function handleSend() {
    try {
      const receipt = await sendTx(address, privateKey, to, amount);
      setStatus("Tx Success: " + receipt.transactionHash);
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>From: {address}</Text>
      <TextInput placeholder="Recipient" value={to} onChangeText={setTo} />
      <TextInput placeholder="Amount (ETH)" value={amount} onChangeText={setAmount} />
      <Button title="Send" onPress={handleSend} />
      <Text>{status}</Text>
    </View>
  );
}
