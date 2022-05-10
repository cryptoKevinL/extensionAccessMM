const { MetaMaskInpageProvider } = require('@metamask/inpage-provider')
const PortStream = require('extension-port-stream')
const { detect } = require('detect-browser')
const { create } = require('ipfs-http-client')
const browser = detect()
const config = require('./config.json')
const client = create('https://ipfs.infura.io:5001/api/v0')

function createMetaMaskProvider () {
  let provider
  try {
    let currentMetaMaskId = getMetaMaskId()
    const metamaskPort = chrome.runtime.connect(currentMetaMaskId)
    const pluginStream = new PortStream(metamaskPort)
    provider = new MetaMaskInpageProvider(pluginStream)
 } catch (e) {
    console.dir(`Metamask connect error `, e)
    throw e
  }
  return provider
}

function getMetaMaskId () {
  switch (browser && browser.name) {
    case 'chrome':
      return config.CHROME_ID
    case 'firefox':
      return config.FIREFOX_ID
    default:
      return config.CHROME_ID
  }
}

// function uploadNewDataToIPFS (text) {
//   let cidReturn = "failed";
//   client.add(text).then(cid => {
//     const url = `https://ipfs.infura.io/ipfs/${cid.path}`
//     console.log('IPFS link: ', url)
//     cidReturn = `${cid.path}`
//   })
//   return cidReturn;
// }

async function uploadNewDataToIPFS (text) {
  let cidReturn = "failed";
  let cid = await client.add(text)
  const url = `https://ipfs.infura.io/ipfs/${cid.path}`
  console.log('IPFS link: ', url)
  cidReturn = `${cid.path}`
  return cidReturn;
}

module.exports = {
  uploadNewDataToIPFS,
  createMetaMaskProvider
}

