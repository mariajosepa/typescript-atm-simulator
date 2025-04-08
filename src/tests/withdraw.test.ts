import { ATM } from '../atm';
import { Account } from '../account';

const atmConfig = {
  withdrawLimit: 1000,
  depositLimit: 1000,
  availableCash: 20000,
  minimumWithdraw: 20,
};

describe('Withdraw - Casos de prueba funcionales', () => {
  test('TC1 - Rechazo por saldo insuficiente', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 100);
    const result = atm.withdraw(980, cuenta);

    expect(result.success).toBe(false);
    expect(result.status).toBe('You have insufficient funds');
  });

  test('TC2 - Rechazo por monto menor al mínimo permitido', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 200);
    const result = atm.withdraw(18, cuenta);

    expect(result.success).toBe(false);
    expect(result.status).toBe('Minimum withdrawal is $20');
  });

  test('TC3 - Rechazo por monto no múltiplo de 20', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 200);
    const result = atm.withdraw(21, cuenta);

    expect(result.success).toBe(false);
    expect(result.status).toBe('Value must be a multiple of $20');
  });

  test('TC4 - Rechazo por exceder el límite de retiro', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 5000);
    const result = atm.withdraw(1040, cuenta);

    expect(result.success).toBe(false);
    expect(result.status).toBe('You exceeded the withdraw limit');
  });

  test('TC5 - Retiro exitoso con monto válido', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 100);
    const result = atm.withdraw(40, cuenta);

    expect(result.success).toBe(true);
    expect(result.status).toBe('Money withdrawn! Please take your money');
    expect(cuenta.balance).toBe(60);
  });

  test('TC6 - Rechazo por falta de efectivo en el ATM', () => {
    const atm = new ATM({ ...atmConfig, availableCash: 0 });
    const cuenta = new Account('1234', 500);
    const result = atm.withdraw(40, cuenta);

    expect(result.success).toBe(false);
    expect(result.status).toBe('ATM has insufficient funds');
  });

  test('TC7 - Rechazo por múltiples condiciones inválidas (monto < mínimo y no múltiplo)', () => {
    const atm = new ATM({ ...atmConfig, availableCash: 0 });
    const cuenta = new Account('1234', 10);
    const result = atm.withdraw(17, cuenta);

    expect(result.success).toBe(false);
    expect(result.status).toBe('Value must be a multiple of $20'); // prioriza múltiplo antes que mínimo
  });

  test('TC8 - Retiro exitoso en el límite máximo permitido', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 2000);
    const result = atm.withdraw(1000, cuenta);

    expect(result.success).toBe(true);
    expect(result.status).toBe('Money withdrawn! Please take your money');
    expect(cuenta.balance).toBe(1000);
  });
});