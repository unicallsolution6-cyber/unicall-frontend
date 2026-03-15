'use client';

import { useState } from 'react';
import { CreditCard, Search, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

export default function DNSChecker() {
  const [cardNumber, setCardNumber] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState('');

  const handleClear = () => {
    setCardNumber('');
    setValidationResult(null);
    setError('');
  };

  const handleCardNumberChange = (e) => {
    setValidationResult(null);
    setError('');
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    if (value.replace(/\s/g, '').length <= 19) {
      setCardNumber(value);
    }
  };

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\D/g, '');

    if (!cleanNumber) {
      return { valid: false, message: 'Card number is empty' };
    }

    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return {
        valid: false,
        message: 'Card number must be between 13 and 19 digits',
      };
    }

    let sum = 0;
    let shouldDouble = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    const isValid = sum % 10 === 0;
    return {
      valid: isValid,
      message: isValid ? 'Card number is valid' : 'Card number is invalid',
    };
  };

  const getCardType = (firstDigit) => {
    switch (firstDigit) {
      case '3':
        return 'American Express/Diners Club/JCB';
      case '4':
        return 'Visa';
      case '5':
        return 'Mastercard';
      case '6':
        return 'Discover';
      default:
        return 'Unknown';
    }
  };

  const handleValidate = () => {
    if (!cardNumber.trim()) {
      setError('Please enter a card number');
      return;
    }

    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 13) {
      setError('Card number must be at least 13 digits');
      return;
    }

    const validation = validateCardNumber(cardNumber);
    setValidationResult(validation);
  };

  return (
    <div className="flex-1 p-10 px-12">
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="max-w-2xl">
        <div className="mb-8">
          <h2 className="text-white text-xl font-semibold mb-2">
            Credit Card Validator
          </h2>
          <p className="text-gray-400 text-sm">
            Validate credit card numbers using Luhn algorithm (based on
            dnschecker.org)
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label
              htmlFor="cardNumber"
              className="text-gray-300 text-sm mb-3 block"
            >
              Credit Card Number
            </Label>
            <div className="flex gap-3">
              <Input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="bg-gray-900 border-none text-white placeholder-gray-500 h-12 rounded-lg flex-1 focus:ring-0 focus:outline-none font-mono text-lg tracking-wider"
                placeholder="1234 5678 9012 3456"
                maxLength="23"
              />
              <Button
                type="button"
                onClick={handleValidate}
                disabled={!cardNumber.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Validate</span>
              </Button>
            </div>
          </div>

          {(cardNumber || validationResult) && (
            <div>
              <Button
                type="button"
                onClick={handleClear}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm"
              >
                Clear
              </Button>
            </div>
          )}

          {validationResult && (
            <div
              className={`rounded-xl p-6 text-white ${
                validationResult.valid ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">
                  {validationResult.valid ? '✓' : '✗'}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {validationResult.valid ? 'Valid Card' : 'Invalid Card'}
                  </h3>
                  <p className="text-white/90 font-medium">
                    {validationResult.message}
                  </p>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Card Details:</h4>
                <p className="text-sm text-white/90 leading-relaxed">
                  <strong>Number:</strong> {cardNumber}
                </p>
                <p className="text-sm text-white/90 leading-relaxed">
                  <strong>Type:</strong> {getCardType(cardNumber[0])}
                </p>
                <p className="text-sm text-white/90 leading-relaxed">
                  <strong>Length:</strong>{' '}
                  {cardNumber.replace(/\s/g, '').length} digits
                </p>
              </div>
            </div>
          )}

          {!validationResult && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                About Credit Card Validation
              </h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Uses the Luhn algorithm (mod 10 check)</li>
                <li>• Validates card number structure and checksum</li>
                <li>• Identifies card type based on first digit</li>
                <li>• Supports Visa, Mastercard, Amex, Discover, etc.</li>
                <li>• No card information is stored or logged</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
