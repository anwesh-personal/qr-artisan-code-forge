
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Coffee, Gift, Zap } from 'lucide-react';
import { generateQRCode, generateUPI } from '@/utils/qrGenerator';

export const DonationCard: React.FC = () => {
  const [donationQR, setDonationQR] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const amounts = [50, 100, 250, 500];

  useEffect(() => {
    generateDonationQR();
  }, [selectedAmount]);

  const generateDonationQR = async () => {
    const upiData = generateUPI({
      payeeId: 'anweshrath-4@oksbi',
      payeeName: 'Anwesh Rath',
      amount: selectedAmount || undefined,
      currency: 'INR',
      note: 'Support anwe.sh QR Studio - Thank you! ❤️'
    });

    try {
      const qrCode = await generateQRCode(upiData, {
        errorCorrectionLevel: 'M',
        margin: 4,
        color: { dark: '#e11d48', light: '#ffffff' },
        width: 256,
      });
      setDonationQR(qrCode);
    } catch (error) {
      console.error('Error generating donation QR:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Card className="backdrop-blur-xl bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-200/20 shadow-2xl max-w-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-red-500" />
            </motion.div>
            Support Our Work
            <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs">
              Free Forever
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Help keep this service free for everyone! Any amount is appreciated.
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {amounts.map((amount) => (
              <Button
                key={amount}
                size="sm"
                variant={selectedAmount === amount ? "default" : "outline"}
                onClick={() => setSelectedAmount(selectedAmount === amount ? null : amount)}
                className={`text-xs ${
                  selectedAmount === amount 
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white' 
                    : ''
                }`}
              >
                ₹{amount}
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedAmount(null)}
            className="w-full text-xs"
          >
            <Gift className="w-3 h-3 mr-1" />
            Any Amount
          </Button>

          {donationQR && (
            <div className="text-center">
              <div className="p-2 bg-white rounded-lg inline-block">
                <img src={donationQR} alt="Donation QR" className="w-24 h-24" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Scan to donate {selectedAmount ? `₹${selectedAmount}` : 'any amount'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Coffee className="w-3 h-3" />
            <span>anweshrath-4@oksbi</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
