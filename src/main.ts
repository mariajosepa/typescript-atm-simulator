import '../src/styles/main.css'
import "../src/styles/screens.css"
import '../src/styles/cards.css'
import '../src/styles/money.css'
import './dragAndDrop'
import { depositState } from './state/depositState';
import { ATM } from './atm'
import { ATMState, onATMStateChange, setATMState, currentATMState } from './state/atmState'
import { clearPin, extractValueOptions } from './util'
import { Account } from './account'


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
let autoClose : boolean = false;

type ATMMenuKey = keyof typeof ATMState;
const leftScreenButtonOptions : Partial<Record<ATMMenuKey, string[]>> = {
  Menu : ['View Balance','Withdraw','Deposit','Exit'],
  Withdrawing : ['$20', '$40', '$60', ''],
  WithdrawingConfirm : ['','','','yes'],
  DepositingConfirm : ['','','','yes']

}
const rightScreenButtonOptions : Partial<Record<ATMMenuKey, string[]>> = {
  Menu : ['','','',''],
  Withdrawing : ['$100', '$200', 'other', 'back'],
  WithdrawingConfirm : ['','','','cancel'],
  DepositingConfirm : ['','','','cancel']
}

const myATM = new ATM(10000,10000,10000);
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
    //enter pin
    enterPin(pressedKey);
    //check pin
    if (enteredPin.length === 4){

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
    }
    
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
        console.log('switching to withdrawing');
        setATMState(ATMState.Withdrawing);

      }
      else if(targetId === 'screen-button3'){
        setATMState(ATMState.Depositing);

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
    else if(currentATMState === ATMState.DepositingConfirm){
      if( targetId === 'screen-button4'){
        setATMState(ATMState.DepositingMoney);
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
            setTimeout(() => {
              setATMState(ATMState.WithdrawingConfirm);
            }, 0);
            //setATMState(ATMState.WithdrawingConfirm);
            
          }
          //go back to main menu
          else if(targetId === 'screen-button8'){
            setATMState(ATMState.Menu);
          }
        }
        else if(currentATMState === ATMState.WithdrawingConfirm){
          if( targetId === 'screen-button8'){
            setATMState(ATMState.Withdrawing);
          }
        }
        else if(currentATMState === ATMState.DepositingConfirm){
          if( targetId === 'screen-button8'){
            setATMState(ATMState.FailedDeposit);
          }
        }

      }
     

})
atmBody?.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.id === 'new-bills') {
    closeMoneySlot();
    setATMState(ATMState.RemoveCard);
  }
});

// main screen flow
onATMStateChange((state) => {
  //show start screen
  if(state === ATMState.WaitingForCard){
    atmScreen.className = '';
    atmScreen.innerHTML = '';
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
    atmScreen.classList.add('show-options');
    showOptions('Menu');
  }
  //Withdraw money
  else if(state === ATMState.Withdrawing){
    atmScreen.classList.add('show-options');
    showOptions('Withdrawing');
  }
  else if(state === ATMState.WithdrawingConfirm){
     atmScreen.classList.add('show-options');
     showOptions('WithdrawingConfirm');
     showMessage(`Are you sure you want to withdraw ${selectedAmount}?`, 'confirm-text');
  }
  else if (state === ATMState.WithdrawingMoney){
    showMessage('Withdrawing money...','loading-text');
    setTimeout(() => {
      const result = myATM.withdraw(2000, myAccount);
      autoClose = false; // we don't remove card until user removes card
      if (result.success) {
        openMoneySlotWithdraw();
        textToDisplay = result.status;
        setATMState(ATMState.SuccessfulOperation);
      } else {
        textToDisplay = result.status;
        setATMState(ATMState.FailedOperation);
      }
    }, 5000);
    
  }
  else if(state === ATMState.Depositing){
    showMessage('Deposit your money in the slot','confirm-text');
    openMoneySlotDeposit();
  }
  else if(state === ATMState.DepositingProcessing){
    showMessage('Counting Money...','loading-text');
    setTimeout(()=>{
      setATMState(ATMState.DepositingConfirm);
    },3000);
  }
  else if(state === ATMState.DepositingConfirm){
    atmScreen.classList.add('show-options');
    closeMoneySlotDeposit();
    showOptions('DepositingConfirm');
    showMessage(`Are you sure you want to deposit $${depositState.amount}`,'confirm-text');
  }
  else if(state === ATMState.DepositingMoney){
    showMessage('Depositing money...','loading-text');
    setTimeout(() => {
      const result = myATM.deposit(parseInt(depositState.amount), myAccount);
      autoClose = true;
      if (result.success) {
        textToDisplay = result.status;
        setATMState(ATMState.SuccessfulOperation);
      } else {
        textToDisplay = result.status;
        setATMState(ATMState.FailedOperation);
      }
    }, 5000);

  }
  else if(state === ATMState.FailedDeposit){
    showMessage('Cancelling deposit...', 'error-text');
    setTimeout(() => {
      atmScreen.innerHTML = '';
      showMessage('Deposit cancelled, please collect your money', 'confirm-text');
       openMoneySlotWithdraw();
    }, 3000);

  }
  else if (state === ATMState.SuccessfulOperation){
    showMessage(textToDisplay, 'sucess-text');
    if (autoClose){
      setTimeout(()=>{
        setATMState(ATMState.RemoveCard)
      },2000)
    }
  }
  else if (state === ATMState.FailedOperation){
    atmScreen.classList.add('show-options');
    showOptions('FailedOperation');
    showMessage(textToDisplay, 'error-text');
    if (autoClose){
      setTimeout(()=>{
        setATMState(ATMState.RemoveCard)
      },2000)
    }
  }
  else if(state === ATMState.RemoveCard){
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
  console.log('Hey guys');
    const welcomeLogo = document.createElement('img');
    const startMessage = document.createElement('h1');
    welcomeLogo.src = '/assets/logo.png';
    welcomeLogo.id = 'welcome-logo';
    startMessage.classList.add('atm-title');
    startMessage.textContent = 'Insert card';
  
    atmScreen.append(welcomeLogo);
    atmScreen.append(startMessage);
}
//enter pin
const enterPin = (num : string) => {
  if (isNaN(Number(num))){
    if(num === 'clear'){
      enteredPin = '';
      clearPin();
    }
    else if(num === 'cancel'){
      enteredPin = '';
      clearPin();
      setATMState(ATMState.RemoveCard);
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
const openMoneySlotWithdraw = () => {
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

const openMoneySlotDeposit = () => {
  const moneySlot = document.getElementById('atm-img-money-slot');
  const moneySlotBody = document.getElementById('atm-img-money-slot-body');
  if (moneySlot && moneySlotBody){
    moneySlot.classList.add('open');
    moneySlotBody.classList.add('open');
  }
}

const closeMoneySlotDeposit = () => {
  const moneySlot = document.getElementById('atm-img-money-slot');
  const moneySlotBody = document.getElementById('atm-img-money-slot-body');
  if (moneySlot && moneySlotBody){
    moneySlot.classList.remove('open');
    moneySlotBody.classList.remove('open');
  }
}


