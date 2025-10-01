"use client";

import { useState } from 'react';
import { collection, doc, setDoc, writeBatch, getFirestore } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AdminImportPage = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const parseFollowers = (followersStr: string): number => {
    if (!followersStr) return 0;
    const cleaned = followersStr.trim().toUpperCase();
    if (cleaned.endsWith('M')) return parseFloat(cleaned) * 1000000;
    if (cleaned.endsWith('K')) return parseFloat(cleaned) * 1000;
    return parseFloat(cleaned) || 0;
  };

  const parseEngagement = (engagementStr: string): number => {
    if (!engagementStr) return 0;
    return parseFloat(engagementStr.replace('%', '').trim()) || 0;
  };

  const extractNameAndHandle = (nameField: string): { name: string; handle: string } => {
    if (!nameField) return { name: 'Unknown', handle: 'unknown' };
    const parts = nameField.split('\n').map(p => p.trim());
    if (parts.length >= 2) {
      return { name: parts[0], handle: parts[1].replace('@', '') };
    }
    return { name: nameField, handle: nameField.toLowerCase().replace(/\s+/g, '_') };
  };

  const parseCategories = (genreStr: string): string[] => {
    if (!genreStr) return ['Lifestyle'];
    const categories = genreStr
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(/(?=[A-Z])/)
      .filter(c => c.length > 0)
      .map(c => c.trim());
    
    const categoryMap: Record<string, string> = {
      'Soccer': 'Sports',
      'Entertainment and Music': 'Entertainment',
      'Modeling': 'Fashion',
      'Celebrity': 'Entertainment',
      'Food and Drink': 'Food',
    };
    
    return categories.map(cat => categoryMap[cat] || cat);
  };

  const estimateRateCard = (followers: number) => {
    const baseRate = followers * 0.015;
    return {
      post: Math.round(baseRate),
      story: Math.round(baseRate * 0.4),
      reel: Math.round(baseRate * 1.3),
      video: Math.round(baseRate * 1.5),
      integration: Math.round(baseRate * 2.5),
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setLog([]);
    setProgress(0);

    try {
      addLog('📁 Reading CSV file...');
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      addLog(`✅ Found ${lines.length - 1} influencers`);

      // Parse CSV (skip header)
      const influencers = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const parts: string[] = [];
        let current = '';
        let inQuotes = false;

        for (const char of line) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        parts.push(current.trim());

        if (parts.length >= 6) {
          const [rank, nameField, followersStr, engagementStr, country, genreStr] = parts;
          const { name, handle } = extractNameAndHandle(nameField);
          const followers = parseFollowers(followersStr);
          const engagement = parseEngagement(engagementStr);
          const categories = parseCategories(genreStr);
          const rateCard = estimateRateCard(followers);

          influencers.push({
            id: `influencer_${i}_${handle.replace(/[^a-z0-9]/gi, '_')}`,
            name,
            handle,
            platform: 'Instagram',
            profileImage: `https://via.placeholder.com/150?text=${encodeURIComponent(name.charAt(0))}`,
            followers,
            engagement,
            avgViews: Math.round(followers * 0.35),
            demographics: {
              ageRange: '25-34',
              gender: 'Mixed',
              location: ['Spain', 'España'],
              interests: categories,
              psychographics: `Spanish audience interested in ${categories.slice(0, 2).join(', ')}`,
            },
            contentCategories: categories,
            previousBrands: [],
            rateCard,
            performance: {
              averageEngagementRate: engagement,
              averageReach: Math.round(followers * 0.35),
              audienceGrowthRate: followers > 1000000 ? 1.5 : 3.0,
              contentQualityScore: Math.min(9.5, 6 + (engagement * 0.3)),
            },
          });
        }
      }

      addLog(`✅ Parsed ${influencers.length} influencers`);
      addLog('🔄 Importing to Firestore...');

      // Import in batches (max 500 per batch)
      const BATCH_SIZE = 450;
      let imported = 0;

      for (let i = 0; i < influencers.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = influencers.slice(i, i + BATCH_SIZE);

        chunk.forEach(influencer => {
          const docRef = doc(collection(db, 'influencers'), influencer.id);
          batch.set(docRef, influencer);
        });

        await batch.commit();
        imported += chunk.length;
        
        const progressPercent = Math.round((imported / influencers.length) * 100);
        setProgress(progressPercent);
        addLog(`  ✅ Imported ${imported}/${influencers.length} (${progressPercent}%)`);
      }

      // Update metadata
      await setDoc(doc(collection(db, 'metadata'), 'influencers'), {
        totalCount: influencers.length,
        lastUpdated: new Date(),
        dataSource: 'CSV: top 1000 influencers in spain',
        version: '1.3.1',
        realData: true,
      });

      addLog(`\n🎉 SUCCESS! Imported ${influencers.length} real Spanish influencers`);
      addLog(`✅ Ranks 1-${influencers.length} now in database`);
      addLog('✅ Database is ready to use');
      
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message);
      addLog(`❌ ERROR: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🗄️ Import Real Influencers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Upload the CSV file to import 3,000 real Spanish influencers into Firestore
          </p>

          {/* File Upload */}
          <div className="mb-8">
            <label
              htmlFor="csv-upload"
              className="block w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-colors cursor-pointer"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Click to upload CSV file
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  File: top 1000 influencers in spain - Sheet1.csv
                </p>
              </div>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={importing}
                className="hidden"
              />
            </label>
          </div>

          {/* Progress */}
          {importing && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Importing...
                </span>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-900 dark:text-red-300 font-semibold">❌ Error</p>
              <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Log */}
          {log.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Import Log
              </h3>
              <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-sm">
                {log.map((message, index) => (
                  <div
                    key={index}
                    className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                  >
                    {message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
              📋 Instructions
            </h3>
            <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li>1. Upload the CSV file: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">top 1000 influencers in spain - Sheet1.csv</code></li>
              <li>2. Wait for the import to complete (may take 1-2 minutes)</li>
              <li>3. Verify the success message</li>
              <li>4. Go back to the homepage and generate a presentation</li>
              <li>5. Check that real influencers appear (not mock data)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminImportPage;

