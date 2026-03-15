'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft, Edit } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, ColoredSelect } from '../ui/Select';
import Sidebar from '../sidebar';
import Header from '../header';
import { clients } from '@/lib/api';

export default function ViewClient({ clientId }) {
  console.log('clientId:', clientId);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientData, setClientData] = useState(null);

  const bankOptions = [
    {
      value: 'chase',
      label: 'Chase Bank',
      logo: 'C',
      logoColor: 'bg-blue-800',
    },
    {
      value: 'bofa',
      label: 'Bank of America',
      logo: 'B',
      logoColor: 'bg-red-600',
    },
    {
      value: 'wells',
      label: 'Wells Fargo',
      logo: 'WF',
      logoColor: 'bg-orange-600',
    },
    { value: 'citi', label: 'Citibank', logo: 'C', logoColor: 'bg-blue-600' },
    {
      value: 'mixed',
      label: 'Mixed Banks',
      logo: 'M',
      logoColor: 'bg-gray-600',
    },
  ];

  const statusOptions = [
    { value: 'paid-wire', label: 'Paid Wire Transfer' },
    { value: 'pending', label: 'Pending' },
    { value: 'followup', label: 'Followup' },
    { value: 'deactivated', label: 'Deactivated' },
  ];

  // Function to detect card type from card number
  const getCardType = (cardNumber) => {
    if (!cardNumber) return 'VISA';

    // Remove spaces and get just the digits
    const number = cardNumber.replace(/\s/g, '');

    // Card type detection based on starting digits
    if (number.startsWith('4')) {
      return 'VISA';
    } else if (
      number.startsWith('5') ||
      (number.startsWith('2') &&
        number.length >= 2 &&
        parseInt(number.substring(0, 2)) >= 22 &&
        parseInt(number.substring(0, 2)) <= 27)
    ) {
      return 'MASTERCARD';
    } else if (number.startsWith('34') || number.startsWith('37')) {
      return 'AMEX';
    } else if (
      number.startsWith('6011') ||
      number.startsWith('65') ||
      number.startsWith('644') ||
      number.startsWith('645') ||
      number.startsWith('646') ||
      number.startsWith('647') ||
      number.startsWith('648') ||
      number.startsWith('649')
    ) {
      return 'DISCOVER';
    } else if (number.length > 0) {
      return 'UNKNOWN';
    }
    return 'VISA'; // Default
  };

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clients.getById(clientId);

      console.log('Client response:', response);
      if (response.success) {
        setClientData(response.data.client); // Fix: access the nested client object
      } else {
        setError('Failed to fetch client details');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch client details');
      console.error('Fetch client error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBankLabel = (bankValue) => {
    const bank = bankOptions.find((b) => b.value === bankValue);
    return bank ? bank.label : bankValue;
  };

  const getStatusLabel = (statusValue) => {
    const status = statusOptions.find((s) => s.value === statusValue);
    return status ? status.label : statusValue;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid-wire':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-400 text-gray-800';
      case 'followup':
        return 'bg-blue-500 text-white';
      case 'deactivated':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading client details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <Button
            onClick={() => router.push('/clients')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Client not found</div>
      </div>
    );
  }

  // Ensure cards is an array (backward compatibility)
  const cards = Array.isArray(clientData.cards)
    ? clientData.cards
    : clientData.cardDetails
    ? [clientData.cardDetails]
    : [];

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar Component */}
      <Sidebar activeTab="Clients" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Component */}
        <Header
          title={`${clientData.firstName} ${clientData.lastName}`}
          icon={Users}
        />

        {/* Main Content Area */}
        <div className="flex-1 p-8 px-10">
          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={() => router.push('/clients')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Clients</span>
            </Button>

            <Button
              onClick={() => router.push(`/add-client?id=${clientId}`)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Client</span>
            </Button>
          </div>

          <div className="flex w-full gap-[5%] justify-between">
            {/* Left Column - Client Information */}
            <div className="w-[60%]">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <div className="grid grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        First Name
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.firstName || '-'}
                      </div>
                    </div>

                    {/* Last Name */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Last Name
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.lastName || '-'}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Email
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.email || '-'}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Phone
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.phone || '-'}
                      </div>
                    </div>

                    {/* Cell */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Cell
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.cell || '-'}
                      </div>
                    </div>

                    {/* SSN */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        SSN
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.ssn || '-'}
                      </div>
                    </div>

                    {/* DOB */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        DOB
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.dob || '-'}
                      </div>
                    </div>

                    {/* MMN */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        MMN
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.mmn || '-'}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Address
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.address || '-'}
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        City
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.city || '-'}
                      </div>
                    </div>

                    {/* State */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        State
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.state || '-'}
                      </div>
                    </div>

                    {/* ZIP Code */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        ZIP Code
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.zipCode || '-'}
                      </div>
                    </div>

                    {/* Routing Number */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Routing No.
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.routingNumber || '-'}
                      </div>
                    </div>

                    {/* Account Number */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Account No.
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.accountNumber || '-'}
                      </div>
                    </div>

                    {/* DL Number */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        DL NO.
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.dlNumber || '-'}
                      </div>
                    </div>

                    {/* Class */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Class
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.dlClass || '-'}
                      </div>
                    </div>

                    {/* Issue Date */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Issue Date
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.issueDate || '-'}
                      </div>
                    </div>

                    {/* Exp Date */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Exp Date
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.expDate || '-'}
                      </div>
                    </div>

                    {/* Eye Color */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Eye Color
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.eyeColor || '-'}
                      </div>
                    </div>

                    {/* Height */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Height
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.height || '-'}
                      </div>
                    </div>

                    {/* Bank */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Bank
                      </Label>
                      <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                        {clientData.bank ? getBankLabel(clientData.bank) : '-'}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Status
                      </Label>
                      <div
                        className={`${getStatusColor(
                          clientData.status
                        )} h-10 rounded-lg w-full px-3 flex items-center font-medium`}
                      >
                        {clientData.status
                          ? getStatusLabel(clientData.status)
                          : '-'}
                      </div>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="mt-6">
                    <Label className="text-gray-300 text-sm mb-2 block">
                      Created Date
                    </Label>
                    <div className="bg-gray-800 border border-gray-600 text-white h-10 rounded-lg w-full px-3 flex items-center">
                      {new Date(clientData.createdAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Cards and Notes */}
            <div className="w-[30%] space-y-6 flex flex-col">
              {/* Credit Cards */}
              {cards.length > 0 ? (
                cards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white"
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="text-md font-semibold">
                          {card.cardHolderName || 'Card Holder'}
                        </div>
                      </div>
                      <div className="text-lg font-bold">
                        {getCardType(card.cardNumber)}
                      </div>
                    </div>
                    <div className="text-xl font-mono tracking-wider mb-6">
                      {card.cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>Exp {card.expiryDate || 'MM/YYYY'}</div>
                      <div>CVV: {card.cvv ? '•••' : '•••'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-800 rounded-xl p-6 text-center">
                  <div className="text-gray-400">
                    No card information available
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="bg-gray-800 rounded-lg p-4 grow">
                <Label className="text-gray-300 text-sm mb-2 block">
                  Notes
                </Label>
                <div className="text-gray-300 text-sm leading-relaxed min-h-[60px]">
                  {clientData.notes || 'No notes available'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
