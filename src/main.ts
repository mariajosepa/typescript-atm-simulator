import '../src/styles/main.css';
import "../src/styles/screens.css";
import '../src/styles/cards.css'
import { clearPin } from './util'
import './dragAndDrop'
import { ATM } from './atm'
import { ATMState, onATMStateChange, setATMState, currentATMState } from './state/atmState';

const atmScreen = document.getElementById('atm-screen') as HTMLDivElement;
const keypad = document.getElementById('keypad') as HTMLDivElement;
const beepSound = new Audio('/assets/key_beep.mp3');
let pressedKey : string  = ''; 
let enteredPin : string = '';

const myATM = new ATM(10000,4000);
const myAccount = {
  pin: '1234',
  balance: 10000

}
//show start screen
document.addEventListener("DOMContentLoaded", () => {

  const welcomeLogo = document.createElement('img');
  const startMessage = document.createElement('h1');
  welcomeLogo.src = '/assets/logo.png';
  welcomeLogo.id = 'welcome-logo';
  startMessage.classList.add('atm-title');
  startMessage.textContent = 'Insert card';

  atmScreen.append(welcomeLogo);
  atmScreen.append(startMessage);
  atmScreen.classList.add('start-screen');

});
//add functionality to keys
keypad?.addEventListener('click', (event) => {
  const target = event.target as HTMLDivElement;
  if (target.classList.contains('keypad-button') || target.classList.contains('keypad-special-button')) {
    beepSound.play(); //add key beep
    pressedKey = target.textContent?.trim() ?? ''; //save immediately pressed key
  }

  if(currentATMState === ATMState.EnteringPin){
    pinType(pressedKey);

  } 
}
);
// main screen flow
onATMStateChange((state) => {
  if (state === ATMState.EnteringPin){
    let pinBoxesHTML = '';
    // Generate 4 pin-boxes dynamically
    for (let i = 0; i < 4; i++) {
      pinBoxesHTML += `
        <div class="pin-box">
          <p></p>
          <div class="pin-box-line">__</div>
        </div>
      `;
    }
    // Inject the whole structure
    atmScreen.innerHTML = `
      <div id="pin-lines">
        ${pinBoxesHTML}
      </div>
      <p class="pin-instruction">Enter your 4-digit PIN</p>
    `;

    atmScreen.classList.add('enter-pin');
  }
})

//check pin
const pinType = (num : string) => {
  if (isNaN(Number(num))){
    return
  }
  let insertSpot = enteredPin.length;
  enteredPin += num;

  const pinLines = document.getElementById('pin-lines');
    if (pinLines){
      pinLines.children[insertSpot].children[0].innerHTML = '*';
    }

  if (enteredPin.length === 4){
    let isCorrect = myATM.checkPin(enteredPin,myAccount);
    if (isCorrect){
      setTimeout(()=>{
        console.log('That is correct');
        setATMState(ATMState.Menu);
        enteredPin = '';},1000);
    }
    else{
      setTimeout(()=>{
        console.log("WRONG PING MY GUY");
        clearPin();
        enteredPin = '';
      },1000)
      
    }
  }
}
