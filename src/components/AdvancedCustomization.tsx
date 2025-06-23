
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Upload, Palette, Sparkles, Wand2, Eye, Download, RefreshCw } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { QROptions } from '@/utils/qrGenerator';

interface AdvancedCustomizationProps {
  options: QROptions;
  onChange: (options: QROptions) => void;
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
  const [showColorPicker, setShowColorPicker] = useState<'dark' | 'light' | null>(null);
  const [logoFile, setLogoFile] = useState<string>('');
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [holographicEffect, setHolographicEffect] = useState(false);

  const handleColorChange = (color: string, type: 'dark' | 'light') => {
    onChange({
      ...options,
      color: {
        ...options.color,
        [type]: color
      }
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoFile(result);
        onChange({
          ...options,
          // @ts-ignore - extending QROptions
          logo: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const presetGradients = [
    { name: 'Ocean', colors: ['#0077be', '#00b4db'] },
    { name: 'Sunset', colors: ['#f7931e', '#f15a24'] },
    { name: 'Purple', colors: ['#667eea', '#764ba2'] },
    { name: 'Green', colors: ['#11998e', '#38ef7d'] },
    { name: 'Pink', colors: ['#ff6b95', '#ff9472'] },
  ];

  const isReadyToGenerate = () => {
    // Check if basic customization is complete
    return options.color.dark && options.color.light && options.width && options.margin;
  };

  return (
    <div className="space-y-6">
      {/* Color Customization */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-500" />
          <Label className="font-semibold">Colors</Label>
          {aiMode && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
              AI Enhanced
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm">Foreground</Label>
            <Button
              variant="outline"
              className="w-full h-10 p-0 border-2"
              style={{ backgroundColor: options.color.dark }}
              onClick={() => setShowColorPicker(showColorPicker === 'dark' ? null : 'dark')}
            >
              <span className="text-xs font-medium text-white mix-blend-difference">
                {options.color.dark}
              </span>
            </Button>
            {showColorPicker === 'dark' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute z-50 mt-2"
              >
                <Card className="p-4">
                  <HexColorPicker
                    color={options.color.dark}
                    onChange={(color) => handleColorChange(color, 'dark')}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setShowColorPicker(null)}
                  >
                    Done
                  </Button>
                </Card>
              </motion.div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">Background</Label>
            <Button
              variant="outline"
              className="w-full h-10 p-0 border-2"
              style={{ backgroundColor: options.color.light }}
              onClick={() => setShowColorPicker(showColorPicker === 'light' ? null : 'light')}
            >
              <span className="text-xs font-medium text-black mix-blend-difference">
                {options.color.light}
              </span>
            </Button>
            {showColorPicker === 'light' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute z-50 mt-2"
              >
                <Card className="p-4">
                  <HexColorPicker
                    color={options.color.light}
                    onChange={(color) => handleColorChange(color, 'light')}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setShowColorPicker(null)}
                  >
                    Done
                  </Button>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Gradient Presets */}
        <div className="space-y-2">
          <Label className="text-sm">Quick Gradients</Label>
          <div className="grid grid-cols-5 gap-2">
            {presetGradients.map((gradient) => (
              <Button
                key={gradient.name}
                variant="outline"
                size="sm"
                className="h-8 p-0"
                style={{
                  background: `linear-gradient(45deg, ${gradient.colors[0]}, ${gradient.colors[1]})`
                }}
                onClick={() => {
                  handleColorChange(gradient.colors[0], 'dark');
                  handleColorChange(gradient.colors[1], 'light');
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Logo Upload */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-green-500" />
          <Label className="font-semibold">Logo</Label>
        </div>
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            id="logo-upload"
          />
          <Button
            variant="outline"
            asChild
            className="w-full"
          >
            <label htmlFor="logo-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </label>
          </Button>
          {logoFile && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <img src={logoFile} alt="Logo" className="w-8 h-8 object-contain" />
              <span className="text-sm">Logo uploaded</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Size & Quality */}
      <div className="space-y-4">
        <Label className="font-semibold">Size & Quality</Label>
        
        <div className="space-y-2">
          <Label className="text-sm">Size: {options.width}px</Label>
          <Slider
            value={[options.width || 512]}
            onValueChange={(value) => onChange({ ...options, width: value[0] })}
            min={256}
            max={1024}
            step={64}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Margin: {options.margin}</Label>
          <Slider
            value={[options.margin || 4]}
            onValueChange={(value) => onChange({ ...options, margin: value[0] })}
            min={0}
            max={10}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Error Correction</Label>
          <select
            className="w-full p-2 text-sm border rounded-md bg-background"
            value={options.errorCorrectionLevel}
            onChange={(e) => onChange({ 
              ...options, 
              errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H'
            })}
          >
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
        </div>
      </div>

      <Separator />

      {/* Advanced Effects */}
      <div className="space-y-4">
        <Label className="font-semibold">Advanced Effects</Label>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <Label className="text-sm">Holographic Effect</Label>
          </div>
          <Switch 
            checked={holographicEffect}
            onCheckedChange={setHolographicEffect}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-500" />
            <Label className="text-sm">Gradient Mode</Label>
          </div>
          <Switch 
            checked={gradientEnabled}
            onCheckedChange={setGradientEnabled}
          />
        </div>
      </div>

      {/* Generation Control - Only show when ready */}
      {isReadyToGenerate() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Separator />
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-500" />
            <Label className="font-semibold">Ready to Generate</Label>
            <Badge className="bg-green-500 text-white">
              ✓ Complete
            </Badge>
          </div>
          
          {hasQRCode && (
            <Button
              onClick={onRegenerate}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate with New Settings
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};
