export enum ATMState {
  WaitingForCard,
  EnteringPin,
  Menu,
  ViewingBalance,
  Withdrawing,
  WithdrawingConfirm,
  WithdrawingMoney,
  SuccessfulOperation,
  FailedOperation,
  RemoveCard,
  Depositing,
  DepositingProcessing,
  DepositingConfirm,
  DepositingMoney,
  FailedDeposit,
  SessionEnded
}

export type ATMStateListener = (newState: ATMState) => void;
const listeners: ATMStateListener[] = [];

export function onATMStateChange(callback: ATMStateListener) {
  listeners.push(callback);
}

export function renderScreen(){
  const atmScreen = document.getElementById('atm-screen');
  if (atmScreen) {
    atmScreen.innerHTML = ''; // update content
    atmScreen.classList = '';

  }
  }
// Shared variable to hold the current state
export let currentATMState: ATMState = ATMState.WaitingForCard;

// Function to update state
export function setATMState(newState : ATMState) : void {
  renderScreen();
  currentATMState = newState;
  listeners.forEach(listener => listener(currentATMState));
  console.log("ATM state is now:", ATMState[currentATMState]);
}


