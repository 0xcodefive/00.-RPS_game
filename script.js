const Contract_Address = "0xb4b4174C5CaEcA5E28834f940ee4e9C6e1476229";
const Contract_ABI = [
	{
		"inputs": [],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "_choice",
				"type": "uint8"
			}
		],
		"name": "letsPlay",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "choice",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "result",
				"type": "uint8"
			}
		],
		"name": "GameIsPlayed",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "maxBet",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const gasLimitVal = ethers.BigNumber.from(300000);

let provider;
let signer;
let contract;

async function walletConnect(){
    if (typeof window.ethereum === 'undefined') {
        alert("Crypto wallet not detected!");
    } else {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        provider.send("eth_requestAccounts", []).then(() => {
            let chainId = window.ethereum.chainId;
            if (chainId !== "0x61") {
                window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                        chainId: "0x61",
                        rpcUrls: ["https://endpoints.omniatech.io/v1/bsc/testnet/public"],
                        chainName: "Binance Smart Chain Testnet",
                        nativeCurrency: {
                            name: "tBNB",
                            symbol: "tBNB",
                            decimals: 18
                        },
                        blockExplorerUrls: ["https://testnet.bscscan.com"]
                    }]
                });
            };

            provider.listAccounts().then((accounts) => {
                signer = provider.getSigner(accounts[0]);
                contract = new ethers.Contract(
                    Contract_Address,
                    Contract_ABI,
                    signer
                );

                document.getElementById('connector').style.display='none';
                document.getElementById('game').style.display='inline';
            });
        });
    }
}

async function choice(_choice){
    document.getElementById('btnGetResult').style.display='none';
    let resultLog = document.getElementById("resultLog");
    resultLog.innerText = "";

    let amountInGwei = document.getElementById("amount").value;
    if (amountInGwei == 0){
        alert("Your bet must be greater than zero");
    } else {
        let amountInWei = ethers.utils.parseUnits(amountInGwei.toString(), 16);
        console.log(amountInWei);
        
        contract.letsPlay(_choice, {value: amountInWei, gasLimit: gasLimitVal }).then((res) => {
            console.log(res);
            sleep(10 * 1000).then(() => {
                handleEvent();
                document.getElementById('btnGetResult').style.display='inline';
            });
        });
    }
}

async function handleEvent(){
    let resultLog = document.getElementById("resultLog");
    resultLog.innerText = "";

    contract.queryFilter('GameIsPlayed', await provider.getBlockNumber() - 10000, await provider.getBlockNumber()).then((queryResult) => {
        let queryResultRecent = queryResult[queryResult.length - 1]

        let player = queryResultRecent.args.player.toString();
        let amount = queryResultRecent.args.amount.toString();
        let choice = queryResultRecent.args.choice.toString();
        let result = queryResultRecent.args.result.toString();

        if (player === signer._address) {    
            let resultLogs = `
            stake amount: ${ethers.utils.formatEther(amount.toString())} Gwei, 
            player: ${player}, 
            player chose: ${choice == 0 ? "Rock": choice == 1 ? "Paper" : "Scissors"}, 
            result: ${result == choice ? "Вraw": 2 + result - choice == 0 || result - choice == 1 ? "WIN!!!" : "Lose"}`;
            console.log(resultLogs);    
            resultLog.innerText = resultLogs;
        } else {
            resultLog.innerText = "Transaction not detected, try again later";
        }
    });    
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}