
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Share2, Copy, Zap, Eye, Smartphone, Monitor } from 'lucide-react';
import { EnhancedQRData } from './EnhancedQRGenerator';
import { useToast } from '@/hooks/use-toast';

interface QRPreviewProps {
  qrData: EnhancedQRData | null;
  isGenerating: boolean;
}

export const QRPreview: React.FC<QRPreviewProps> = ({ qrData, isGenerating }) => {
  const [processedQR, setProcessedQR] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const { toast } = useToast();

  useEffect(() => {
    if (qrData) {
      setProcessedQR(qrData.qrCode);
    }
  }, [qrData]);

  const handleDownload = (format: 'png' | 'jpg' | 'svg' = 'png') => {
    if (!processedQR) return;

    const filename = `qrcode-${Date.now()}.${format}`;
    
    if (format === 'svg') {
      // For SVG, we'd need to convert the QR to SVG format
      toast({
        title: "SVG Export",
        description: "SVG export coming soon! Using PNG for now.",
      });
      format = 'png';
    }

    // Create download link
    const link = document.createElement('a');
    
    if (format === 'jpg') {
      // Convert PNG to JPG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          // Fill with white background for JPG
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          link.href = canvas.toDataURL('image/jpeg', 0.9);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      };
      img.src = processedQR;
    } else {
      link.href = processedQR;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    toast({
      title: "Downloaded",
      description: `QR code saved as ${filename}`,
    });
  };

  const handleCopy = async () => {
    if (!processedQR) return;

    try {
      const response = await fetch(processedQR);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      toast({
        title: "Copied",
        description: "QR code copied to clipboard",
      });
    } catch (error) {
      try {
        await navigator.clipboard.writeText(processedQR);
        toast({
          title: "Copied",
          description: "QR code data copied to clipboard",
        });
      } catch (fallbackError) {
        toast({
          title: "Error",
          description: "Failed to copy QR code",
          variant: "destructive",
        });
      }
    }
  };

  const handleShare = async () => {
    if (!processedQR) return;

    if (navigator.share) {
      try {
        const response = await fetch(processedQR);
        const blob = await response.blob();
        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'QR Code from Quantum QR',
          text: 'Check out this QR code!',
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      url: 'bg-blue-100 text-blue-800',
      text: 'bg-green-100 text-green-800',
      file: 'bg-purple-100 text-purple-800',
      contact: 'bg-orange-100 text-orange-800',
      wifi: 'bg-indigo-100 text-indigo-800',
      upi: 'bg-yellow-100 text-yellow-800',
      sms: 'bg-pink-100 text-pink-800',
      email: 'bg-red-100 text-red-800',
      picture: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isGenerating) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="animate-pulse-glow w-48 h-48 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
            <Zap className="w-16 h-16 text-blue-500 animate-pulse" />
          </div>
          <p className="text-lg font-medium">Generating QR Code...</p>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>
      </Card>
    );
  }

  if (!qrData) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <Eye className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">QR Code Preview</p>
          <p className="text-sm">Generate a QR code to see preview</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preview Mode Toggle */}
      <div className="flex justify-center">
        <Tabs value={previewMode} onValueChange={(value: 'desktop' | 'mobile') => setPreviewMode(value)}>
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="desktop" className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              Mobile
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* QR Code Display */}
      <Card className={`p-6 ${previewMode === 'mobile' ? 'max-w-xs mx-auto' : ''}`}>
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            {isProcessing ? (
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <Zap className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : (
              <img 
                src={processedQR || qrData.qrCode} 
                alt="Generated QR Code"
                className="w-48 h-48 mx-auto rounded-lg shadow-lg"
                id="qr-preview"
              />
            )}
            <Badge className={`absolute -top-2 -right-2 ${getTypeColor(qrData.type)}`}>
              {qrData.type.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {qrData.content.length > 50 
                ? `${qrData.content.substring(0, 50)}...` 
                : qrData.content
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Size: {qrData.customization.width}px • 
              Error Correction: {qrData.customization.errorCorrectionLevel} • 
              Generated: {new Date(qrData.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => handleDownload('png')} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          PNG
        </Button>
        
        <Button onClick={() => handleDownload('jpg')} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          JPG
        </Button>
        
        <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2">
          <Copy className="w-4 h-4" />
          Copy
        </Button>
        
        <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      {/* Format Information */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Download Formats</h4>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
            <span>PNG (Recommended)</span>
            <Badge variant="outline">Lossless</Badge>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
            <span>JPG (Smaller size)</span>
            <Badge variant="outline">Compressed</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
