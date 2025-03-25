import '../src/styles/main.css';
import "../src/styles/screens.css";
import '../src/styles/cards.css'
import '../src/styles/money.css'
import { clearPin, extractValueOptions } from './util'
import './dragAndDrop'
import { ATM } from './atm'
import { ATMState, onATMStateChange, setATMState, currentATMState } from './state/atmState';
import { Account } from './account';


const atmScreen = document.getElementById('atm-screen') as HTMLDivElement;
const keypad = document.getElementById('keypad') as HTMLDivElement;
const leftScreenButtons = document.getElementById('atm-left-buttons') as HTMLDivElement;
const rightScreenButtons = document.getElementById('atm-right-buttons') as HTMLDivElement;
const atmBody = document.getElementById('atm-img-container');


const beepSound = new Audio('/assets/key_beep.mp3');
let pressedKey : string  = ''; 
let enteredPin : string = '';
let selectedAmount : string = '';
let textToDisplay : string = '';

type ATMMenuKey = keyof typeof ATMState;
const leftScreenButtonOptions : Partial<Record<ATMMenuKey, string[]>> = {
  Menu : ['View Balance','Withdraw','Deposit','Exit'],
  Withdrawing : ['$20', '$40', '$60', ''],
  WithdrawingConfirm : ['','','','yes']

}
const rightScreenButtonOptions : Partial<Record<ATMMenuKey, string[]>> = {
  Menu : ['','','',''],
  Withdrawing : ['$100', '$200', 'other', 'back'],
  WithdrawingConfirm : ['','','','cancel']
}

const myATM = new ATM(10000,4000);
const myAccount : Account = {
  pin: '1234',
  balance: 10000
}

//welcome logo
document.addEventListener('DOMContentLoaded',()=>{
  setATMState(ATMState.WaitingForCard);
})

//add functionality to keypad, depending on screen state
keypad?.addEventListener('click', (event) => {
  const target = event.target as HTMLDivElement;
  if (target.classList.contains('keypad-button') || target.classList.contains('keypad-special-button')) {
    beepSound.play(); //add key beep
    pressedKey = target.textContent?.trim() ?? ''; //save immediately pressed key
  }

  if(currentATMState === ATMState.EnteringPin){
    enterPin(pressedKey);
  } 
}
);
//add funtionality to screen keys depending on screen state
leftScreenButtons?.addEventListener('click',(e) => {
  if (e.target){
    const targetId = (e.target as HTMLDivElement).id;
  
    //Main Menu
    if(currentATMState === ATMState.Menu){
      if(targetId === 'screen-button2' ){
        setATMState(ATMState.Withdrawing);
      }
      else if(targetId === 'screen-button4'){
        setATMState(ATMState.RemoveCard);

      }
    }
    //Withdraw money
    else if(currentATMState === ATMState.Withdrawing){
      if( targetId === 'screen-button1' ||
          targetId === 'screen-button2' ||
          targetId === 'screen-button3'
        ){

        let index = extractValueOptions(targetId) - 1;
        selectedAmount = leftScreenButtonOptions['Withdrawing']?.[index] ?? '';
        setATMState(ATMState.WithdrawingConfirm);
        
      }
    }
    else if(currentATMState === ATMState.WithdrawingConfirm){
      if( targetId === 'screen-button4'){
        setATMState(ATMState.WithdrawingMoney);
      }
    }
  }
})

rightScreenButtons?.addEventListener('click',(e) => {
      if(e.target){
        const targetId = (e.target as HTMLDivElement).id;
          //Withdraw money
        if(currentATMState === ATMState.Withdrawing){
          if( targetId === 'screen-button5' ||
              targetId === 'screen-button6'
            ){
    
            let index = extractValueOptions(targetId) - 5;
            selectedAmount = rightScreenButtonOptions['Withdrawing']?.[index] ?? '';
            setATMState(ATMState.WithdrawingConfirm);
            
          }
          //go back to main menu
          else if(targetId === 'screen-button8'){
            setATMState(ATMState.Menu);
          }
        }
        else if(currentATMState === ATMState.WithdrawingConfirm){
          if( targetId === 'screen-button4'){
            setATMState(ATMState.WithdrawingConfirm);
            console.log('Loading...');
        }
    
        }

      }
     

})

