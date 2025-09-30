# Database Setup Guide - Pretty Presentations

## Overview

This document details the database setup for Pretty Presentations, including the influencer database imported from LAYAI and the Firestore collections structure.

---

## LAYAI Influencer Database

### Database Knowledge

The LAYAI influencer database contains **2,996 processed Spanish influencers** with the following characteristics:

#### **Data Sources:**
- **Primary Source**: Top 3,000 Spanish influencers CSV (validated and processed)
- **Real-time Enhancement**: 
  - StarNgage: Real audience demographics (age/gender breakdowns)
  - Apify: Instagram profile scraping and verification
  - Serply: Web search for influencer discovery
  - Custom APIs: Brand research and collaboration verification

#### **Data Quality:**
- 99%+ legitimate profiles
- Authenticity checks and engagement validation
- Quality scoring with credibility metrics
- Brand account filtering (removes non-personal accounts)
- Duplicate removal with intelligent deduplication

#### **Performance Metrics:**
- 22ms average response time (local JSON)
- 1-2 seconds for Firebase operations (with throttling)
- 95%+ accuracy for gender filtering
- Spanish name recognition (50+ male names, 40+ female names with variants)

---

## Firestore Database Structure

### Collections Overview

```
firestore/
├── users/                          # User accounts
│   ├── {userId}/
│   │   ├── presentations/         # User's presentations (subcollection)
│   │   └── campaigns/             # User's campaigns (subcollection)
│
├── influencers/                   # Influencer database (2,996+ profiles)
│   ├── {influencerId}/
│   │   └── performance/           # Historical performance data (subcollection)
│
├── presentations/                 # Shared/public presentations
│   ├── {presentationId}/
│   │   └── slides/                # Presentation slides (subcollection)
│
├── brands/                        # Brand information
│
├── templates/                     # Presentation templates
│
├── campaigns/                     # Campaign management
│   ├── {campaignId}/
│   │   └── searches/              # Search history (subcollection)
│
├── metadata/                      # System metadata
│
└── analytics/                     # Usage analytics and logs
```

---

## Influencer Document Schema

Each influencer document in the `influencers` collection has the following structure:

```typescript
{
  id: string;                      // Unique identifier
  name: string;                    // Full name
  handle: string;                  // Social media handle (without @)
  platform: "Instagram" | "TikTok" | "YouTube" | "Twitter" | "Facebook" | "LinkedIn" | "Twitch";
  profileImage: string;            // URL to profile image
  
  // Metrics
  followers: number;               // Total followers
  engagement: number;              // Engagement rate (percentage)
  avgViews: number;                // Average views per post
  
  // Demographics (from StarNgage)
  demographics: {
    ageRange: string;              // e.g., "18-34"
    gender: string;                // e.g., "70% Female, 30% Male"
    location: string[];            // Array of locations
    interests: string[];           // Audience interests
    psychographics?: string;       // Optional psychographic data
  };
  
  // Content
  contentCategories: string[];     // e.g., ["Fashion", "Lifestyle", "Beauty"]
  previousBrands: string[];        // Brands they've worked with
  
  // Pricing
  rateCard: {
    post: number;                  // Price for single post (EUR)
    story: number;                 // Price for story (EUR)
    reel: number;                  // Price for reel (EUR)
    video: number;                 // Price for video (EUR)
    integration: number;           // Price for brand integration (EUR)
  };
  
  // Performance
  performance: {
    averageEngagementRate: number; // Average engagement %
    averageReach: number;          // Average reach per post
    audienceGrowthRate: number;    // Monthly growth %
    contentQualityScore: number;   // Quality score (0-10)
  };
  
  // Additional LAYAI data
  verified?: boolean;              // Verification status
  authenticityScore?: number;      // Authenticity score (0-100)
  contactEmail?: string;           // Contact email
  lastUpdated: Timestamp;          // Last data update
  dataSource: string;              // "LAYAI" or specific source
}
```

---

## Presentation Document Schema

```typescript
{
  id: string;
  clientName: string;
  campaignName: string;
  templateId: string;
  
  createdBy: string;               // User ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  collaborators: string[];         // Array of user IDs
  status: "draft" | "in-review" | "approved" | "delivered";
  
  brief: {
    clientName: string;
    campaignGoals: string[];
    budget: number;
    targetDemographics: {
      ageRange: string;
      gender: string;
      location: string[];
      interests: string[];
    };
    brandRequirements: string[];
    timeline: string;
    platformPreferences: Platform[];
    contentThemes: string[];
    additionalNotes?: string;
  };
  
  selectedInfluencers: string[];   // Array of influencer IDs
  
  metadata: {
    totalSlides: number;
    estimatedReach: number;
    estimatedBudget: number;
    exportedAt?: Timestamp;
    exportFormat?: string;
  };
}
```

---

## Campaign Document Schema

```typescript
{
  id: string;
  brandId: string;
  campaignName: string;
  
  createdBy: string;               // User ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  teamMembers: string[];           // Array of user IDs
  status: "planning" | "active" | "completed" | "archived";
  
  budget: number;
  targetInfluencers: number;
  
  presentations: string[];         // Array of presentation IDs
  
  metadata: {
    totalSearches: number;
    influencersReviewed: number;
    influencersContacted: number;
  };
}
```

---

## Firebase Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Fill in your Firebase configuration from the Firebase Console:
1. Go to Firebase Console → Project Settings → General
2. Scroll to "Your apps" and find your web app
3. Copy the configuration values

### 2. Firebase Services Setup

Ensure the following Firebase services are enabled in your Firebase Console:

#### **Authentication**
- Go to Authentication → Sign-in method
- Enable Email/Password
- Enable Google (optional but recommended)

