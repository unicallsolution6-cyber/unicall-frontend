'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, ColoredSelect } from '../ui/Select';
import Sidebar from '../sidebar';
import Header from '../header';
import { clients } from '@/lib/api';

export default function AddClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('id');
  const isEditMode = Boolean(clientId);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cell: '',
    ssn: '',
    dob: '',
    mmn: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    routingNumber: '',
    accountNumber: '',
    dlNumber: '',
    dlClass: '',
    issueDate: '',
    expDate: '',
    eyeColor: '',
    height: '',
    bank: 'chase',
    status: 'pending',
    // Notes (optional)
    notes:
      'I spoke with the client, and we had a brief discussion. The client said they will talk further tomorrow.',
  });

  // Separate state for cards array
  const [cards, setCards] = useState([
    {
      id: 1,
      cardHolderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardType: 'VISA',
    },
  ]);

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

  // Function to get status color based on status value
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid-wire':
        return { bg: 'bg-green-500', text: 'text-white' };
      case 'pending':
        return { bg: 'bg-yellow-400', text: 'text-gray-800' };
      case 'followup':
        return { bg: 'bg-blue-500', text: 'text-white' };
      case 'deactivated':
        return { bg: 'bg-red-500', text: 'text-white' };
      default:
        return { bg: 'bg-gray-500', text: 'text-white' };
    }
  };

  // Fetch client data if in edit mode
  useEffect(() => {
    if (isEditMode && clientId) {
      fetchClientData();
    }
  }, [isEditMode, clientId]);

  const fetchClientData = async () => {
    try {
      setInitialLoading(true);
      setError('');
      const response = await clients.getById(clientId);

      if (response.success) {
        const client = response.data.client;

        // Populate form data
        setFormData({
          firstName: client.firstName || '',
          lastName: client.lastName || '',
          email: client.email || '',
          phone: client.phone || '',
          cell: client.cell || '',
          ssn: client.ssn || '',
          dob: client.dob || '',
          mmn: client.mmn || '',
          address: client.address || '',
          city: client.city || '',
          state: client.state || '',
          zipCode: client.zipCode || '',
          routingNumber: client.routingNumber || '',
          accountNumber: client.accountNumber || '',
          dlNumber: client.dlNumber || '',
          dlClass: client.dlClass || '',
          issueDate: client.issueDate || '',
          expDate: client.expDate || '',
          eyeColor: client.eyeColor || '',
          height: client.height || '',
          bank: client.bank || 'chase',
          status: client.status || 'pending',
          notes: client.notes || '',
        });

        // Populate cards data
        if (client.cards && client.cards.length > 0) {
          const clientCards = client.cards.map((card, index) => ({
            id: index + 1,
            cardHolderName: card.cardHolderName || '',
            cardNumber: card.cardNumber || '',
            expiryDate: card.expiryDate || '',
            cvv: card.cvv || '',
            cardType: card.cardType || 'VISA',
          }));
          setCards(clientCards);
        }
      } else {
        setError('Failed to fetch client details');
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      setError('Error fetching client details');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle card field changes
  const handleCardChange = (cardId, field, value) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          const updatedCard = { ...card, [field]: value };

          // Auto-detect card type when card number changes
          if (field === 'cardNumber') {
            updatedCard.cardType = getCardType(value);
          }

          return updatedCard;
        }
        return card;
      })
    );
  };

  // Add new card
  const addNewCard = () => {
    const newCard = {
      id: Date.now(), // Simple ID generation
      cardHolderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardType: 'VISA',
    };
    setCards((prev) => [...prev, newCard]);
  };

  // Remove card
  const removeCard = (cardId) => {
    if (cards.length > 1) {
      // Keep at least one card
      setCards((prev) => prev.filter((card) => card.id !== cardId));
    }
  };

  // Function to detect card type from card number
  const getCardType = (cardNumber) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data - include multiple cards and notes
      const filteredCards = cards.filter(
        (card) => card.cardNumber && card.cardNumber.trim() !== ''
      );

      const clientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        cell: formData.cell,
        ssn: formData.ssn,
        dob: formData.dob,
        mmn: formData.mmn,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        routingNumber: formData.routingNumber,
        accountNumber: formData.accountNumber,
        dlNumber: formData.dlNumber,
        dlClass: formData.dlClass,
        issueDate: formData.issueDate,
        expDate: formData.expDate,
        eyeColor: formData.eyeColor,
        height: formData.height,
        bank: formData.bank,
        status: formData.status,
        notes: formData.notes,
      };

      // Add cards only if there are valid cards
      if (filteredCards.length > 0) {
        clientData.cards = filteredCards.map((card) => ({
          cardHolderName: card.cardHolderName,
          cardNumber: card.cardNumber,
          expiryDate: card.expiryDate,
          cvv: card.cvv,
          cardType: card.cardType,
        }));
      }

      console.log('Sending client data:', clientData);

      let response;
      if (isEditMode && clientId) {
        response = await clients.update(clientId, clientData);
        console.log('Update response:', response);
      } else {
        response = await clients.create(clientData);
        console.log('Create response:', response);
      }

      if (response.success) {
        const successMessage = isEditMode
          ? 'Client updated successfully!'
          : 'Client created successfully!';
        setSuccess(successMessage);

        if (!isEditMode) {
          // Reset form only for new client creation
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            cell: '',
            ssn: '',
            dob: '',
            mmn: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            routingNumber: '',
            accountNumber: '',
            dlNumber: '',
            dlClass: '',
            issueDate: '',
            expDate: '',
            eyeColor: '',
            height: '',
            bank: 'chase',
            status: 'pending',
            // Notes (optional)
            notes:
              'I spoke with the client, and we had a brief discussion. The client said they will talk further tomorrow.',
          });
          // Reset cards to default
          setCards([
            {
              id: 1,
              cardHolderName: '',
              cardNumber: '',
              expiryDate: '',
              cvv: '',
              cardType: 'VISA',
            },
          ]);
        }

        // Redirect to clients page after a delay
        setTimeout(() => {
          router.push('/clients');
        }, 2000);
      }
    } catch (error) {
      setError(
        error.message ||
          (isEditMode ? 'Failed to update client' : 'Failed to create client')
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar Component */}
      <Sidebar activeTab="Clients" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Component */}
        <Header
          title={isEditMode ? 'Edit Client' : 'Add Client'}
          icon={Users}
        />

        {/* Main Content Area */}
        <div className="flex-1 p-8 px-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {initialLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading client data...</div>
            </div>
          ) : (
            <div className="flex w-full gap-[5%] justify-between">
              <form onSubmit={handleSubmit} className="w-[60%] inline-block">
                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column - Form Fields */}
                  <div className="col-span-2">
                    <div className="grid grid-cols-2 gap-6">
                      {/* First Name */}
                      <div>
                        <Label
                          htmlFor="firstName"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          First Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange('firstName', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                          required
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <Label
                          htmlFor="lastName"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Last Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange('lastName', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <Label
                          htmlFor="email"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Email <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange('email', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                          required
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <Label
                          htmlFor="phone"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          type="text"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange('phone', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                        />
                      </div>

                      {/* Cell */}
                      <div>
                        <Label
                          htmlFor="cell"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Cell
                        </Label>
                        <Input
                          id="cell"
                          type="text"
                          value={formData.cell}
                          onChange={(e) =>
                            handleInputChange('cell', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                        />
                      </div>

                      {/* SSN */}
                      <div>
                        <Label
                          htmlFor="ssn"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          SSN
                        </Label>
                        <Input
                          id="ssn"
                          type="text"
                          value={formData.ssn}
                          onChange={(e) =>
                            handleInputChange('ssn', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                          placeholder="XXX-XX-XXXX"
                        />
                      </div>

                      {/* DOB */}
                      <div>
                        <Label
                          htmlFor="dob"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          DOB
                        </Label>
                        <Input
                          id="dob"
                          type="text"
                          value={formData.dob}
                          onChange={(e) =>
                            handleInputChange('dob', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                          placeholder="DD-MM-YYYY"
                        />
                      </div>

                      {/* MMN */}
                      <div>
                        <Label
                          htmlFor="mmn"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          MMN
                        </Label>
                        <Input
                          id="mmn"
                          type="text"
                          value={formData.mmn}
                          onChange={(e) =>
                            handleInputChange('mmn', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                          placeholder="Mother's Maiden Name"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <Label
                          htmlFor="address"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Address
                        </Label>
                        <Input
                          id="address"
                          type="text"
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange('address', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                        />
                      </div>

                      {/* City */}
                      <div>
                        <Label
                          htmlFor="city"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          City
                        </Label>
                        <Input
                          id="city"
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            handleInputChange('city', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                        />
                      </div>

                      {/* State */}
                      <div>
                        <Label
                          htmlFor="state"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          State
                        </Label>
                        <Input
                          id="state"
                          type="text"
                          value={formData.state}
                          onChange={(e) =>
                            handleInputChange('state', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                        />
                      </div>

                      {/* ZIP Code */}
                      <div>
                        <Label
                          htmlFor="zipCode"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          ZIP Code
                        </Label>
                        <Input
                          id="zipCode"
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) =>
                            handleInputChange('zipCode', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                        />
                      </div>

                      {/* Routing Number */}
                      <div>
                        <Label
                          htmlFor="routingNumber"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Routing No.
                        </Label>
                        <Input
                          id="routingNumber"
                          type="text"
                          value={formData.routingNumber}
                          onChange={(e) =>
                            handleInputChange('routingNumber', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                        />
                      </div>

                      {/* Account Number */}
                      <div>
                        <Label
                          htmlFor="accountNumber"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Account No.
                        </Label>
                        <Input
                          id="accountNumber"
                          type="text"
                          value={formData.accountNumber}
                          onChange={(e) =>
                            handleInputChange('accountNumber', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                        />
                      </div>

                      {/* DL Number */}
                      <div>
                        <Label
                          htmlFor="dlNumber"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          DL NO.
                        </Label>
                        <Input
                          id="dlNumber"
                          type="text"
                          value={formData.dlNumber}
                          onChange={(e) =>
                            handleInputChange('dlNumber', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                        />
                      </div>

                      {/* Class */}
                      <div>
                        <Label
                          htmlFor="dlClass"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Class
                        </Label>
                        <Input
                          id="dlClass"
                          type="text"
                          value={formData.dlClass}
                          onChange={(e) =>
                            handleInputChange('dlClass', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                        />
                      </div>

                      {/* Issue Date */}
                      <div>
                        <Label
                          htmlFor="issueDate"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Issue Date
                        </Label>
                        <Input
                          id="issueDate"
                          type="text"
                          value={formData.issueDate}
                          onChange={(e) =>
                            handleInputChange('issueDate', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                          placeholder="DD-MM-YYYY"
                        />
                      </div>

                      {/* Exp Date */}
                      <div>
                        <Label
                          htmlFor="expDate"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Exp Date
                        </Label>
                        <Input
                          id="expDate"
                          type="text"
                          value={formData.expDate}
                          onChange={(e) =>
                            handleInputChange('expDate', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                          placeholder="DD-MM-YYYY"
                        />
                      </div>

                      {/* Eye Color */}
                      <div>
                        <Label
                          htmlFor="eyeColor"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Eye Color
                        </Label>
                        <Input
                          id="eyeColor"
                          type="text"
                          value={formData.eyeColor}
                          onChange={(e) =>
                            handleInputChange('eyeColor', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                        />
                      </div>

                      {/* Height */}
                      <div>
                        <Label
                          htmlFor="height"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Height
                        </Label>
                        <Input
                          id="height"
                          type="text"
                          value={formData.height}
                          onChange={(e) =>
                            handleInputChange('height', e.target.value)
                          }
                          className="bg-white border-none text-black h-10 rounded-lg w-full"
                          placeholder="5'6&quot;"
                        />
                      </div>

                      {/* Bank */}
                      <div>
                        <Label
                          htmlFor="bank"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Bank
                        </Label>
                        <Select
                          options={bankOptions}
                          value={formData.bank}
                          onChange={(value) => handleInputChange('bank', value)}
                          placeholder="Select a bank"
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <Label
                          htmlFor="status"
                          className="text-gray-300 text-sm mb-2 block"
                        >
                          Status
                        </Label>
                        <ColoredSelect
                          options={statusOptions}
                          value={formData.status}
                          onChange={(value) =>
                            handleInputChange('status', value)
                          }
                          placeholder="Select status"
                          backgroundColor={getStatusColor(formData.status).bg}
                          textColor={getStatusColor(formData.status).text}
                        />
                      </div>
                    </div>

                    {/* Save Client Button */}
                    <div className="mt-8">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Saving...' : 'Save Client'}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="grid grid-cols-1 gap-8 w-[30%]">
                {/* <div className="col-span-2"></div> */}
                {/* Right Column - Cards and Notes */}
                <div className="space-y-6 flex flex-col">
                  {/* Multiple Credit Cards */}
                  {cards.map((card, index) => (
                    <div
                      key={card.id}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white relative"
                    >
                      {/* Remove Card Button (show only if more than 1 card) */}
                      {cards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCard(card.id)}
                          className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <input
                            type="text"
                            value={card.cardHolderName}
                            onChange={(e) =>
                              handleCardChange(
                                card.id,
                                'cardHolderName',
                                e.target.value
                              )
                            }
                            className="text-md font-semibold bg-transparent border-none outline-none text-white placeholder-white/70 w-full"
                            placeholder="Card Holder Name"
                          />
                        </div>
                        <div className="text-lg font-bold">
                          {getCardType(card.cardNumber)}
                        </div>
                      </div>
                      <div className="mb-6">
                        <input
                          type="text"
                          value={card.cardNumber}
                          onChange={(e) => {
                            // Format card number with spaces
                            const value = e.target.value
                              .replace(/\s/g, '')
                              .replace(/(.{4})/g, '$1 ')
                              .trim();
                            if (value.replace(/\s/g, '').length <= 16) {
                              handleCardChange(card.id, 'cardNumber', value);
                            }
                          }}
                          className="text-xl font-mono tracking-wider bg-transparent border-none outline-none text-white placeholder-white/70 w-full"
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <span className="mr-1">Exp</span>
                          <input
                            type="text"
                            value={card.expiryDate}
                            onChange={(e) => {
                              // Format expiry date as MM/YYYY
                              const value = e.target.value.replace(/\D/g, '');
                              let formatted = value;
                              if (value.length >= 2) {
                                formatted =
                                  value.slice(0, 2) + '/' + value.slice(2, 6);
                              }
                              if (formatted.length <= 7) {
                                handleCardChange(
                                  card.id,
                                  'expiryDate',
                                  formatted
                                );
                              }
                            }}
                            className="bg-transparent border-none outline-none text-white placeholder-white/70 w-16"
                            placeholder="MM/YYYY"
                            maxLength="7"
                          />
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">Cvc:</span>
                          <input
                            type="text"
                            value={card.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 4) {
                                handleCardChange(card.id, 'cvv', value);
                              }
                            }}
                            className="bg-transparent border-none outline-none text-white placeholder-white/70 w-8"
                            placeholder="123"
                            maxLength="4"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add New Card Button */}
                  <Button
                    type="button"
                    onClick={addNewCard}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Card</span>
                  </Button>

                  {/* Notes Section */}
                  <div className="bg-gray-800 rounded-lg p-4 grow">
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange('notes', e.target.value)
                      }
                      className="text-gray-300 text-sm leading-relaxed bg-transparent border-none outline-none resize-none w-full min-h-[100%] placeholder-gray-500"
                      placeholder="Add notes about the client..."
                    />
                  </div>

                  {/* Add Note Button */}
                  <Button
                    type="button"
                    onClick={() => {
                      // Focus on the notes textarea
                      const notesTextarea = document.querySelector('textarea');
                      if (notesTextarea) notesTextarea.focus();
                    }}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg"
                  >
                    Focus Notes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
