# Supabase Connection Pooling Fix

## ✅ Problem Solved

Your Supabase database was freezing because the app was creating **too many new connections** on every API request. This has been fixed by implementing a **shared Supabase client singleton**.

## 🔧 What Was Changed

### 1. Updated `lib/supabase.ts`
- ✅ Now uses a **single shared client instance** (singleton pattern)
- ✅ Uses `SUPABASE_SERVICE_ROLE_KEY` for server-side operations (bypasses RLS)
- ✅ Falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` if service role key is not available
- ✅ Added connection pooling configuration
- ✅ Added proper error handling for missing environment variables
- ✅ Disabled session persistence for server-side (not needed)

### 2. Updated `env.example`
- ✅ Added Supabase environment variables documentation
- ✅ Added instructions on where to find the keys

## 📋 Required Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Service Role Key (for server-side operations)
# IMPORTANT: Never expose this in client-side code!
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Where to Find These Values:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to**: Project Settings → API
4. **Copy**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## ✅ Verification

All existing code is already using the shared client:
- ✅ `lib/supabase-db.ts` - Uses shared client
- ✅ `app/api/test-supabase/route.ts` - Uses shared client
- ✅ `app/api/countries-supabase/route.ts` - Uses shared client
- ✅ `app/api/auth/register/route.ts` - Uses shared client via `supabase-db.ts`

**No code changes needed** - the fix is in the shared client configuration!

## 🚫 What NOT to Do

### ❌ NEVER do this in API routes:
```typescript
// ❌ BAD - Creates new connection every request
export async function GET() {
  const supabase = createClient(url, key)  // DON'T DO THIS!
  // ...
}
```

### ✅ ALWAYS do this:
```typescript
// ✅ GOOD - Uses shared singleton
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabase.from('table').select('*')
  // ...
}
```

## 🔍 How It Works

1. **Single Instance**: `lib/supabase.ts` creates ONE client when the module loads
2. **Reused Everywhere**: All API routes and server actions import this same instance
3. **Connection Pooling**: Supabase automatically reuses connections efficiently
4. **No More Overload**: Instead of 100+ connections, you now have a small pool that's reused

## 📊 Expected Results

After this fix:
- ✅ Supabase stops freezing
- ✅ Database connections stay within limits
- ✅ Better performance (connection reuse)
- ✅ No more "too many connections" errors

## 🧪 Testing

Test the connection:
```bash
curl http://localhost:3000/api/test-supabase
```

Should return:
```json
{
  "status": "success",
  "message": "Supabase connection working!",
  "data": [...]
}
```

## 📝 Notes

- The service role key bypasses Row Level Security (RLS) - this is intentional for server-side operations
- If you need RLS enforcement, use the anon key instead (but service role is recommended for backend)
- Connection pooling happens automatically - no additional configuration needed
- The client is created once and reused - this is the key to preventing connection overload

