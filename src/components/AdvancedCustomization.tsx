
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Upload, 
  Palette, 
  Settings, 
  RefreshCw, 
  Sparkles, 
  Wand2,
  Eye,
  Zap,
  Star,
  Heart,
  Square,
  Circle
} from 'lucide-react';
import { QROptions } from '@/utils/qrGenerator';
import { readFileAsDataURL } from '@/utils/fileHandler';
import { HexColorPicker } from 'react-colorful';

interface ExtendedQROptions extends QROptions {
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
}

interface AdvancedCustomizationProps {
  options: ExtendedQROptions;
  onChange: (options: ExtendedQROptions) => void;
  onRegenerate: () => void;
  hasQRCode: boolean;
  aiMode: boolean;
  activeFeatures: string[];
}

export const AdvancedCustomization: React.FC<AdvancedCustomizationProps> = ({
  options,
  onChange,
  onRegenerate,
  hasQRCode,
  aiMode,
  activeFeatures
}) => {
  const [logoFile, setLogoFile] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorTarget, setActiveColorTarget] = useState<'dark' | 'light'>('dark');

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataURL(file);
      setLogoFile(dataUrl);
      onChange({ ...options, logo: dataUrl });
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  const updateOption = (key: keyof ExtendedQROptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const gradientPresets = [
    { name: 'Ocean', colors: ['#667eea', '#764ba2'], icon: '🌊' },
    { name: 'Sunset', colors: ['#f093fb', '#f5576c'], icon: '🌅' },
    { name: 'Forest', colors: ['#4ecdc4', '#44a08d'], icon: '🌲' },
    { name: 'Fire', colors: ['#ff6b6b', '#ffa726'], icon: '🔥' },
    { name: 'Purple', colors: ['#a855f7', '#3b82f6'], icon: '💜' },
    { name: 'Gold', colors: ['#fbbf24', '#f59e0b'], icon: '✨' },
    { name: 'Cyber', colors: ['#00f5ff', '#ff00ff'], icon: '🤖' },
    { name: 'Emerald', colors: ['#10b981', '#059669'], icon: '💎' },
  ];

  const shapeOptions = [
    { value: 'square', icon: Square, label: 'Square' },
    { value: 'circle', icon: Circle, label: 'Circle' },
    { value: 'rounded-square', icon: Square, label: 'Rounded' },
    { value: 'heart', icon: Heart, label: 'Heart' },
    { value: 'star', icon: Star, label: 'Star' },
  ];

  const textureOptions = [
    { name: 'None', value: '', preview: 'bg-gray-100' },
    { name: 'Carbon', value: 'carbon', preview: 'bg-gradient-to-br from-gray-800 to-gray-900' },
    { name: 'Metal', value: 'metal', preview: 'bg-gradient-to-br from-gray-300 to-gray-500' },
    { name: 'Glass', value: 'glass', preview: 'bg-gradient-to-br from-blue-100 to-blue-200' },
    { name: 'Neon', value: 'neon', preview: 'bg-gradient-to-br from-purple-400 to-pink-400' },
  ];

  return (
    <div className="space-y-6">
      {aiMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-purple-700 dark:text-purple-300">AI Assistant Active</span>
          </div>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            AI is analyzing your content and optimizing design choices automatically
          </p>
        </motion.div>
      )}

      <Tabs defaultValue="design" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
          <TabsTrigger value="effects" className="text-xs">Effects</TabsTrigger>
          <TabsTrigger value="shapes" className="text-xs">Shapes</TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-4 mt-4">
          {/* Color Customization */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Smart Color Selection</Label>
            <div className="grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="h-20 w-full p-2 flex flex-col items-center gap-2"
                  onClick={() => {
                    setActiveColorTarget('dark');
                    setShowColorPicker(!showColorPicker);
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-border"
                    style={{ backgroundColor: options.color.dark }}
                  />
                  <span className="text-xs">Foreground</span>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="h-20 w-full p-2 flex flex-col items-center gap-2"
                  onClick={() => {
                    setActiveColorTarget('light');
                    setShowColorPicker(!showColorPicker);
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-border"
                    style={{ backgroundColor: options.color.light }}
                  />
                  <span className="text-xs">Background</span>
                </Button>
              </motion.div>
            </div>

            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-card rounded-lg border"
              >
                <HexColorPicker
                  color={activeColorTarget === 'dark' ? options.color.dark : options.color.light}
                  onChange={(color) => 
                    updateOption('color', {
                      ...options.color,
                      [activeColorTarget]: color
                    })
                  }
                />
                <Button
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => setShowColorPicker(false)}
                >
                  Done
                </Button>
              </motion.div>
            )}
          </div>

          {/* Gradient Presets */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Gradient Presets</Label>
            <div className="grid grid-cols-4 gap-2">
              {gradientPresets.map((preset) => (
                <motion.div
                  key={preset.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateOption('gradientColors', preset.colors)}
                    className="h-16 w-full p-1 flex flex-col items-center gap-1"
                    style={{
                      background: `linear-gradient(45deg, ${preset.colors.join(', ')})`,
                    }}
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-xs text-white font-medium">{preset.name}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Brand Logo Integration</Label>
            <Card className="border-dashed border-2 p-4">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>Choose Logo</span>
                  </Button>
                </Label>
                {logoFile && (
                  <motion.div 
                    className="mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <img src={logoFile} alt="Logo preview" className="w-16 h-16 mx-auto rounded-lg shadow-md" />
                    <Badge className="mt-2" variant="secondary">Logo Added</Badge>
                  </motion.div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="effects" className="space-y-4 mt-4">
          {/* Effects Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <Label>Holographic Effect</Label>
              </div>
              <Switch 
                checked={options.holographic || false} 
                onCheckedChange={(checked) => updateOption('holographic', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <Label>Metallic Finish</Label>
              </div>
              <Switch 
                checked={options.metallic || false} 
                onCheckedChange={(checked) => updateOption('metallic', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-pink-500" />
                <Label>Neon Glow</Label>
              </div>
              <Switch 
                checked={options.neon || false} 
                onCheckedChange={(checked) => updateOption('neon', checked)}
              />
            </div>
          </div>

          {/* Texture Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Surface Texture</Label>
            <div className="grid grid-cols-2 gap-3">
              {textureOptions.map((texture) => (
                <motion.div
                  key={texture.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={options.texture === texture.value ? "default" : "outline"}
                    className="h-16 w-full flex flex-col items-center gap-2"
                    onClick={() => updateOption('texture', texture.value)}
                  >
                    <div className={`w-8 h-8 rounded ${texture.preview}`} />
                    <span className="text-xs">{texture.name}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Animation Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Animation Style</Label>
            <Select 
              value={options.animation || 'none'} 
              onValueChange={(value: 'none' | 'pulse' | 'glow' | 'breathe' | 'rotate') => updateOption('animation', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Animation</SelectItem>
                <SelectItem value="pulse">Pulse</SelectItem>
                <SelectItem value="glow">Glow</SelectItem>
                <SelectItem value="breathe">Breathe</SelectItem>
                <SelectItem value="rotate">Rotate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="shapes" className="space-y-4 mt-4">
          {/* QR Shape Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Overall Shape</Label>
            <div className="grid grid-cols-3 gap-3">
              {shapeOptions.map((shape) => (
                <motion.div
                  key={shape.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={options.shape === shape.value ? "default" : "outline"}
                    className="h-20 w-full flex flex-col items-center gap-2"
                    onClick={() => updateOption('shape', shape.value)}
                  >
                    <shape.icon className="w-6 h-6" />
                    <span className="text-xs">{shape.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Corner and Pattern Styles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Corner Style</Label>
              <Select 
                value={options.cornerStyle || 'square'} 
                onValueChange={(value: 'square' | 'rounded' | 'circle' | 'star' | 'diamond') => updateOption('cornerStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="star">Star</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Pattern Style</Label>
              <Select 
                value={options.patternStyle || 'square'} 
                onValueChange={(value: 'square' | 'circle' | 'rounded' | 'hexagon' | 'triangle') => updateOption('patternStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="hexagon">Hexagon</SelectItem>
                  <SelectItem value="triangle">Triangle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          {/* Technical Settings */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Error Correction Level</Label>
            <Select 
              value={options.errorCorrectionLevel} 
              onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => updateOption('errorCorrectionLevel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7%) - Fastest</SelectItem>
                <SelectItem value="M">Medium (15%) - Balanced</SelectItem>
                <SelectItem value="Q">Quartile (25%) - Reliable</SelectItem>
                <SelectItem value="H">High (30%) - Maximum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Size: {options.width}px</Label>
            <Slider
              value={[options.width]}
              onValueChange={([value]) => updateOption('width', value)}
              min={256}
              max={2048}
              step={64}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Margin: {options.margin}</Label>
            <Slider
              value={[options.margin]}
              onValueChange={([value]) => updateOption('margin', value)}
              min={0}
              max={20}
              step={1}
              className="mt-2"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                updateOption('color', { dark: '#000000', light: '#FFFFFF' });
                updateOption('gradientColors', undefined);
                updateOption('logo', undefined);
                updateOption('holographic', false);
                updateOption('metallic', false);
                updateOption('neon', false);
                setLogoFile('');
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Default
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                const colors = Array.from({ length: 3 }, () => 
                  '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
                );
                updateOption('gradientColors', colors);
              }}
              className="flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Magic Gradient
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {hasQRCode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            onClick={onRegenerate} 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Apply Changes
          </Button>
        </motion.div>
      )}
    </div>
  );
};
