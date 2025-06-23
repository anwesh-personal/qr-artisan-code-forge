
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Barcode, QrCode, ArrowRight, Upload, Zap } from 'lucide-react';
import { generateQRCode } from '@/utils/qrGenerator';
import { useToast } from '@/hooks/use-toast';

export const BarcodeConverter: React.FC = () => {
  const [barcodeData, setBarcodeData] = useState('');
  const [qrCode, setQrCode] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [barcodeType, setBarcodeType] = useState<'EAN-13' | 'UPC-A' | 'Code-128' | 'Code-39'>('EAN-13');
  const { toast } = useToast();

  const convertToQR = async () => {
    if (!barcodeData.trim()) {
      toast({
        title: "Error",
        description: "Please enter barcode data",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      const qrOptions = {
        errorCorrectionLevel: 'M' as const,
        margin: 4,
        color: { dark: '#000000', light: '#FFFFFF' },
        width: 512,
      };

      const result = await generateQRCode(`BARCODE:${barcodeType}:${barcodeData}`, qrOptions);
      setQrCode(result);
      
      toast({
        title: "✨ Conversion Successful!",
        description: `${barcodeType} barcode converted to QR code`,
      });
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Error",
        description: "Failed to convert barcode",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const validateBarcode = (data: string, type: string) => {
    switch (type) {
      case 'EAN-13':
        return /^\d{13}$/.test(data);
      case 'UPC-A':
        return /^\d{12}$/.test(data);
      case 'Code-128':
        return data.length > 0 && data.length <= 80;
      case 'Code-39':
        return /^[A-Z0-9\-. $/+%]*$/.test(data);
      default:
        return true;
    }
  };

  const isValid = validateBarcode(barcodeData, barcodeType);

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Barcode className="w-5 h-5 text-orange-500" />
            </motion.div>
            Barcode to QR Converter
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              World First!
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="barcode-type">Barcode Type</Label>
            <select
              className="w-full p-2 border rounded-md bg-background"
              value={barcodeType}
              onChange={(e) => setBarcodeType(e.target.value as any)}
            >
              <option value="EAN-13">EAN-13 (13 digits)</option>
              <option value="UPC-A">UPC-A (12 digits)</option>
              <option value="Code-128">Code-128 (Alphanumeric)</option>
              <option value="Code-39">Code-39 (A-Z, 0-9, symbols)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode-data">Barcode Data</Label>
            <Input
              id="barcode-data"
              value={barcodeData}
              onChange={(e) => setBarcodeData(e.target.value)}
              placeholder={
                barcodeType === 'EAN-13' ? '1234567890123' :
                barcodeType === 'UPC-A' ? '123456789012' :
                barcodeType === 'Code-128' ? 'ABC123DEF456' :
                'ABC123'
              }
              className={`${!isValid && barcodeData ? 'border-red-500' : ''}`}
            />
            {!isValid && barcodeData && (
              <p className="text-sm text-red-500">
                Invalid format for {barcodeType}
              </p>
            )}
          </div>

          <Button 
            onClick={convertToQR} 
            disabled={isConverting || !isValid || !barcodeData}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {isConverting ? (
              <Zap className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <>
                <Barcode className="w-4 h-4 mr-2" />
                <ArrowRight className="w-4 h-4 mr-2" />
                <QrCode className="w-4 h-4 mr-2" />
              </>
            )}
            {isConverting ? 'Converting...' : 'Convert to QR Code'}
          </Button>

          {qrCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="p-4 bg-white rounded-xl shadow-lg inline-block">
                <img src={qrCode} alt="Converted QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-muted-foreground">
                Barcode data converted to QR code successfully!
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
