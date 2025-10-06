# API Versioning Strategy

**Version:** 1.0  
**Date:** October 6, 2025

---

## Overview

This document outlines the API versioning strategy for the Pretty Presentations application, ensuring backwards compatibility and smooth transitions when introducing breaking changes.

## Current API Version

**v1** - Initial release

### Endpoints

- `POST /api/images/generate` - Generate images for slides
- `POST /api/images/edit` - Edit existing images
- `GET /api/presentations` - List all presentations
- `GET /api/presentations/[id]` - Get specific presentation
- `POST /api/presentations` - Create new presentation
- `PUT /api/presentations/[id]` - Update presentation
- `DELETE /api/presentations/[id]` - Delete presentation

---

## Versioning Approach

### Strategy: URL Path Versioning

We use URL path versioning (e.g., `/api/v1/resource`) for explicit version control.

**Rationale:**
- Clear and explicit
- Easy to cache
- Simple to route
- RESTful best practice

### Current Implementation

**Default (v1):**
```
/api/images/generate → v1 implementation
```

**Explicit version (future):**
```
/api/v1/images/generate → v1 implementation
/api/v2/images/generate → v2 implementation (when needed)
```

---

## Version Compatibility

### V1 - Current (October 2025)

**Status:** ✅ **STABLE**

#### Breaking Changes Policy
- No breaking changes in v1
- New optional parameters allowed
- Response can add new fields (clients should ignore unknown fields)

#### Deprecation Process
1. Announce deprecation 3 months before removal
2. Add deprecation header: `X-API-Deprecation: true`
3. Provide migration guide
4. Support old version for minimum 6 months

---

## Request/Response Formats

### Standard Request Headers
```http
Content-Type: application/json
X-API-Version: 1 (optional, defaults to latest stable)
```

### Standard Response Headers
```http
Content-Type: application/json
X-RateLimit-Limit: {limit}
X-RateLimit-Remaining: {remaining}
X-RateLimit-Reset: {reset_time}
X-API-Version: 1
```

### Error Response Format (consistent across all versions)
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE" (optional),
  "details": [] (optional, for validation errors)
}
```

---

## Adding New API Version

### When to Create New Version

**Create new version (v2, v3, etc.) when:**
- Removing required fields
- Changing field data types
- Renaming fields
- Changing endpoint behavior significantly
- Removing endpoints

**DON'T create new version when:**
- Adding optional fields
- Adding new endpoints
- Adding optional query parameters
- Improving performance
- Fixing bugs

### Migration Checklist

When creating a new API version:

- [ ] Create new route directory: `app/api/v2/`
- [ ] Copy existing endpoints from v1
- [ ] Implement breaking changes
- [ ] Update validation schemas
- [ ] Add version header to responses
- [ ] Update documentation
- [ ] Write migration guide
- [ ] Add deprecation notice to old version
- [ ] Update tests
- [ ] Update client code to support both versions

### Example: Creating V2

```typescript
// app/api/v2/images/generate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // New v2 implementation
  // ...
  
  return NextResponse.json(data, {
    headers: {
      "X-API-Version": "2",
      // ... other headers
    }
  });
}
```

```typescript
// app/api/v1/images/generate/route.ts (deprecated)
export async function POST(request: NextRequest) {
  // Old v1 implementation
  // ...
  
  return NextResponse.json(data, {
    headers: {
      "X-API-Version": "1",
      "X-API-Deprecation": "true",
      "X-API-Sunset": "2026-04-01", // 6 months notice
      // ... other headers
    }
  });
}
```

---

## Client Implementation

### Recommended Client Approach

```typescript
// API client with version support
class APIClient {
  private version: string = "v1";
  
  async generateImage(data: GenerateImageRequest, version?: string) {
    const apiVersion = version || this.version;
    const endpoint = apiVersion === "v1" 
      ? "/api/images/generate"  // Default v1 path
      : `/api/${apiVersion}/images/generate`;  // Explicit version
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Version": apiVersion,
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  }
}
```

### Handling Version Transitions

```typescript
// Graceful fallback
try {
  // Try v2 first
  return await client.generateImage(data, "v2");
} catch (error) {
  if (error.status === 404) {
    // Fallback to v1
    return await client.generateImage(data, "v1");
  }
  throw error;
}
```

---

## Version Support Timeline

| Version | Release Date | Status | EOL Date | Notes |
|---------|-------------|--------|----------|-------|
| v1 | Oct 2025 | ✅ Stable | TBD | Current version |
| v2 | TBD | 🔮 Planned | TBD | Breaking changes TBD |

**Support Policy:**
- Stable versions supported for minimum 12 months after next version release
- Deprecated versions receive security updates only
- 6 months notice before EOL

---

## Monitoring & Analytics

### Track API Version Usage

```typescript
// lib/analytics.ts
export const trackAPIRequest = (version: string, endpoint: string) => {
  // Track which versions are being used
  analytics.track("api_request", {
    version,
    endpoint,
    timestamp: Date.now(),
  });
};
```

### Deprecation Metrics

Monitor:
- Requests to deprecated endpoints
- Client versions in use
- Error rates by version
- Migration progress

---

## Future Considerations

### V2 Potential Changes (Brainstorming)

**Possible improvements:**
1. **Batch operations** - Generate multiple images in one request
2. **Webhook support** - Async image generation with callbacks
3. **Image variations** - Request multiple style options
4. **Streaming responses** - Progressive image generation updates
5. **Enhanced metadata** - More detailed generation info

**Breaking changes that would require v2:**
- Changing `imageUrl` to `imageUrls` array
- Renaming `slideType` to `templateType`
- Restructuring `brief` object schema

---

## References

- [Semantic Versioning](https://semver.org/)
- [REST API Versioning Best Practices](https://restfulapi.net/versioning/)
- [Microsoft API Guidelines - Versioning](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#12-versioning)

---

**Document Version:** 1.0  
**Last Updated:** October 6, 2025  
**Next Review:** January 2026

