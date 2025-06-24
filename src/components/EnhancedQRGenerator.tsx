
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Sparkles, 
  Eye, 
  Palette, 
  Camera,
  Download,
  Share2,
  Scan,
  Globe,
  Barcode,
  Info,
  Settings,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { QROptions, generateQRCode } from '@/utils/qrGenerator';
import { QRInput } from './QRInput';
import { AdvancedCustomization } from './AdvancedCustomization';
import { QRPreview } from './QRPreview';
import { SmartQRHistory } from './SmartQRHistory';
import { QRAnalytics } from './QRAnalytics';
import { CustomizableCard } from './CustomizableCard';
import { BarcodeConverter } from './BarcodeConverter';
import { DonationCard } from './DonationCard';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

export interface EnhancedQRData {
  id: string;
  type: string;
  content: string;
  customization: QROptions & {
    logo?: string;
    gradientColors?: string[];
    gradientDirection?: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
    cornerStyle?: 'square' | 'rounded' | 'circle' | 'star' | 'diamond';
    patternStyle?: 'square' | 'circle' | 'rounded' | 'hexagon' | 'triangle';
    backgroundColor?: string;
    foregroundColor?: string;
    shape?: 'square' | 'circle' | 'rounded-square' | 'heart' | 'star';
    texture?: string;
    animation?: 'none' | 'pulse' | 'glow' | 'breathe' | 'rotate';
    holographic?: boolean;
    metallic?: boolean;
    neon?: boolean;
  };
  qrCode: string;
  timestamp: number;
  analytics?: {
    scans: number;
    uniqueUsers: number;
    locations: string[];
    devices: string[];
  };
}

const professionalFeatures = [
  {
    id: 'high-quality',
    title: 'High Quality Output',
    description: 'Generate crisp, high-resolution QR codes perfect for print and digital use',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'custom-branding',
    title: 'Custom Branding',
    description: 'Add your logo, custom colors, and brand elements to QR codes',
    icon: Palette,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'multiple-formats',
    title: 'Multiple Formats',
    description: 'Export in PNG, JPG, SVG and various sizes for different use cases',
    icon: Download,
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'live-preview',
    title: 'Live Preview',
    description: 'See changes in real-time as you customize your QR code design',
    icon: Eye,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'batch-processing',
    title: 'Batch Generation',
    description: 'Generate multiple QR codes at once for campaigns and bulk use',
    icon: Zap,
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'analytics',
    title: 'Usage Analytics',
    description: 'Track and analyze QR code performance and scan statistics',
    icon: Scan,
    gradient: 'from-teal-500 to-blue-500'
  }
];

