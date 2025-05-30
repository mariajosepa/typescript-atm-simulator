import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173/';

async function enterPin(page: Page, pin: string) {
  for (const digit of pin) {
    await page.locator(`#keypad-button${digit}`).click();
  }
  await page.locator('#keypad-ok-button').click();
}

test.describe('ATM Login Scenarios', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('TC-ATM-001 - Login con PIN correcto', async ({ page }) => {
    await page.locator('#debit').dragTo(page.locator('#atm-img-card-slot-body'));
    await enterPin(page, '1234');
    await expect(page.locator('#screen-option1')).toHaveText('View Balance');
  });

  test('TC-ATM-002 - PIN incorrecto', async ({ page }) => {
    await page.locator('#debit').dragTo(page.locator('#atm-img-card-slot-body'));
    await enterPin(page, '1654');
    await expect(page.locator('.pin-instruction')).toHaveText(/Enter your 4-digit PIN/);
  });

  test('TC-ATM-005 - PIN vacío', async ({ page }) => {
    await page.locator('#debit').dragTo(page.locator('#atm-img-card-slot-body'));
    await page.locator('#keypad-ok-button').click();
    await expect(page.locator('.pin-instruction')).toHaveText(/Enter your 4-digit PIN/);
  });

  test('TC-ATM-006 - Bloqueo tras 3 intentos fallidos', async ({ page }) => {
    await page.locator('#debit').dragTo(page.locator('#atm-img-card-slot-body'));
    for (let i = 0; i < 3; i++) {
      await enterPin(page, '9999');
    }
    await expect(page.locator('#atm-screen')).toContainText(/blocked|contact|bloqueada/i);
  });

  test('TC-ATM-007 - PIN con letras (no numérico)', async ({ page }) => {
    await page.locator('#debit').dragTo(page.locator('#atm-img-card-slot-body'));
    await page.keyboard.type('abcd');
    await page.locator('#keypad-ok-button').click();
    await expect(page.locator('.pin-instruction')).toHaveText(/Enter your 4-digit PIN/);
  });

 // <-- Cierra el bloque de test.describe

test('TC-ATM-003 - Tarjeta inválida', async ({ page }) => {
  // Inyectamos cuenta nula antes de cargar la app
  await page.addInitScript(() => {
    // @ts-ignore
    window.__account__ = null;
  });
  await page.goto(BASE_URL);

  // Verificamos que la pantalla indique error de tarjeta inválida
  await expect(page.locator('#atm-screen'))
    .toContainText(/invalid|error|tarjeta inválida|insert card/i);
});

test('TC-ATM-004 - PIN correcto con tarjeta inválida', async ({ page }) => {
  // Igual: cuenta nula desde el arranque
  await page.addInitScript(() => {
    // @ts-ignore
    window.__account__ = null;
  });
  await page.goto(BASE_URL);

  // Intentamos ingresar PIN aunque no haya tarjeta
  await enterPin(page, '1234');

  // La pantalla vuelve a pedir “Insert card”
  await expect(page.locator('#atm-screen'))
    .toContainText(/insert card|invalid|error|tarjeta inválida/i);
});

});
