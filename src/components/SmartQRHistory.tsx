
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Brain, 
  Star,
  Download,
  Eye,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { EnhancedQRData } from './EnhancedQRGenerator';

interface SmartQRHistoryProps {
  history: EnhancedQRData[];
  onLoad: (data: EnhancedQRData) => void;
}

export const SmartQRHistory: React.FC<SmartQRHistoryProps> = ({ history, onLoad }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ai' | 'manual'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'performance'>('recent');

  const filteredHistory = history
    .filter(item => {
      const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'ai' && item.aiEnhanced) ||
                           (filterType === 'manual' && !item.aiEnhanced);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.timestamp - a.timestamp;
        case 'popular':
          return (b.analytics?.scans || 0) - (a.analytics?.scans || 0);
        case 'performance':
          return (b.analytics?.uniqueUsers || 0) - (a.analytics?.uniqueUsers || 0);
        default:
          return 0;
      }
    });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      url: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      text: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      file: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      contact: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      wifi: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      upi: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      sms: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      email: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (history.length === 0) {
    return (
      <Card className="p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <div>
            <h3 className="font-medium mb-2">No QR Codes Yet</h3>
            <p className="text-sm text-muted-foreground">
              Your generated QR codes will appear here with smart analytics
            </p>
          </div>
        </motion.div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search QR codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={filterType} onValueChange={(value: 'all' | 'ai' | 'manual') => setFilterType(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              AI
            </TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'performance')}
            className="text-sm border rounded px-2 py-1 bg-background"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Scanned</option>
            <option value="performance">Best Performance</option>
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="p-3 cursor-pointer transition-all hover:shadow-md border-2 hover:border-purple-200 dark:hover:border-purple-800">
                <div className="flex items-start gap-3">
                  {/* QR Code Thumbnail */}
                  <div className="relative">
                    <img 
                      src={item.qrCode} 
                      alt="QR Code" 
                      className="w-12 h-12 rounded border"
                    />
                    {item.aiEnhanced && (
                      <div className="absolute -top-1 -right-1">
                        <Brain className="w-3 h-3 text-purple-500 bg-white dark:bg-gray-900 rounded-full p-0.5" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getTypeColor(item.type)} variant="secondary">
                          {item.type.toUpperCase()}
                        </Badge>
                        {item.aiEnhanced && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                            AI
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>

                    <p className="text-sm font-medium truncate mb-1">
                      {item.content.length > 40 
                        ? `${item.content.substring(0, 40)}...` 
                        : item.content
                      }
                    </p>

                    {/* Analytics Preview */}
                    {item.analytics && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{item.analytics.scans} scans</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{item.analytics.uniqueUsers} users</span>
                        </div>
                      </div>
                    )}

                    {/* Smart Features */}
                    {Object.values(item.smartFeatures).some(Boolean) && (
                      <div className="flex items-center gap-1 mt-2">
                        {item.smartFeatures.brandAlignment && (
                          <Badge variant="outline" className="text-xs">Brand</Badge>
                        )}
                        {item.smartFeatures.contextAware && (
                          <Badge variant="outline" className="text-xs">Smart</Badge>
                        )}
                        {item.smartFeatures.adaptiveDesign && (
                          <Badge variant="outline" className="text-xs">Adaptive</Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoad(item);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredHistory.length === 0 && searchTerm && (
        <Card className="p-6 text-center">
          <Search className="w-8 h-8 mx-auto text-muted-foreground opacity-50 mb-2" />
          <p className="text-sm text-muted-foreground">
            No QR codes found matching "{searchTerm}"
          </p>
        </Card>
      )}
    </div>
  );
};