export const EnhancedQRGenerator: React.FC = () => {
  const [qrData, setQrData] = useState<EnhancedQRData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<EnhancedQRData[]>([]);
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const defaultOptions: QROptions = {
    errorCorrectionLevel: 'M',
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    width: 512,
  };

  const [customization, setCustomization] = useState(defaultOptions);

  useEffect(() => {
    const savedHistory = localStorage.getItem('enhanced-qr-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  const generateEnhancedQR = async (content: string, type: string) => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to generate QR code",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating QR with customization:', customization);
      
      const qrCode = await generateQRCode(content, customization);
      
      const newQRData: EnhancedQRData = {
        id: Date.now().toString(),
        type,
        content,
        customization: { ...customization },
        qrCode,
        timestamp: Date.now(),
        analytics: {
          scans: 0,
          uniqueUsers: 0,
          locations: [],
          devices: []
        }
      };

      setQrData(newQRData);
      
      const newHistory = [newQRData, ...history.slice(0, 19)];
      setHistory(newHistory);
      localStorage.setItem('enhanced-qr-history', JSON.stringify(newHistory));

      toast({
        title: "✨ QR Code Generated!",
        description: "Your custom QR code is ready for download",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    setActiveFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background/80 to-muted/20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {/* Header with Navigation */}
        <motion.div 
          className="mb-8 text-center relative"
          variants={itemVariants}
        >
          <div className="absolute top-0 right-0 flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/about" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                About
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Dark Mode</span>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
          </div>
          
          <motion.div className="flex items-center justify-center gap-3 mb-4">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              Quantum QR
            </motion.h1>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              Free Forever
            </Badge>
          </motion.div>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-6"
            variants={itemVariants}
          >
            Professional QR Code Generator with Advanced Customization
          </motion.p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              QR Generator
            </TabsTrigger>
            <TabsTrigger value="converter" className="flex items-center gap-2">
              <Barcode className="w-4 h-4" />
              Barcode Converter
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            {/* Professional Features Grid */}
            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-bold mb-4 text-center">Professional Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {professionalFeatures.map((feature) => (
                  <motion.div
                    key={feature.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={activeFeatures.includes(feature.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFeature(feature.id)}
                      className={`h-auto p-3 w-full ${
                        activeFeatures.includes(feature.id) 
                          ? `bg-gradient-to-r ${feature.gradient} text-white border-0` 
                          : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <feature.icon className="w-4 h-4" />
                        <span className="text-xs text-center leading-tight">
                          {feature.title.split(' ').slice(0, 2).join(' ')}
                        </span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Input Section */}
              <motion.div 
                className="lg:col-span-1 space-y-6"
                variants={itemVariants}
              >
                <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <QrCode className="w-5 h-5 text-purple-500" />
                      </motion.div>
                      Content Input
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QRInput onGenerate={generateEnhancedQR} isLoading={isGenerating} />
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-500" />
                      Customization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AdvancedCustomization
                      options={customization}
                      onChange={setCustomization}
                      onRegenerate={() => qrData && generateEnhancedQR(qrData.content, qrData.type)}
                      hasQRCode={!!qrData}
                      activeFeatures={activeFeatures}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Preview Section */}
              <motion.div 
                className="lg:col-span-2 space-y-6"
                variants={itemVariants}
              >
                <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50 h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-green-500" />
                      Preview & Download
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QRPreview qrData={qrData} isGenerating={isGenerating} />
                  </CardContent>
                </Card>

                {/* Customizable Card Preview */}
                {qrData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          Beautiful Card Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CustomizableCard qrData={qrData} />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>

              {/* Analytics & History Section */}
              <motion.div 
                className="lg:col-span-1 space-y-6"
                variants={itemVariants}
              >
                <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scan className="w-5 h-5 text-orange-500" />
                      Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QRAnalytics qrData={qrData} />
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-teal-500" />
                      History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SmartQRHistory 
                      history={history} 
                      onLoad={(data) => {
                        setQrData(data);
                        setCustomization(data.customization);
                      }} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="converter">
            <BarcodeConverter />
          </TabsContent>

          <TabsContent value="gallery">
            <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50 p-8">
              <CardContent className="text-center space-y-4">
                <Scan className="w-16 h-16 mx-auto text-muted-foreground" />
                <h3 className="text-2xl font-bold">QR Gallery</h3>
                <p className="text-muted-foreground">
                  View and manage all your created QR codes in one place.
                </p>
                <SmartQRHistory 
                  history={history} 
                  onLoad={(data) => {
                    setQrData(data);
                    setCustomization(data.customization);
                  }} 
                  expanded={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Floating Action Button for Mobile */}
        <AnimatePresence>
          {qrData && (
            <motion.div
              className="fixed bottom-6 left-6 z-50 md:hidden"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                size="lg"
                className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 shadow-2xl"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My QR Code',
                      text: 'Check out this QR code from Quantum QR!',
                    });
                  }
                }}
              >
                <Share2 className="w-6 h-6" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Donation Card */}
        <DonationCard />

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-border/50">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-lg">Quantum QR</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by <a href="https://anwe.sh" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline font-medium">anwe.sh</a>
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 Quantum QR. Free forever, no limits, no watermarks.
            </p>
          </div>
        </footer>
      </div>
    </motion.div>
  );
};
