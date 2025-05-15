import { expect, Page } from '@playwright/test';

// Configura el cajero inicial: inserta tarjeta y espera a pantalla de PIN
export async function setupATM(page: Page) {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('#debit');
  await page.locator('#debit').dragTo(page.locator('#atm-img-card-slot-body'));
  await page.waitForSelector('.pin-instruction'); // Esperar que aparezca pantalla de PIN
}

// Hace login con un PIN dado
export async function login(page: Page, pin: string) {
  await page.locator('#debit').dragTo(page.locator('#atm-img-card-slot-body'));

  for (const digit of pin) {
    await page.locator(`#keypad-button${digit}`).click();
  }

  await page.locator('#keypad-ok-button').click();

  await expect(page.locator('#screen-option1')).toHaveText('View Balance', { timeout: 8000 });
}

// Espera a que aparezca un texto específico en el cajero
export async function waitForText(page: Page, regex: RegExp, timeout = 10000) {
  await expect(page.locator('#atm-screen')).toContainText(regex, { timeout });
}

// Realiza el proceso completo de cambio de PIN
export async function changePin(page: Page, newPin: string, confirmPin: string) {
  // Paso 1: Click en "Change PIN"
  await page.locator('#screen-button5').click();

  // Paso 2: Ingresar PIN actual (asumimos que siempre es '1234')
  for (const digit of '1234') {
    await page.locator(`#keypad-button${digit}`).click();
  }
  await page.locator('#keypad-ok-button').click();

  // Paso 3: Ingresar nuevo PIN
  await expect(page.locator('#custom-pin-input-message')).toBeVisible({ timeout: 10000 });

  for (const digit of newPin) {
    await page.locator(`#keypad-button${digit}`).click();
  }
  await page.locator('#keypad-ok-button').click();

  // Paso 4: Confirmar nuevo PIN
  await expect(page.locator('#custom-pin-input-message')).toBeVisible({ timeout: 10000 });

  for (const digit of confirmPin) {
    await page.locator(`#keypad-button${digit}`).click();
  }
  await page.locator('#keypad-ok-button').click();
}
