import { ATM } from '../atm';
import { Account } from '../account';

const atmConfig = {
  withdrawLimit: 1000,
  depositLimit: 1000,
  availableCash: 20000,
  minimumWithdraw: 20,
};

describe('Cambio de PIN - Tabla de decisión', () => {
  it('Debe permitir cambiar el PIN si es válido (5678)', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 5000);
    const result = atm.changePin('5678', cuenta);

    expect(result.success).toBe(true);
    expect(cuenta.pin).toBe('5678');
  });

  it('Debe rechazar un PIN con menos de 4 dígitos', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 5000);
    const result = atm.changePin('12', cuenta);

    expect(result.success).toBe(false);
    expect(cuenta.pin).toBe('1234');
  });

  it('Debe rechazar un PIN con letras o símbolos', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 5000);
    const result = atm.changePin('12a$', cuenta);

    expect(result.success).toBe(false);
    expect(cuenta.pin).toBe('1234');
  });

  it('Debe rechazar un PIN con más de 4 dígitos', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 5000);
    const result = atm.changePin('12345', cuenta);

    expect(result.success).toBe(false);
    expect(cuenta.pin).toBe('1234');
  });

  it('Debe rechazar un PIN con espacios en blanco', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 5000);
    const result = atm.changePin('12 4', cuenta);

    expect(result.success).toBe(false);
    expect(cuenta.pin).toBe('1234');
  });

  it('Debe rechazar un PIN vacío', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 5000);
    const result = atm.changePin('', cuenta);

    expect(result.success).toBe(false);
    expect(cuenta.pin).toBe('1234');
  });

  it('Debe rechazar si el nuevo PIN es igual al actual', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 5000);
    const result = atm.changePin('1234', cuenta);

    expect(result.success).toBe(false);
    expect(cuenta.pin).toBe('1234');
  });
});

describe('Simulación de validación de confirmación de PIN (flujo replicado)', () => {
  it('✅ Cambio de PIN exitoso si el PIN y la confirmación coinciden', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 1000);

    const chosenNewPin = '5678';
    const enteredNewPin = '5678';

    const pinConfirmed = chosenNewPin === enteredNewPin;
    const result = pinConfirmed ? atm.changePin(chosenNewPin, cuenta) : { success: false };

    expect(pinConfirmed).toBe(true);
    expect(result.success).toBe(true);
    expect(cuenta.pin).toBe('5678');
  });

  it('❌ Fallo al cambiar el PIN si la confirmación no coincide', () => {
    const atm = new ATM(atmConfig);
    const cuenta = new Account('1234', 1000);

    const chosenNewPin = '5678';
    const enteredNewPin = '0000';

    const pinConfirmed = chosenNewPin === enteredNewPin;
    const result = pinConfirmed ? atm.changePin(chosenNewPin, cuenta) : { success: false };

    expect(pinConfirmed).toBe(false);
    expect(result.success).toBe(false);
    expect(cuenta.pin).toBe('1234');
  });
});