// main screen flow
onATMStateChange((state) => {
  //show start screen
  if(state === ATMState.WaitingForCard){
    atmScreen.className = '';
    atmScreen.classList.add('start-screen');
    welcome();
  }
  //enter pin
  else if (state === ATMState.EnteringPin){
    atmScreen.className = '';
    atmScreen.classList.add('enter-pin');
    showPinlines();
  }
  //show menu options
  else if(state === ATMState.Menu){
    atmScreen.className = '';
    atmScreen.classList.add('show-options');
    showOptions('Menu');
  }
  //Withdraw money
  else if(state === ATMState.Withdrawing){
    atmScreen.className = '';
    atmScreen.classList.add('show-options');
    showOptions('Withdrawing');
  }
  else if(state === ATMState.WithdrawingConfirm){
    atmScreen.className = '';
    atmScreen.classList.add('show-options');
    showOptions('WithdrawingConfirm');
    showMessage(`Are you sure you want to withdraw ${selectedAmount}?`, 'confirm-text');
  }
  else if (state === ATMState.WithdrawingMoney){
    atmScreen.className = '';
    showMessage('Withdrawing money...','loading-text');
    setTimeout(() => {
      const result = myATM.withdraw(2000, myAccount);
    
      if (result.success) {
        openMoneySlot();
        textToDisplay = result.status;
    
        const newBills = document.getElementById('new-bills');
        setATMState(ATMState.SuccessfulOperation);
    
        newBills?.addEventListener('click', () => {
          closeMoneySlot();
          setATMState(ATMState.RemoveCard);
        });
      } else {
        textToDisplay = result.status;
        setATMState(ATMState.FailedOperation);
      }
    }, 5000);
    
  }
  else if (state === ATMState.SuccessfulOperation){
    atmScreen.className = '';
    atmScreen.classList.add('show-options');
    showOptions('SuccessfulOperation');
    showMessage(textToDisplay, 'sucess-text');
  }
  else if (state === ATMState.FailedOperation){
    atmScreen.className = '';
    atmScreen.classList.add('show-options');
    showOptions('FailedOperation');
    showMessage(textToDisplay, 'error-text');
    setTimeout(()=>{
      setATMState(ATMState.Menu);
    },5000);
  }
  else if(state === ATMState.RemoveCard){
    atmScreen.className = '';
    showMessage('Thank you! Please remove your card', 'sucess-text');
  }
})

//show Pin Lines
const showPinlines = () => {
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
      <p class="pin-instruction">Enter your 4-digit PIN, then press OK</p>
    `;
}
//welcome message
const welcome = () => {
    const welcomeLogo = document.createElement('img');
    const startMessage = document.createElement('h1');
    welcomeLogo.src = '/assets/logo.png';
    welcomeLogo.id = 'welcome-logo';
    startMessage.classList.add('atm-title');
    startMessage.textContent = 'Insert card';
  
    atmScreen.append(welcomeLogo);
    atmScreen.append(startMessage);
}
//check pin
const enterPin = (num : string) => {
  if (isNaN(Number(num))){
    if(num === 'clear'){
      enteredPin = '';
      clearPin();
    }
    else if(num === 'cancel'){
      enteredPin = '';
      clearPin();
      setATMState(ATMState.WaitingForCard);
    }
    return
  }
  //insert asterisks
  if (enteredPin.length < 4){
    let insertSpot = enteredPin.length;
    enteredPin += num;
    console.log(enteredPin);
    const pinLines = document.getElementById('pin-lines');
    if (pinLines){
      pinLines.children[insertSpot].children[0].innerHTML = '*';
    }
  }
//check pin
  if (enteredPin.length === 4){
    keypad?.addEventListener('click', (event) =>{
      const targetId = (event.target as HTMLDivElement).id
      
      if(targetId === 'keypad-ok-button'){
        let isCorrect = myATM.checkPin(enteredPin,myAccount);
        if (isCorrect){
          setTimeout(()=>{console.log('That is correct');setATMState(ATMState.Menu);enteredPin = '';},1000);
        }
        else{
          setTimeout(()=>{console.log("WRONG PING MY GUY");clearPin();enteredPin = '';},1000)
        }
      }
    })
  }
}
//show screen options depending on Atm state
const showOptions = (key : ATMMenuKey) => {

    leftScreenButtonOptions[key]?.forEach((text,index)=>{
      let option = document.createElement('div');
      option.classList.add('screen-option');
      option.id = 'screen-option' + (index + 1);
      if(text !== ''){
        option.textContent = text;
      }
      else{
        option.classList.add('no-show');
      }
      atmScreen.appendChild(option);
    })
    rightScreenButtonOptions[key]?.forEach((text,index)=>{
      let option = document.createElement('div')
      option.classList.add('screen-option');
      option.id = 'screen-option' + (index + 4 + 1);
      if(text !== ''){
        option.textContent = text;
      }
      else{
        option.classList.add('no-show');
        option.style.pointerEvents = 'none'; 
      }
      atmScreen.appendChild(option);
    })
}
//Generic message
const showMessage = (text : string, id : string) => {
  let message = document.createElement('p');
  message.id = id
  message.textContent = text;
  atmScreen.appendChild(message);

}
//open money slot to withdraw money
const openMoneySlot = () => {
  const newBill = document.createElement('img');
  const moneySlot = document.getElementById('atm-img-money-slot');
  const moneySlotBody = document.getElementById('atm-img-money-slot-body');
  newBill.src = '/assets/new-bills.png'; 
  newBill.alt = 'Cash bill';       
  newBill.id = 'new-bills';
  atmBody?.appendChild(newBill);
  if (moneySlot && moneySlotBody){
    moneySlot.classList.add('open');
    moneySlotBody.classList.add('open');
  }
}
//close money slot after withdrawing money
const closeMoneySlot = () => {

  const newBill = document.getElementById('new-bills');
  const moneySlot = document.getElementById('atm-img-money-slot');
  const moneySlotBody = document.getElementById('atm-img-money-slot-body');
  if (moneySlot && moneySlotBody){
    moneySlot.classList.remove('open');
    moneySlotBody.classList.remove('open');
  }
  newBill?.remove();

}



