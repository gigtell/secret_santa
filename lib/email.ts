function isAlphaNumericOrHyphen(value: string) {
  for (const character of value) {
    const isLowercaseLetter = character >= 'a' && character <= 'z';
    const isUppercaseLetter = character >= 'A' && character <= 'Z';
    const isDigit = character >= '0' && character <= '9';

    if (!isLowercaseLetter && !isUppercaseLetter && !isDigit && character !== '-') {
      return false;
    }
  }

  return true;
}

function isValidLocalPart(value: string) {
  const allowedSymbols = new Set([
    '!',
    '#',
    '$',
    '%',
    '&',
    "'",
    '*',
    '+',
    '/',
    '=',
    '?',
    '^',
    '_',
    '`',
    '{',
    '|',
    '}',
    '~',
    '.',
    '-',
  ]);

  for (const character of value) {
    const isLowercaseLetter = character >= 'a' && character <= 'z';
    const isUppercaseLetter = character >= 'A' && character <= 'Z';
    const isDigit = character >= '0' && character <= '9';

    if (!isLowercaseLetter && !isUppercaseLetter && !isDigit && !allowedSymbols.has(character)) {
      return false;
    }
  }

  return true;
}

export function isValidEmail(value: string) {
  if (!value || value.length > 254 || value.includes(' ')) {
    return false;
  }

  const parts = value.split('@');

  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  if (!localPart || !domain || localPart.length > 64) {
    return false;
  }

  const domainLabels = domain.split('.');

  if (domainLabels.length < 2) {
    return false;
  }

  if (!isValidLocalPart(localPart)) {
    return false;
  }

  return domainLabels.every(
    (label) =>
      Boolean(label) &&
      label.length <= 63 &&
      !label.startsWith('-') &&
      !label.endsWith('-') &&
      isAlphaNumericOrHyphen(label),
  );
}
