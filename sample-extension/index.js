const createProvider = require('../')
const text = document.getElementById( 'notify-text' );
const notify = document.getElementById( 'notify-button' );
const reset = document.getElementById( 'notify-reset' );
const counter = document.getElementById( 'notify-count' );
//start of SimpleChat code
let restApiUrl = 'https://simplechatapiforus.herokuapp.com/users'; 
let streamID = 'this should never work'; // test data

const provider = createProvider()

let selectedWalletAddress = "none";
let loadedMsgs = []; 

// document.addEventListener('DOMContentLoaded', function () {
//   console.log('DOMContent.........');
//   //let accounts = provider.request({method: 'eth_requestAccounts'}) //eth.accounts()
//   // const interval = setInterval(function () {
//   //   updateChatData();
//   // }, 5000);
// });

renderText('Loading...')

if (provider) {
  console.log('provider detected', provider)
  renderText('MetaMask provider detected.')
  //eth.accounts()
   provider.request({method: 'eth_requestAccounts'})
  .then((accounts) => {
    selectedWalletAddress = `${accounts[0]}`
    renderText(`Detected MetaMask account ${accounts[0]}`)
  })

  provider.on('error', (error) => {
    if (error && error.includes('lost connection')) {
      renderText('MetaMask extension not detected.')
    }
  })

} else {
  renderText('MetaMask provider not detected.')
}

function renderText (text) {
  content.innerText = text
  console.log(text);
}

// provider.on('accountsChanged', async () => {
//   renderText("i see you");
// });

const checkIfWalletIsConnected = async () => {
  try {        
     if (provider) {
        console.log('provider detected', provider)
        let accounts = provider.request({method: 'eth_requestAccounts'}) //eth.accounts()
        console.log(`Detected MetaMask account ${accounts[0]}`)
        //User can have multiple authorized accounts, we grab the first one if its there!
        provider.request({method: 'eth_requestAccounts'})
        .then((accounts) => {
          selectedWalletAddress = `${accounts[0]}`
          renderText(`Still selected ${accounts[0]}`)
        })         
      } else {
         console.log('MetaMask provider not detected.')
     }
  } catch (error) {
     console.log(error)
  }
  //setIsLoading(false)
}

const fetchPost = data => {
fetch(` ${restApiUrl}`, {
method: 'POST',
headers: {
  'Content-Type': 'application/json'
},
body: JSON.stringify(data)
}).then(response => response.json()) //Then with the data from the response in JSON...
.then(data => {
console.log('$$$kl - Post to REST API:', data);
}) //Then with the error genereted...
.catch(error => {
console.error('Post to REST API error!!!!!!!!!!!!:', error);
});
};

const fetchPut = (data, id) => {
fetch(` ${restApiUrl}/${id}`, {
method: 'PUT',
headers: {
  'Content-Type': 'application/json'
},
body: JSON.stringify(data)
}).then(response => response.json()) //Then with the data from the response in JSON...
.then(data => {
console.log('$$$kl - PUT to REST API:', data);
}) //Then with the error genereted...
.catch(error => {
console.error('PUT to REST API error!!!!!!!!!!!!:', error);
});
};

const updateStreamID = resp => {
streamID = resp;
console.log('Message sending to REST API: ', streamID);

checkIfWalletIsConnected();
//selectedWalletAddress =  "0xtestdude" //window.ethereum.selectedAddress; //Obj of data to send in future like a dummyDb

const sendToAddress = "0xextensiontest"; //msgerSendTo.value;
const commonName = "chromeExt"; //msgerMyName.value;
const data = {
streamID: `${streamID}`,
fromName: `${commonName}`,
fromAddr: `${selectedWalletAddress}`,
toAddr: `${sendToAddress}`,
read: false
}; //POST request with body equal on data in JSON format

fetchPost(data);
};

function addMessageReceiver(message, fromName, restApiMsgId) {
// if(message === "FALSE"){
//   console.log("updating message: ", message)
//   message = "<MSG UNSENT>" //signal that the sender undsent the original message by removing decryption permissions
// }
//const delay = message.split(" ").length * 100;
//setTimeout(() => {
if (!loadedMsgs[restApiMsgId]) {
console.log("adding message rx:", message);
appendMessage(fromName, BOT_IMG, "left", message);
loadedMsgs[restApiMsgId] = true;
} //}, delay);

}

