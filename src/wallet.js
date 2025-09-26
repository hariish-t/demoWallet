import web3 from "./web3";

export function createWallet() {
  return web3.eth.accounts.create();
}

export async function getBalance(address) {
  const balance = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balance, "ether");
}

export async function sendTx(sender, privateKey, recipient, amount) {
  const tx = {
    from: sender,
    to: recipient,
    value: web3.utils.toWei(amount, "ether"),
    gas: 21000
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
  return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}
