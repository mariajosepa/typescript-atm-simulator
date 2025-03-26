import {ATMState, setATMState, currentATMState} from './state/atmState'
import { parseMoneyValue } from './util'
import { depositState } from './state/depositState';
const cardDebit = document.getElementById('debit');
const cardSlotBody = document.getElementById('atm-img-card-slot-body');
const cardSlot = document.getElementById('atm-img-card-slot');
const bill100 = document.getElementById('bill100');
const bill300 = document.getElementById('bill300');
const bill1000 = document.getElementById('bill1000');
const billSlotBody = document.getElementById('atm-img-money-slot-body');
const atmContainer = document.getElementById('atm-container');


cardDebit?.addEventListener('dragstart', (e) => {
  e.dataTransfer?.setData('text/plain', (e.target as HTMLElement).id);
});
bill100?.addEventListener('dragstart', (e) => {
  e.dataTransfer?.setData('text/plain', (e.target as HTMLElement).id);
});
bill300?.addEventListener('dragstart', (e) => {
  e.dataTransfer?.setData('text/plain', (e.target as HTMLElement).id);
});
bill1000?.addEventListener('dragstart', (e) => {
  e.dataTransfer?.setData('text/plain', (e.target as HTMLElement).id);
});

//card drag and drop

atmContainer?.addEventListener('dragover', (e) => {
  e.preventDefault();
});

billSlotBody?.addEventListener('dragover',(e)=>{
  e.preventDefault();
})

atmContainer?.addEventListener('drop', (e) => {
  e.preventDefault();

  const draggedId = e.dataTransfer?.getData('text/plain');
  const dropTarget = e.target as HTMLElement;

  if (currentATMState === ATMState.RemoveCard){
   
    // If not dropped in the slot zone
    if (cardDebit && 
      !cardSlotBody?.contains(dropTarget) && 
      draggedId === 'debit'){
      // Move the card back to its original position
      atmContainer.appendChild(cardDebit);
      cardDebit.classList.remove('card-transform');
      setATMState(ATMState.WaitingForCard);
    }
  }
  else if(currentATMState === ATMState.WaitingForCard){
    //If card is dragged to drop zone, insert it
    if (cardSlotBody?.contains(dropTarget) && draggedId === 'debit'){
      cardSlot?.prepend(cardDebit as HTMLImageElement);
      cardDebit?.classList.add('card-transform');
      setATMState(ATMState.EnteringPin);
    }
  }
});

billSlotBody?.addEventListener('drop', (e)=>{

  const draggedId = e.dataTransfer?.getData('text/plain');
  const dropTarget = e.target as HTMLElement;

  e.preventDefault();

  if (currentATMState === ATMState.Depositing){

    let isValidDrag = draggedId === 'bill100' || 'bill300' || 'bill1000';

    if (billSlotBody?.contains(dropTarget) && isValidDrag && draggedId){
      depositState.amount = parseMoneyValue(draggedId).toString();
      setATMState(ATMState.DepositingConfirm);

    }

  }

})