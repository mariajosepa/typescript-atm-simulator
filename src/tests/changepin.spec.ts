import { test } from '@playwright/test';
import { setupATM, login, waitForText, changePin } from './utils';

test.describe('ATM Change PIN Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await setupATM(page);
    await login(page, '1234');
  });

  test('TC-PIN-01 - Cambio de PIN exitoso', async ({ page }) => {
    await changePin(page, '5678', '5678');
    await waitForText(page, /pin updated|thank you|successfully/i); // Depende de tu lógica final
  });

  test('TC-PIN-02 - PIN con longitud inválida', async ({ page }) => {
    await page.locator('#screen-button5').click();
    await page.locator('#keypad-button1').click();
    await page.locator('#keypad-button2').click(); // Solo 2 dígitos
    await page.locator('#keypad-ok-button').click();
    await waitForText(page, /enter your 4-digit PIN/i);
  });

  test('TC-PIN-03 - PIN vacío', async ({ page }) => {
    await page.locator('#screen-button5').click();
    await page.locator('#keypad-ok-button').click(); // No se ingresa nada
    await waitForText(page, /enter your 4-digit PIN/i);
  });

  test('TC-PIN-04 - PIN con letras o símbolos', async ({ page }) => {
    await page.locator('#screen-button5').click();
    await page.keyboard.type('12a!'); // No debería ingresar nada
    await page.locator('#keypad-ok-button').click();
    await waitForText(page, /enter your 4-digit PIN/i);
  });

  test('TC-PIN-05 - Confirmación no coincide', async ({ page }) => {
    await changePin(page, '5678', '8765');
    await waitForText(page, /do not match|enter your 4-digit PIN/i);
  });

  test('TC-PIN-06 - Mismo PIN actual', async ({ page }) => {
    await changePin(page, '1234', '1234');
    await waitForText(page, /must be different|enter your 4-digit PIN/i);
  });

  test('TC-PIN-07 - PIN con espacios en blanco', async ({ page }) => {
    await page.locator('#screen-button5').click();
    await page.keyboard.type('12 4');
    await page.locator('#keypad-ok-button').click();
    await waitForText(page, /enter your 4-digit PIN/i);
  });

  test('TC-PIN-08 - PIN con más de 4 dígitos', async ({ page }) => {
    await page.locator('#screen-button5').click();
    await page.keyboard.type('12345');
    await page.locator('#keypad-ok-button').click();
    await waitForText(page, /enter your 4-digit PIN/i);
  });
});
