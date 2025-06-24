import QRCode from 'qrcode';

export interface QROptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  width: number;
  logo?: string;
}

export const generateQRCode = async (
  text: string,
  options: QROptions
): Promise<string> => {
  try {
    console.log('Generating QR code with options:', options);
    
    const qrOptions = {
      errorCorrectionLevel: options.errorCorrectionLevel,
      margin: options.margin,
      color: options.color,
      width: options.width,
      rendererOpts: {
        quality: 1
      }
    };

    // Generate base QR code
    let qrCodeDataUrl = await QRCode.toDataURL(text, qrOptions);
    
    // If logo is provided, embed it
    if (options.logo) {
      qrCodeDataUrl = await embedLogoInQR(qrCodeDataUrl, options.logo);
    }
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

const embedLogoInQR = async (qrCodeDataUrl: string, logoDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(qrCodeDataUrl); // Fallback to original QR if canvas fails
        return;
      }

      const qrImage = new Image();
      qrImage.onload = () => {
        canvas.width = qrImage.width;
        canvas.height = qrImage.height;
        
        // Draw QR code
        ctx.drawImage(qrImage, 0, 0);
        
        const logoImage = new Image();
        logoImage.onload = () => {
          // Calculate logo size (20% of QR code size)
          const logoSize = Math.min(qrImage.width, qrImage.height) * 0.2;
          const logoX = (qrImage.width - logoSize) / 2;
          const logoY = (qrImage.height - logoSize) / 2;
          
          // Draw white background for logo
          ctx.fillStyle = 'white';
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
          
          // Draw logo
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
          
          resolve(canvas.toDataURL());
        };
        
        logoImage.onerror = () => {
          console.warn('Failed to load logo, using QR code without logo');
          resolve(qrCodeDataUrl);
        };
        
        logoImage.src = logoDataUrl;
      };
      
      qrImage.onerror = () => {
        reject(new Error('Failed to load QR code image'));
      };
      
      qrImage.src = qrCodeDataUrl;
    } catch (error) {
      console.warn('Failed to embed logo:', error);
      resolve(qrCodeDataUrl); // Fallback to original QR
    }
  });
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
