'use client';

import { useMemo, useState } from 'react';
import { CreditCard, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { lookups } from '@/lib/api';

const getCardInfo = (type) => {
  switch (type.toLowerCase()) {
    case 'visa':
      return { logo: '💳', color: 'bg-blue-600' };
    case 'mastercard':
      return { logo: '🔴', color: 'bg-red-600' };
    case 'amex':
    case 'americanexpress':
      return { logo: '💎', color: 'bg-green-600' };
    case 'discover':
      return { logo: '🔍', color: 'bg-orange-600' };
    case 'jcb':
      return { logo: '🏯', color: 'bg-purple-600' };
    case 'dinersclub':
      return { logo: '🍽️', color: 'bg-gray-600' };
    case 'unionpay':
      return { logo: '🇨🇳', color: 'bg-indigo-600' };
    default:
      return { logo: '❓', color: 'bg-gray-500' };
  }
};

export default function BinLookup() {
  const [cardNumber, setCardNumber] = useState('');
  const [cardInfo, setCardInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cardStyles = useMemo(
    () => getCardInfo(cardInfo?.scheme ?? ''),
    [cardInfo]
  );

  const handleClear = () => {
    setCardNumber('');
    setCardInfo(null);
    setError('');
  };

  const handleCardNumberChange = (e) => {
    setCardInfo(null);
    setError('');
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    if (value.replace(/\s/g, '').length <= 19) {
      setCardNumber(value);
      setError('');
    }
  };

  const handleLookup = async () => {
    if (!cardNumber.trim()) {
      setError('Please enter a card number');
      return;
    }

    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 4) {
      setError('Card number must be at least 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const info = await lookups.lookup(cardNumber);
      console.log('Card lookup result:', info);
      setCardInfo(info);
    } catch (err) {
      console.error('Lookup failed:', err);
      setError('Failed to lookup card info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-10 px-12">
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Card Lookup Form */}
      <div className="max-w-2xl">
        <div className="mb-8">
          <h2 className="text-white text-xl font-semibold mb-2">
            Card Company Lookup
          </h2>
          <p className="text-gray-400 text-sm">
            Enter a credit card number to identify the card company and type.
          </p>
        </div>

        <div className="space-y-6">
          {/* Card Number Input */}
          <div>
            <Label
              htmlFor="cardNumber"
              className="text-gray-300 text-sm mb-3 block"
            >
              Card Number
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
                onClick={handleLookup}
                disabled={loading || !cardNumber.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{loading ? 'Looking up...' : 'Lookup'}</span>
              </Button>
            </div>
          </div>

          {/* Clear Button */}
          {(cardNumber || cardInfo) && (
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

          {/* Card Information Display */}
          {cardInfo && (
            <div className={`rounded-xl p-6 text-white ${cardStyles.color}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">{cardStyles?.logo}</div>
                <div>
                  <h3 className="text-xl font-bold">{cardInfo?.brand}</h3>
                  <p className="text-white/90 font-medium">{cardInfo?.type}</p>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">About this card:</h4>
                <p className="text-sm text-white/90 leading-relaxed">
                  {cardInfo?.bank?.name}
                </p>
                <p className="text-sm text-white/90 leading-relaxed">
                  {cardInfo?.country?.name} {cardInfo?.country?.emoji}
                </p>
              </div>

              <div className="mt-4 bg-white/10 rounded-lg p-3">
                <div className="text-sm">
                  <strong>Card Number:</strong> {cardNumber}
                </div>
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          {!cardInfo && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                How to use
              </h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Enter the first 4-6 digits of any credit card number</li>
                <li>• The system will identify the card company and type</li>
                <li>
                  • Supports Visa, Mastercard, American Express, Discover, JCB,
                  Diners Club, and UnionPay
                </li>
                <li>• No card information is stored or transmitted</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
