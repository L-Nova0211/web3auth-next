import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import Web3Auth, {
  LOGIN_PROVIDER,
  OPENLOGIN_NETWORK,
} from '@web3auth/react-native-sdk';
import '@ethersproject/shims';
import {ethers} from 'ethers';
import {Buffer} from 'buffer';
global.Buffer = global.Buffer || Buffer;
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const scheme = 'web3authrnbarefirebase'; // Or your desired app redirection scheme
const resolvedRedirectUrl = `${scheme}://openlogin`;
const clientId =
  'BHr_dKcxC0ecKn_2dZQmQeNdjPgWykMkcodEHkVvPMo71qzOV6SgtoN8KCvFdLN7bf34JOm89vWQMLFmSfIo84A';
const providerUrl = 'https://rpc.ankr.com/eth'; // Or your desired provider url

async function signInWithGoogle() {
  try {
    GoogleSignin.configure({
      webClientId:
        '461819774167-5iv443bdf5a6pnr2drt4tubaph270obl.apps.googleusercontent.com',
    });
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // Get the users ID token
    const {idToken} = await GoogleSignin.signIn();
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const res = await auth().signInWithCredential(googleCredential);
    return res;
  } catch (error) {
    console.error(error);
  }
}

export default function App() {
  const [key, setKey] = useState('');
  const [userInfo, setUserInfo] = useState('');
  const [console, setConsole] = useState('');

  const login = async () => {
    try {
      setConsole('Logging in');
      const web3auth = new Web3Auth(WebBrowser, {
        clientId,
        network: OPENLOGIN_NETWORK.TESTNET, // or other networks
        loginConfig: {
          jwt: {
            name: 'Web3Auth-Auth0-JWT',
            verifier: 'web3auth-core-firebase',
            typeOfLogin: 'jwt',
            clientId,
          },
        },
      });

      const loginRes = await signInWithGoogle();
      uiConsole('Google login success', loginRes);
      const idToken = await loginRes.user.getIdToken(true);
      uiConsole('idToken', idToken);

      const info = await web3auth.login({
        loginProvider: LOGIN_PROVIDER.JWT,
        redirectUrl: resolvedRedirectUrl,
        mfaLevel: 'none',
        curve: 'secp256k1',
        extraLoginOptions: {
          id_token: idToken,
          verifierIdField: 'sub',
          domain: 'http://localhost:3000',
        },
      });

      setUserInfo(info);
      setKey(info.privKey);
      uiConsole('Logged In');
    } catch (e) {
      console.error(e);
    }
  };

  const getChainId = async () => {
    try {
      setConsole('Getting chain id');
      const ethersProvider = ethers.getDefaultProvider(providerUrl);
      const networkDetails = await ethersProvider.getNetwork();
      uiConsole(networkDetails);
    } catch (e) {
      uiConsole(e);
    }
  };

  const getAccounts = async () => {
    try {
      setConsole('Getting account');
      const wallet = new ethers.Wallet(key);
      const address = await wallet.address;
      uiConsole(address);
    } catch (e) {
      uiConsole(e);
    }
  };
  const getBalance = async () => {
    try {
      setConsole('Fetching balance');
      const ethersProvider = ethers.getDefaultProvider(providerUrl);
      const wallet = new ethers.Wallet(key, ethersProvider);
      const balance = await wallet.getBalance();
      uiConsole(balance);
    } catch (e) {
      uiConsole(e);
    }
  };
  const sendTransaction = async () => {
    try {
      setConsole('Sending transaction');
      const ethersProvider = ethers.getDefaultProvider(providerUrl);
      const wallet = new ethers.Wallet(key, ethersProvider);

      const destination = '0x40e1c367Eca34250cAF1bc8330E9EddfD403fC56';

      // Convert 1 ether to wei
      const amount = ethers.utils.parseEther('0.001');

      // Submit transaction to the blockchain
      const tx = await wallet.sendTransaction({
        to: destination,
        value: amount,
        maxPriorityFeePerGas: '5000000000', // Max priority fee per gas
        maxFeePerGas: '6000000000000', // Max fee per gas
      });
      uiConsole(tx);
    } catch (e) {
      uiConsole(e);
    }
  };
  const signMessage = async () => {
    try {
      setConsole('Signing message');
      const ethersProvider = ethers.getDefaultProvider(providerUrl);
      const wallet = new ethers.Wallet(key, ethersProvider);

      const originalMessage = 'YOUR_MESSAGE';

      // Sign the message
      const signedMessage = await wallet.signMessage(originalMessage);

      uiConsole(signedMessage);
    } catch (e) {
      uiConsole(e);
    }
  };

  const uiConsole = (...args) => {
    setConsole(JSON.stringify(args || {}, null, 2) + '\n\n\n\n' + console);
  };

  const loggedInView = (
    <View style={{flex: 2, alignItems: 'center', justifyContent: 'center'}}>
      <Button title="Get User Info" onPress={() => uiConsole(userInfo)} />
      <Button title="Get Chain ID" onPress={() => getChainId()} />
      <Button title="Get Accounts" onPress={() => getAccounts()} />
      <Button title="Get Balance" onPress={() => getBalance()} />
      <Button title="Send Transaction" onPress={() => sendTransaction()} />
      <Button title="Sign Message" onPress={() => signMessage()} />
      <Button title="Get Private Key" onPress={() => uiConsole(key)} />
      <Button title="Log Out" onPress={() => setKey('')} />
    </View>
  );

  const unloggedInView = (
    <View style={{flex: 2, alignItems: 'center', justifyContent: 'center'}}>
      <Button title="Login with Web3Auth" onPress={login} />
    </View>
  );

  return (
    <View style={styles.container}>
      {key ? loggedInView : unloggedInView}
      <View style={styles.consoleArea}>
        <Text style={{padding: 10}}>Console:</Text>
        <ScrollView style={styles.console}>
          <Text>{console}</Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consoleArea: {
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  console: {
    flex: 1,
    backgroundColor: '#CCCCCC',
    color: '#ffffff',
    padding: 10,
    width: Dimensions.get('window').width - 60,
  },
});
