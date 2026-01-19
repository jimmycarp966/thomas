---
name: nextjs-best-practices
description: Next.js 15 App Router best practices including Server Components, Server Actions, and performance optimization. Use when working with Next.js app directory.
---

# Next.js Best Practices Skill

When working with Next.js 15 App Router, follow these guidelines:

## Server Components vs Client Components

### Default: Server Components
- Use Server Components by default (no `'use client'`)
- Better performance (no JavaScript sent to client)
- Access to server-side resources directly
- Better SEO

### When to Use Client Components
- Interactive features (onClick, onChange)
- Browser APIs (window, document, localStorage)
- React hooks (useState, useEffect, useRef)
- Third-party libraries that require browser

### Example
```typescript
// ✅ Server Component (default)
export default function DashboardPage() {
  const data = await getData();
  return <div>{data.name}</div>;
}

// ✅ Client Component (when needed)
'use client';
export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Server Actions

### When to Use
- Form submissions
- Data mutations
- Server-side processing
- Instead of API routes

### Best Practices
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  
  // Validate input
  const name = formData.get('name') as string;
  
  // Update database
  await supabase.from('profiles').update({ name });
  
  // Revalidate cache
  revalidatePath('/profile');
  
  return { success: true };
}
```

### Validation
- Always validate inputs with Zod
- Handle errors gracefully
- Return consistent response format

## Data Fetching

### Server Components (Recommended)
```typescript
async function DashboardPage() {
  const [user, posts] = await Promise.all([
    getUser(),
    getPosts()
  ]);
  
  return <Dashboard user={user} posts={posts} />;
}
```

### Client Components (When Needed)
```typescript
'use client';
import { useEffect, useState } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  return user ? <div>{user.name}</div> : <Loading />;
}
```

## Performance Optimization

### Code Splitting
- Use dynamic imports for heavy components
- Lazy load routes when appropriate

```typescript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Loading />,
  ssr: false // Optional: disable SSR for client-only components
});
```

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/profile.jpg"
  alt="Profile"
  width={500}
  height={500}
  priority // For above-the-fold images
/>
```

### Font Optimization
```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

## Routing

### App Router Structure
```
app/
├── (auth)/          # Route group (no URL segment)
│   ├── dashboard/
│   └── settings/
├── (public)/
│   ├── login/
│   └── register/
├── layout.tsx        # Root layout
└── page.tsx          # Home page
```

### Dynamic Routes
```typescript
// app/posts/[id]/page.tsx
export default function PostPage({ params }: { params: { id: string } }) {
  return <div>Post {params.id}</div>;
}
```

### Route Handlers (API)
```typescript
// app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}
```

## Error Handling

### Error Boundaries
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found Pages
```typescript
// app/not-found.tsx
export default function NotFound() {
  return <div>Page not found</div>;
}
```

## TypeScript Best Practices

### Type Safety
- Use strict mode
- Define proper types for props
- Use Zod for runtime validation

```typescript
interface DashboardProps {
  user: User;
  posts: Post[];
}

export default function Dashboard({ user, posts }: DashboardProps) {
  // ...
}
```

## Checklist

Before committing Next.js code:
- [ ] Using Server Components by default
- [ ] Only using 'use client' when necessary
- [ ] Using Server Actions for mutations
- [ ] Validating inputs with Zod
- [ ] Optimizing images with next/image
- [ ] Using dynamic imports for heavy components
- [ ] Handling errors appropriately
- [ ] TypeScript types are correct
