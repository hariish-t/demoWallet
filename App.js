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
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Web3 from 'web3';

export default function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [privateKey, setPrivateKey] = useState('');
  const [walletName, setWalletName] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    const web3Instance = new Web3('https://comely-brenna-epigeous.ngrok-free.dev');
    setWeb3(web3Instance);
  }, []);

  const createWallet = () => {
    if (!web3) return;
    
    try {
      const newAccount = web3.eth.accounts.create();
      setAccount(newAccount.address);
      setPrivateKey(newAccount.privateKey);
      setWalletName('My Wallet');
      Alert.alert('Wallet Created', `Address: ${newAccount.address.slice(0, 10)}...`);
      getBalance(newAccount.address);
    } catch (error) {
      Alert.alert('Error', 'Failed to create wallet: ' + error.message);
    }
  };

  const importWallet = () => {
    if (!web3 || !privateKey) return;

    try {
      const importedAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
      setAccount(importedAccount.address);
      setWalletName('Imported Wallet');
      Alert.alert('Wallet Imported', `Address: ${importedAccount.address.slice(0, 10)}...`);
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
      setBalance(parseFloat(balanceEth).toFixed(4));
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
      const gasPrice = await web3.eth.getGasPrice();
      const nonce = await web3.eth.getTransactionCount(fromAccount.address);

      const transaction = {
        to: toAddress,
        value: web3.utils.toWei(amount, 'ether'),
        gas: 21000,
        gasPrice: gasPrice,
        nonce: nonce,
      };

      const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      // Add to transaction history
      const newTx = {
        id: receipt.transactionHash,
        from: fromAccount.address,
        to: toAddress,
        amount: amount,
        timestamp: new Date().toISOString(),
        status: 'Success',
      };
      setTransactions([newTx, ...transactions]);
      
      Alert.alert('Success', `Transaction sent\nHash: ${receipt.transactionHash.slice(0, 10)}...`);
      getBalance(fromAccount.address);
      setToAddress('');
      setAmount('');
    } catch (error) {
      Alert.alert('Transaction Failed', error.message);
    }
    setLoading(false);
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  if (!account) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
          <Text style={[styles.appTitle, {color: theme.text}]}>CBDC Wallet</Text>
          <TouchableOpacity onPress={() => setDarkMode(!darkMode)} style={styles.themeToggle}>
            <Text style={{color: theme.text}}>{darkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeTitle, {color: theme.text}]}>Welcome</Text>
          <Text style={[styles.welcomeSubtitle, {color: theme.textSecondary}]}>
            Create a new wallet or import existing one
          </Text>
          
          <TouchableOpacity 
            style={[styles.primaryButton, {backgroundColor: theme.primary}]} 
            onPress={createWallet}
          >
            <Text style={styles.buttonText}>Create New Wallet</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, {backgroundColor: theme.border}]} />
            <Text style={[styles.dividerText, {color: theme.textSecondary}]}>OR</Text>
            <View style={[styles.dividerLine, {backgroundColor: theme.border}]} />
          </View>

          <Text style={[styles.inputLabel, {color: theme.text}]}>Private Key</Text>
          <TextInput
            style={[styles.input, {backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border}]}
            placeholder="Enter private key to import"
            placeholderTextColor={theme.textSecondary}
            value={privateKey}
            onChangeText={setPrivateKey}
            secureTextEntry={true}
          />
          
          <TouchableOpacity 
            style={[styles.secondaryButton, {borderColor: theme.primary}]} 
            onPress={importWallet}
          >
            <Text style={[styles.secondaryButtonText, {color: theme.primary}]}>Import Wallet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, {borderBottomColor: theme.border}]}>
        <View>
          <Text style={[styles.walletName, {color: theme.text}]}>{walletName}</Text>
          <Text style={[styles.walletAddress, {color: theme.textSecondary}]}>
            {formatAddress(account)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setDarkMode(!darkMode)} style={styles.themeToggle}>
          <Text style={{fontSize: 20}}>{darkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.balanceCard, {backgroundColor: theme.card}]}>
          <Text style={[styles.balanceLabel, {color: theme.textSecondary}]}>Total Balance</Text>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            <Text style={[styles.balanceAmount, {color: theme.text}]}>{balance} ETH</Text>
          )}
          <TouchableOpacity 
            style={[styles.refreshButton, {backgroundColor: theme.primary + '20'}]}
            onPress={() => getBalance(account)}
          >
            <Text style={[styles.refreshText, {color: theme.primary}]}>Refresh Balance</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.sendCard, {backgroundColor: theme.card}]}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>Send Transaction</Text>
          
          <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>Recipient Address</Text>
          <TextInput
            style={[styles.input, {backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border}]}
            placeholder="0x..."
            placeholderTextColor={theme.textSecondary}
            value={toAddress}
            onChangeText={setToAddress}
          />
          
          <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>Amount (ETH)</Text>
          <TextInput
            style={[styles.input, {backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border}]}
            placeholder="0.00"
            placeholderTextColor={theme.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          
          <TouchableOpacity 
            style={[styles.primaryButton, {backgroundColor: theme.primary}]} 
            onPress={sendTransaction}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send Transaction'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.transactionCard, {backgroundColor: theme.card}]}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>Recent Transactions</Text>
          
          {transactions.length === 0 ? (
            <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
              No transactions yet
            </Text>
          ) : (
            transactions.map((tx) => (
              <View key={tx.id} style={[styles.txItem, {borderBottomColor: theme.border}]}>
                <View style={styles.txHeader}>
                  <Text style={[styles.txStatus, {color: theme.success}]}>
                    {tx.status}
                  </Text>
                  <Text style={[styles.txDate, {color: theme.textSecondary}]}>
                    {formatDate(tx.timestamp)}
                  </Text>
                </View>
                <View style={styles.txDetails}>
                  <Text style={[styles.txLabel, {color: theme.textSecondary}]}>From:</Text>
                  <Text style={[styles.txAddress, {color: theme.text}]}>
                    {formatAddress(tx.from)}
                  </Text>
                </View>
                <View style={styles.txDetails}>
                  <Text style={[styles.txLabel, {color: theme.textSecondary}]}>To:</Text>
                  <Text style={[styles.txAddress, {color: theme.text}]}>
                    {formatAddress(tx.to)}
                  </Text>
                </View>
                <View style={styles.txDetails}>
                  <Text style={[styles.txLabel, {color: theme.textSecondary}]}>Amount:</Text>
                  <Text style={[styles.txAmount, {color: theme.primary}]}>
                    {tx.amount} ETH
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const lightTheme = {
  background: '#F5F5F5',
  card: '#FFFFFF',
  inputBg: '#F8F9FA',
  text: '#0D1117',
  textSecondary: '#57606A',
  primary: '#0969DA',
  success: '#1A7F37',
  border: '#D0D7DE',
};

const darkTheme = {
  background: '#0D1117',
  card: '#161B22',
  inputBg: '#0D1117',
  text: '#E6EDF3',
  textSecondary: '#8B949E',
  primary: '#2F81F7',
  success: '#3FB950',
  border: '#30363D',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  walletName: {
    fontSize: 20,
    fontWeight: '600',
  },
  walletAddress: {
    fontSize: 13,
    marginTop: 2,
  },
  themeToggle: {
    padding: 8,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 16,
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sendCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  transactionCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  primaryButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
  },
  txItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  txStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  txDate: {
    fontSize: 12,
  },
  txDetails: {
    flexDirection: 'row',
    marginTop: 4,
  },
  txLabel: {
    fontSize: 13,
    width: 60,
  },
  txAddress: {
    fontSize: 13,
    flex: 1,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