function addMessageSender(message, fromName, wasRead, restApiMsgId) {
// if(wasRead == true)
//   textspan.appendChild(document.createTextNode(`${message}` + " (READ) (msgId:" + `${restApiMsgId}` + ")"));
// else if(wasRead == "unsent")
//   textspan.appendChild(document.createTextNode(`${message}` + " (UNSENT) (msgId:" + `${restApiMsgId}` + ")"));
// else
//   textspan.appendChild(document.createTextNode(`${message}` + " (UNREAD) (msgId:" + `${restApiMsgId}` + ")"));
if (!loadedMsgs[restApiMsgId]) {
console.log("adding message sender:", message);
appendMessage(PERSON_NAME, PERSON_IMG, "right", message);
loadedMsgs[restApiMsgId] = true;
}
}

function updateChatData() {
//GET request to get off-chain data for RX user
fetch(` ${restApiUrl}`, {
method: 'GET',
headers: {
  'Content-Type': 'application/json'
}
}).then(response => response.json()) //Then with the data from the response in JSON...
.then(data => {
//console.log('$$$kl - GET to REST API:', data);
// @ts-ignore
//const test = document.getElementById('sendaddr').value;
for (let i = 0; i < data.length; i++) {
  //console.log("processing id: ", data[i].id)
  const streamToDecrypt = data[i].streamID;

  if (data[i].toAddr.toLowerCase() == selectedWalletAddress.toLowerCase()) {
    addMessageReceiver(data[i].streamID, data[i].fromName, data[i].id); //mark as read if box is checked
    // if(document.getElementById('readReceipts').checked && data[i].read != "unsent") {
    //   console.log('$$$kl - marking READ for streamID: ', streamToDecrypt)
    //   const putData = { streamID: `${data[i].streamID}`, fromName: `${data[i].fromName}`, fromAddr: `${data[i].fromAddr}`, toAddr: `${data[i].toAddr}`, read: true }
    //   fetchPut(putData, data[i].id)
    // }
    // else {
    //   console.log('$$$kl - read receipts is not checked, going rogue')
    // }
  } //print sent messages
  else if (data[i].fromAddr.toLowerCase() == selectedWalletAddress.toLowerCase()) {
    addMessageSender(data[i].streamID + "\n", data[i].fromName, data[i].read, data[i].id);
  }
}
}) //Then with the error genereted...
.catch(error => {
console.error('GET to REST API error!!!!!!!!!!!!:', error);
});
} //end LitChat copied functions


// msgerForm.addEventListener("submit", event => {
//   event.preventDefault();
//   const msgText = msgerInput.value;
//   if (!msgText) return; // appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);

//   msgerInput.value = ""; //send to REST API for storage

//   updateStreamID(msgText); //TODO: need a better way to update more incrementally.

//   updateChatData();
// });

function appendMessage(name, img, side, text) {
//   Simple solution for small apps
const msgHTML = `
<div class="msg ${side}-msg">
  <div class="msg-img" style="background-image: url(${img})"></div>

  <div class="msg-bubble">
    <div class="msg-info">
      <div class="msg-info-name">${name}</div>
      <div class="msg-info-time">${formatDate(new Date())}</div>
    </div>

    <div class="msg-text">${text}</div>
  </div>
</div>
`;
msgerChat.insertAdjacentHTML("beforeend", msgHTML);
msgerChat.scrollTop += 500;
} // function botResponse() {
//   const r = random(0, BOT_MSGS.length - 1);
//   const msgText = BOT_MSGS[r];
//   const delay = msgText.split(" ").length * 100;
//   setTimeout(() => {
//     appendMessage(BOT_NAME, BOT_IMG, "left", msgText);
//   }, delay);
// }
// Utils

function get(selector, root = document) {
return root.querySelector(selector);
}

function formatDate(date) {
const h = "0" + date.getHours();
const m = "0" + date.getMinutes();
return `${h.slice(-2)}:${m.slice(-2)}`;
}

function random(min, max) {
return Math.floor(Math.random() * (max - min) + min);
}
//end of SimpleChat code

// chrome.storage.get( ['notifyCount'], data => {
// let value = data.notifyCount || 0;
// counter.innerHTML = value;
// } );

// chrome.storage.onChanged.addListener( ( changes, namespace ) => {
// if ( changes.notifyCount ) {
// let value = changes.notifyCount.newValue || 0;
// counter.innerHTML = value;
// }
// });

reset.addEventListener( 'click', () => {
//chrome.storage.clear();
text.value = '';
} );

notify.addEventListener( 'click', () => {
  //text.value = 'you changed it';

updateStreamID(text.value);
} );


