export async function getTestCards(country?: string): Promise<string> {
  const cards = allCards();

  if (country) {
    const c = country.toUpperCase();
    const filtered = cards.filter((card) => card.countries.includes(c));

    if (filtered.length === 0) {
      return `No test cards found for "${country}". Supported countries: KSA, UAE`;
    }

    return formatCards(filtered, c);
  }

  return formatCards(cards, 'All Countries');
}

function formatCards(cards: TestCard[], title: string): string {
  let output = `# Test Cards — ${title}\n\n`;

  output += '| Card Type | Number | Expiry | CVC | Brand | Scenario |\n';
  output += '|-----------|--------|--------|-----|-------|----------|\n';

  for (const card of cards) {
    output += `| ${card.type} | ${card.number} | ${card.expiry} | ${card.cvc} | ${card.brand} | ${card.scenario} |\n`;
  }

  output += '\n## Notes\n';
  output += '- Use these cards in the **Sandbox** environment only.\n';
  output += '- Tamara supports: VISA, MasterCard, MADA, AMEX.\n';
  output += '- For declined/failure scenarios, use the specific test phone numbers provided in the eligibility documentation.\n';

  return output;
}

interface TestCard {
  type: string;
  number: string;
  expiry: string;
  cvc: string;
  brand: string;
  scenario: string;
  countries: string[];
}

function allCards(): TestCard[] {
  return [
    { type: 'VISA', number: '4111 1111 1111 1111', expiry: '12/26', cvc: '123', brand: 'VISA', scenario: 'Successful payment', countries: ['KSA', 'UAE'] },
    { type: 'MasterCard', number: '5555 5555 5555 4444', expiry: '12/26', cvc: '123', brand: 'MasterCard', scenario: 'Successful payment', countries: ['KSA', 'UAE'] },
    { type: 'MADA', number: '5432 1000 0000 0000', expiry: '12/26', cvc: '123', brand: 'MADA', scenario: 'Successful payment (KSA)', countries: ['KSA'] },
    { type: 'AMEX', number: '3782 822463 10005', expiry: '12/26', cvc: '1234', brand: 'AMEX', scenario: 'Successful payment', countries: ['KSA', 'UAE'] },
    { type: 'VISA', number: '4012 0010 3848 3505', expiry: '12/26', cvc: '123', brand: 'VISA', scenario: '3DS authentication required', countries: ['KSA', 'UAE'] },
    { type: 'MasterCard', number: '5204 7425 2700 5907', expiry: '12/26', cvc: '123', brand: 'MasterCard', scenario: '3DS authentication required', countries: ['KSA', 'UAE'] },
    { type: 'VISA', number: '4000 0000 0000 0002', expiry: '12/26', cvc: '123', brand: 'VISA', scenario: 'Declined', countries: ['KSA', 'UAE'] },
    { type: 'MasterCard', number: '5111 1111 1111 1118', expiry: '12/26', cvc: '123', brand: 'MasterCard', scenario: 'Declined', countries: ['KSA', 'UAE'] },
    { type: 'VISA', number: '4000 0000 0000 0121', expiry: '12/26', cvc: '123', brand: 'VISA', scenario: 'Insufficient funds', countries: ['KSA', 'UAE'] },
    { type: 'MasterCard', number: '5105 1051 0510 5100', expiry: '12/26', cvc: '123', brand: 'MasterCard', scenario: 'Insufficient funds', countries: ['KSA', 'UAE'] },
  ];
}
