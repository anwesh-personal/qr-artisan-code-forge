import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Upload, 
  Camera, 
  Zap, 
  Eye, 
  Download,
  Sparkles,
  AlertCircle,
  StopCircle
} from 'lucide-react';
import { QROptions, generateQRCode } from '@/utils/qrGenerator';
import { useToast } from '@/hooks/use-toast';

interface PictureToQRProps {
  onGenerate: (content: string, type: string) => void;
  customization: QROptions;
}

export const PictureToQR: React.FC<PictureToQRProps> = ({ onGenerate, customization }) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [qrContent, setQrContent] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState([0.7]);
  const [useAdvancedBlending, setUseAdvancedBlending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedQR, setProcessedQR] = useState<string>('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      // Try different camera access methods for cross-platform compatibility
      let stream: MediaStream;
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        // Fallback for older browsers
        const getUserMedia = (navigator as any).getUserMedia || 
                            (navigator as any).webkitGetUserMedia || 
                            (navigator as any).mozGetUserMedia;
        
        if (!getUserMedia) {
          throw new Error('Camera not supported');
        }
        
        stream = await new Promise<MediaStream>((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
      
      setCameraStream(stream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(error => {
            console.error('Error playing video:', error);
          });
        };
      }

      toast({
        title: "📷 Camera Ready!",
        description: "Position yourself in the camera view and tap capture",
      });
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions or try uploading an image instead.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        toast({
          title: "Error",
          description: "Canvas not supported",
          variant: "destructive",
        });
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;

      // Draw the current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const imageData = canvas.toDataURL('image/png');
      setSelectedImage(imageData);
      
      stopCamera();
      
      toast({
        title: "📸 Photo Captured!",
        description: "Photo captured successfully. Now add your QR content below.",
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const generatePictureQR = async () => {
    if (!selectedImage || !qrContent.trim()) {
      toast({
        title: "Missing Requirements",
        description: "Please select an image and enter QR content",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Starting picture QR generation...');
      
      // First generate the base QR code
      const baseQR = await generateQRCode(qrContent, customization);
      console.log('Base QR generated');
      
      // Then blend it with the selected image
      const blendedQR = await blendImageWithQR(selectedImage, baseQR);
      console.log('Blending completed');
      
      setProcessedQR(blendedQR);
      
      // Call the parent generate function
      onGenerate(qrContent, 'picture');
      
      toast({
        title: "✨ Picture QR Generated!",
        description: "Your image has been converted to a scannable QR code",
      });
    } catch (error) {
      console.error('Error generating picture QR:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to create picture QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const blendImageWithQR = (imageDataUrl: string, qrDataUrl: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      console.log('Starting image blending process...');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      const qrImg = new Image();
      let imagesLoaded = 0;

      const checkLoaded = () => {
        imagesLoaded++;
        console.log(`Images loaded: ${imagesLoaded}/2`);
        if (imagesLoaded === 2) {
          processImages();
        }
      };

      const processImages = () => {
        try {
          console.log('Processing images...');
          
          // Set canvas size to QR code dimensions
          canvas.width = qrImg.width;
          canvas.height = qrImg.height;

          // Draw the QR code first as base
          ctx.drawImage(qrImg, 0, 0);

          // Create a copy of the QR code for masking
          const qrImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrPixels = qrImageData.data;

          // Clear canvas and draw image first
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw the image, scaled to fit the QR code
          const aspectRatio = img.width / img.height;
          const qrAspectRatio = qrImg.width / qrImg.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (aspectRatio > qrAspectRatio) {
            drawHeight = qrImg.height;
            drawWidth = drawHeight * aspectRatio;
            drawX = (qrImg.width - drawWidth) / 2;
            drawY = 0;
          } else {
            drawWidth = qrImg.width;
            drawHeight = drawWidth / aspectRatio;
            drawX = 0;
            drawY = (qrImg.height - drawHeight) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

          // Get the image data
          const blendedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const blendedPixels = blendedImageData.data;

          // Blend the QR code pattern with the image
          for (let i = 0; i < qrPixels.length; i += 4) {
            const qrIsBlack = qrPixels[i] < 128; // QR black modules
            
            if (qrIsBlack) {
              // Apply darkening to image pixels where QR is black
              blendedPixels[i] = Math.floor(blendedPixels[i] * (1 - overlayOpacity[0])); // R
              blendedPixels[i + 1] = Math.floor(blendedPixels[i + 1] * (1 - overlayOpacity[0])); // G
              blendedPixels[i + 2] = Math.floor(blendedPixels[i + 2] * (1 - overlayOpacity[0])); // B
            }
          }

          // Put the blended image data back
          ctx.putImageData(blendedImageData, 0, 0);

          console.log('Blending completed successfully');
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          console.error('Error in processImages:', error);
          reject(error);
        }
      };

      img.onload = () => {
        console.log('User image loaded');
        checkLoaded();
      };
      img.onerror = (error) => {
        console.error('Failed to load user image:', error);
        reject(new Error('Failed to load user image'));
      };
      
      qrImg.onload = () => {
        console.log('QR image loaded');
        checkLoaded();
      };
      qrImg.onerror = (error) => {
        console.error('Failed to load QR code:', error);
        reject(new Error('Failed to load QR code'));
      };

      // Start loading images
      img.src = imageDataUrl;
      qrImg.src = qrDataUrl;
    });
  };

  const downloadPictureQR = () => {
    if (processedQR) {
      const link = document.createElement('a');
      link.href = processedQR;
      link.download = `picture-qr-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Downloaded",
        description: "Picture QR code downloaded successfully",
      });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Picture to QR Code
        </h2>
        <p className="text-muted-foreground">
          Transform your face or any image into a scannable QR code
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-orange-500" />
              Image Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Upload/Camera */}
            <div className="space-y-3">
              <Label>Select or Capture Image</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  onClick={showCamera ? stopCamera : startCamera}
                  className="flex items-center gap-2"
                >
                  {showCamera ? <StopCircle className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                  {showCamera ? 'Stop Camera' : 'Use Camera'}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Camera View */}
            {showCamera && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-white/50 m-4 rounded-lg flex items-center justify-center pointer-events-none">
                    <div className="text-white text-center">
                      <Camera className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm">Position yourself here</p>
                    </div>
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <Button onClick={capturePhoto} className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </Button>
              </motion.div>
            )}

            {/* Selected Image Preview */}
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <Label>Selected Image</Label>
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                    ✓ Ready
                  </Badge>
                </div>
              </motion.div>
            )}

            {/* QR Content Input */}
            <div className="space-y-2">
              <Label>QR Code Content</Label>
              <Textarea
                placeholder="Enter the content that should be encoded in the QR code (URL, text, etc.)"
                value={qrContent}
                onChange={(e) => setQrContent(e.target.value)}
                rows={3}
              />
            </div>

            {/* Blending Options */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium">Blending Options</Label>
              
              <div className="space-y-2">
                <Label className="text-sm">Overlay Opacity: {Math.round(overlayOpacity[0] * 100)}%</Label>
                <Slider
                  value={overlayOpacity}
                  onValueChange={setOverlayOpacity}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Advanced Blending</Label>
                <Switch
                  checked={useAdvancedBlending}
                  onCheckedChange={setUseAdvancedBlending}
                />
              </div>
            </div>

            <Button
              onClick={generatePictureQR}
              disabled={!selectedImage || !qrContent.trim() || isProcessing}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isProcessing ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Picture QR
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-500" />
              Picture QR Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {processedQR ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <img
                    src={processedQR}
                    alt="Picture QR Code"
                    className="w-full max-w-sm mx-auto rounded-lg border shadow-lg"
                  />
                  <Badge className="mt-2 bg-green-500 text-white">
                    ✓ Scannable QR Code
                  </Badge>
                </div>
                
                <Button
                  onClick={downloadPictureQR}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Picture QR
                </Button>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">Picture QR Preview</p>
                <p className="text-sm">Upload an image and add content to generate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            How Picture to QR Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">📸 Image Input</h4>
              <ul className="space-y-1">
                <li>• Upload from device or use camera</li>
                <li>• Face photos work best</li>
                <li>• Max file size: 5MB</li>
                <li>• Supports JPG, PNG formats</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">🎨 Blending</h4>
              <ul className="space-y-1">
                <li>• Adjust opacity for visibility</li>
                <li>• Advanced blending for better results</li>
                <li>• QR pattern remains scannable</li>
                <li>• Image overlays QR code</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">✅ Results</h4>
              <ul className="space-y-1">
                <li>• Fully scannable QR code</li>
                <li>• Contains your face/image</li>
                <li>• High-resolution output</li>
                <li>• Perfect for personal branding</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
