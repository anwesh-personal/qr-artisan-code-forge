
import QRCode from 'qrcode';

export interface QROptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  width: number;
}

export const generateQRCode = async (
  text: string,
  options: QROptions
): Promise<string> => {
  try {
    const qrOptions = {
      errorCorrectionLevel: options.errorCorrectionLevel,
      margin: options.margin,
      color: options.color,
      width: options.width,
      rendererOpts: {
        quality: 1
      }
    };

    return await QRCode.toDataURL(text, qrOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateVCard = (contact: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization?: string;
  url?: string;
}): string => {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.firstName} ${contact.lastName}`,
    `N:${contact.lastName};${contact.firstName};;;`,
    contact.phone && `TEL:${contact.phone}`,
    contact.email && `EMAIL:${contact.email}`,
    contact.organization && `ORG:${contact.organization}`,
    contact.url && `URL:${contact.url}`,
    'END:VCARD'
  ].filter(Boolean).join('\n');
  
  return vcard;
};

export const generateWiFi = (wifi: {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}): string => {
  return `WIFI:T:${wifi.security};S:${wifi.ssid};P:${wifi.password};H:${wifi.hidden ? 'true' : 'false'};;`;
};

export const generateUPI = (upi: {
  payeeId: string;
  payeeName: string;
  amount?: number;
  currency?: string;
  note?: string;
}): string => {
  let upiString = `upi://pay?pa=${upi.payeeId}&pn=${encodeURIComponent(upi.payeeName)}`;
  
  if (upi.amount) {
    upiString += `&am=${upi.amount}`;
  }
  
  if (upi.currency) {
    upiString += `&cu=${upi.currency}`;
  }
  
  if (upi.note) {
    upiString += `&tn=${encodeURIComponent(upi.note)}`;
  }
  
  return upiString;
};

export const generateSMS = (sms: {
  phone: string;
  message: string;
}): string => {
  return `sms:${sms.phone}?body=${encodeURIComponent(sms.message)}`;
};

export const generateEmail = (email: {
  to: string;
  subject?: string;
  body?: string;
}): string => {
  let emailString = `mailto:${email.to}`;
  const params = [];
  
  if (email.subject) {
    params.push(`subject=${encodeURIComponent(email.subject)}`);
  }
  
  if (email.body) {
    params.push(`body=${encodeURIComponent(email.body)}`);
  }
  
  if (params.length > 0) {
    emailString += `?${params.join('&')}`;
  }
  
  return emailString;
};
