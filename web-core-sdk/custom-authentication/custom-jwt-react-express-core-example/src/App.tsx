import { useEffect, useState } from 'react';
import { Web3AuthCore } from '@web3auth/core';
import {
	WALLET_ADAPTERS,
	CHAIN_NAMESPACES,
	SafeEventEmitterProvider,
} from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import './App.css';
// import RPC from './evm.web3';
import RPC from './evm.ethers';

const clientId =
	'BBP_6GOu3EJGGws9yd8wY_xFT0jZIWmiLMpqrEMx36jlM61K9XRnNLnnvEtGpF-RhXJDGMJjL-I-wTi13RcBBOo'; // get from https://dashboard.web3auth.io

function App() {
	const [web3auth, setWeb3auth] = useState<Web3AuthCore | null>(null);
	const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
		null,
	);

	useEffect(() => {
		const init = async () => {
			try {
				const web3auth = new Web3AuthCore({
					clientId,
					chainConfig: {
						chainNamespace: CHAIN_NAMESPACES.EIP155,
						chainId: '0x5',
					},
				});

				const openloginAdapter = new OpenloginAdapter({
					adapterSettings: {
						clientId,
						network: 'testnet',
						uxMode: 'redirect',
						loginConfig: {
							jwt: {
								name: 'Custom JWT Login',
								verifier: 'web3auth-core-custom-jwt',
								typeOfLogin: 'jwt',
								clientId,
							},
						},
					},
				});
				web3auth.configureAdapter(openloginAdapter);
				setWeb3auth(web3auth);

				await web3auth.init();
				if (web3auth.provider) {
					setProvider(web3auth.provider);
				}
			} catch (error) {
				console.error(error);
			}
		};

		init();
	}, []);

	const getIdToken = async () => {
		// Get idToken from server
		const res = await fetch('http://localhost:8080/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const data = await res.json();
		return data?.token;
	};

	const login = async () => {
		if (!web3auth) {
			uiConsole('web3auth not initialized yet');
			return;
		}

		const web3authProvider = await web3auth.connectTo(
			WALLET_ADAPTERS.OPENLOGIN,
			{
				loginProvider: 'jwt',
				extraLoginOptions: {
					id_token: await getIdToken(),
					verifierIdField: 'sub',
					domain: 'http://localhost:3000',
				},
			},
		);
		setProvider(web3authProvider);
	};

	const getUserInfo = async () => {
		if (!web3auth) {
			uiConsole('web3auth not initialized yet');
			return;
		}
		const user = await web3auth.getUserInfo();
		uiConsole(user);
	};

	const logout = async () => {
		if (!web3auth) {
			uiConsole('web3auth not initialized yet');
			return;
		}
		await web3auth.logout();
		setProvider(null);
	};

	const getAccounts = async () => {
		if (!provider) {
			uiConsole('provider not initialized yet');
			return;
		}
		const rpc = new RPC(provider);
		const userAccount = await rpc.getAccounts();
		uiConsole(userAccount);
	};

	const getBalance = async () => {
		if (!provider) {
			uiConsole('provider not initialized yet');
			return;
		}
		const rpc = new RPC(provider);
		const balance = await rpc.getBalance();
		uiConsole(balance);
	};

	const getChainId = async () => {
		if (!provider) {
			uiConsole('provider not initialized yet');
			return;
		}
		const rpc = new RPC(provider);
		const chainId = await rpc.getChainId();
		uiConsole(chainId);
	};

	const signMessage = async () => {
		if (!provider) {
			uiConsole('provider not initialized yet');
			return;
		}
		const rpc = new RPC(provider);
		const result = await rpc.signMessage();
		uiConsole(result);
	};

	const sendTransaction = async () => {
		if (!provider) {
			uiConsole('provider not initialized yet');
			return;
		}
		const rpc = new RPC(provider);
		const result = await rpc.sendTransaction();
		uiConsole(result);
	};

	function uiConsole(...args: any[]): void {
		const el = document.querySelector('#console>p');
		if (el) {
			el.innerHTML = JSON.stringify(args || {}, null, 2);
		}
	}

	const loginView = (
		<>
			<div className='flex-container'>
				<div>
					<button onClick={getUserInfo} className='card'>
						User Info
					</button>
				</div>
				<div>
					<button onClick={getChainId} className='card'>
						ChainID
					</button>
				</div>
				<div>
					<button onClick={getAccounts} className='card'>
						Account Address
					</button>
				</div>
				<div>
					<button onClick={getBalance} className='card'>
						Balance
					</button>
				</div>
				<div>
					<button onClick={signMessage} className='card'>
						Sign Message
					</button>
				</div>
				<div>
					<button onClick={sendTransaction} className='card'>
						Send Transaction
					</button>
				</div>
				<div>
					<button onClick={logout} className='card'>
						Log Out
					</button>
				</div>
			</div>

			<div id='console' style={{ whiteSpace: 'pre-line' }}>
				<p style={{ whiteSpace: 'pre-line' }}></p>
			</div>
		</>
	);

	const logoutView = (
		<button onClick={login} className='card'>
			Login
		</button>
	);

	return (
		<div className='container'>
			<h1 className='title'>
				<a target='_blank' href='http://web3auth.io/' rel='noreferrer'>
					Web3Auth
				</a>{' '}
				& ReactJS-Express Custom JWT Login
			</h1>

			<div className='grid'>{provider ? loginView : logoutView}</div>

			<footer className='footer'>
				<a
					href='https://github.com/Web3Auth/examples/tree/main/web-core-sdk/custom-authentication/custom-jwt-react-express-core-example'
					target='_blank'
					rel='noopener noreferrer'
				>
					Source code
				</a>
			</footer>
		</div>
	);
}

export default App;