#### **Firestore Database**
- Go to Firestore Database → Create database
- Start in **production mode**
- Choose your database location (closest to your users)

#### **Storage**
- Go to Storage → Get started
- Start in **production mode**

#### **Vertex AI**
- Vertex AI should be automatically available with Firebase
- Ensure Gemini API is enabled in Google Cloud Console

### 3. Deploy Security Rules

Deploy the Firestore and Storage rules:

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Firestore
# - Storage
# - (Optional) Hosting

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 4. Import Influencer Database

You have two options to import the LAYAI influencer database:

#### **Option A: Manual Import (Recommended for < 500 documents)**

Use the Firebase Admin script:

```bash
npm run import:influencers
```

This will run the import script in `scripts/import-influencers.ts`.

#### **Option B: Firestore Import Tool (For large datasets)**

1. Export LAYAI data to JSON format
2. Use Firebase CLI to import:

```bash
firebase firestore:import ./data/influencers-export
```

---

## Data Migration from LAYAI

### Required Files from LAYAI Repository

To import the influencer database, you need:

1. **`data/influencers.json`** - Main influencer database (2,996 profiles)
2. **`data/spanish-influencers-top-3000.csv`** - Original CSV source (optional)

### Manual Import Process

If you need to manually import the data:

1. Clone the LAYAI repository:
   ```bash
   git clone https://github.com/Jrogbaaa/LAYAI.git
   cd LAYAI
   ```

2. Locate the influencer data files (typically in `/data` directory)

3. Copy the data files to your project:
   ```bash
   cp -r LAYAI/data /Users/JackEllis/Pretty\ Presentations/pretty-presentations/data/
   ```

4. Run the import script (see next section)

---

## Import Script Usage

The import script (`scripts/import-influencers.ts`) will:

1. Read influencer data from JSON/CSV
2. Transform to match our Firestore schema
3. Batch upload to Firestore (500 documents per batch)
4. Handle throttling (15 writes per 1.5 seconds as per LAYAI)
5. Create search indexes for efficient querying
6. Log progress and errors

---

## Firestore Indexes

Create the following composite indexes for optimal query performance:

### Influencer Search Indexes

```
Collection: influencers
Fields:
  - platform (Ascending)
  - followers (Descending)
  - engagement (Descending)

Collection: influencers
Fields:
  - contentCategories (Array)
  - engagement (Descending)
  - followers (Descending)

Collection: influencers
Fields:
  - demographics.location (Array)
  - followers (Descending)
```

Create indexes via:
1. Firebase Console → Firestore → Indexes
2. Or they'll be auto-created when you run queries

---

## Testing Firebase Connection

Run the test script to verify all services:

```bash
npm run test:firebase
```

This will test:
- ✅ Firestore connection
- ✅ Storage access
- ✅ Vertex AI (Gemini) integration
- ✅ Authentication (if enabled)
- ✅ Read/write permissions
- ✅ Query performance

---

## Firestore Throttling

To prevent resource exhaustion (as implemented in LAYAI), use the Firebase throttler:

```typescript
import { FirebaseThrottler } from '@/lib/firebase-throttler';

const throttler = new FirebaseThrottler({
  writesPerInterval: 15,
  interval: 1500, // milliseconds
});

// Add write operations to queue
await throttler.addWrite(() => 
  setDoc(doc(db, 'influencers', influencerId), data)
);
```

---

## Performance Optimization

### Local Caching Strategy

For optimal performance (like LAYAI's 22ms response time):

1. **On App Load**: Fetch frequently accessed influencers to local state/cache
2. **Search Operations**: Query Firestore with filters, cache results
3. **Real-time Updates**: Use Firestore snapshots for live data
4. **Offline Support**: Enable Firestore offline persistence

```typescript
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab
  } else if (err.code == 'unimplemented') {
    // Browser doesn't support offline persistence
  }
});
```

---

## Monitoring and Analytics

### Firebase Analytics

Track key metrics:
- Influencer search queries
- Presentation creation rate
- Export frequency
- User engagement

### Performance Monitoring

Enable Firebase Performance Monitoring:
```bash
firebase init performance
```

Monitor:
- Query performance
- Page load times
- API call durations

---

## Backup Strategy

### Automated Backups

Set up automated Firestore backups:

```bash
gcloud firestore export gs://your-backup-bucket
```

Schedule daily backups via Cloud Scheduler.

### Manual Backups

Export specific collections:

```bash
firebase firestore:export gs://your-backup-bucket/backups/$(date +%Y%m%d)
```

---

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate API keys regularly** - Every 90 days
3. **Use Firebase App Check** - Protect against abuse
4. **Monitor usage** - Set up billing alerts
5. **Audit security rules** - Review quarterly
6. **Restrict Admin SDK** - Only use server-side
7. **Enable MFA** - For Firebase Console access

---

## Troubleshooting

### Common Issues

#### "Permission Denied" Errors
- Verify user is authenticated
- Check Firestore security rules
- Ensure user has correct role

#### Slow Query Performance
- Create composite indexes
- Limit query results
- Use pagination

#### Import Failures
- Check Firebase quotas (500 writes/second)
- Verify data format matches schema
- Enable throttling for large imports

#### Storage Upload Fails
- Verify file size < limits
- Check file type restrictions
- Ensure Storage rules allow upload

---

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [LAYAI Repository](https://github.com/Jrogbaaa/LAYAI)

---

## Next Steps

1. ✅ Create Firebase project
2. ✅ Set up environment variables
3. ✅ Deploy security rules
4. ⏳ Import influencer database
5. ⏳ Test Firebase connection
6. ⏳ Configure indexes
7. ⏳ Enable offline persistence
8. ⏳ Set up automated backups
