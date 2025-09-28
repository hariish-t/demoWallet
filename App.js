import 'react-native-get-random-values';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Web3 from 'web3';

export default function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [privateKey, setPrivateKey] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize Web3 with Holesky testnet (reliable for mobile apps)
    const web3Instance = new Web3('https://holesky.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
    setWeb3(web3Instance);
  }, []);

  const createWallet = () => {
    if (!web3) return;
    
    try {
      const newAccount = web3.eth.accounts.create();
      setAccount(newAccount.address);
      setPrivateKey(newAccount.privateKey);
      Alert.alert('Wallet Created!', `Address: ${newAccount.address}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create wallet: ' + error.message);
    }
  };

  const importWallet = () => {
    if (!web3 || !privateKey) return;

    try {
      const importedAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
      setAccount(importedAccount.address);
      Alert.alert('Wallet Imported!', `Address: ${importedAccount.address}`);
      getBalance(importedAccount.address);
    } catch (error) {
      Alert.alert('Error', 'Invalid private key');
    }
  };

  const getBalance = async (address) => {
    if (!web3 || !address) return;

    setLoading(true);
    try {
      const balanceWei = await web3.eth.getBalance(address);
      const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
      setBalance(parseFloat(balanceEth).toFixed(6));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch balance');
    }
    setLoading(false);
  };

  const sendTransaction = async () => {
    if (!web3 || !privateKey || !toAddress || !amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const fromAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
      
      // Get gas price and nonce
      const gasPrice = await web3.eth.getGasPrice();
      const nonce = await web3.eth.getTransactionCount(fromAccount.address);

      // Create transaction
      const transaction = {
        to: toAddress,
        value: web3.utils.toWei(amount, 'ether'),
        gas: 21000,
        gasPrice: gasPrice,
        nonce: nonce,
      };

      // Sign transaction
      const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
      
      // Send transaction
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      Alert.alert('Success!', `Transaction sent: ${receipt.transactionHash}`);
      getBalance(fromAccount.address);
      setToAddress('');
      setAmount('');
    } catch (error) {
      Alert.alert('Error', 'Transaction failed: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Demo Wallet</Text>
        <Text style={styles.subtitle}>Basic Ethereum Wallet</Text>
      </View>

      {account ? (
        <View style={styles.walletInfo}>
          <Text style={styles.label}>Wallet Address:</Text>
          <Text style={styles.address}>{account}</Text>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.label}>Balance:</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.balance}>{balance} ETH</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => getBalance(account)}
          >
            <Text style={styles.buttonText}>Refresh Balance</Text>
          </TouchableOpacity>

          <View style={styles.sendSection}>
            <Text style={styles.sectionTitle}>Send Transaction</Text>
            
            <TextInput
              style={styles.input}
              placeholder="To Address"
              value={toAddress}
              onChangeText={setToAddress}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Amount (ETH)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            
            <TouchableOpacity 
              style={[styles.button, styles.sendButton]} 
              onPress={sendTransaction}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send Transaction'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.createWalletSection}>
          <TouchableOpacity style={styles.button} onPress={createWallet}>
            <Text style={styles.buttonText}>Create New Wallet</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>Or</Text>

          <Text style={styles.label}>Import Existing Wallet:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Private Key"
            value={privateKey}
            onChangeText={setPrivateKey}
            secureTextEntry={true}
          />
          
          <TouchableOpacity style={styles.button} onPress={importWallet}>
            <Text style={styles.buttonText}>Import Wallet</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  walletInfo: {
    padding: 20,
  },
  createWalletSection: {
    padding: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  address: {
    fontSize: 12,
    color: '#666',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  sendButton: {
    backgroundColor: '#FF6B35',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  orText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
});
