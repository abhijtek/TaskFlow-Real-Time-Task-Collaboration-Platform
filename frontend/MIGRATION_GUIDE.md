# React Router Migration Quick Reference

## Common Patterns Transformed

### Navigation & Links

#### ❌ Before (Next.js)
```jsx
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Component() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push("/workspaces");
  };
  
  return (
    <>
      <Link href="/login">Go to Login</Link>
      <button onClick={handleClick}>Navigate</button>
    </>
  );
}
```

#### ✅ After (React Router)
```jsx
import { Link, useNavigate } from "react-router-dom";

export default function Component() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate("/workspaces");
  };
  
  return (
    <>
      <Link to="/login">Go to Login</Link>
      <button onClick={handleClick}>Navigate</button>
    </>
  );
}
```

---

### Route Parameters

#### ❌ Before (Next.js)
```jsx
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  // File: app/workspaces/[workspaceId]/page.js
}
```

#### ✅ After (React Router)
```jsx
import { useParams } from "react-router-dom";

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  // Route: /workspaces/:workspaceId
}
```

---

### Protected Routes / Auth Guards

#### ❌ Before (Next.js)
```jsx
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading]);
  
  if (!user) return null;
  return children;
}
```

#### ✅ After (React Router)
```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
}

// In App.jsx
<Route path="/workspaces" element={
  <ProtectedRoute>
    <WorkspacesPage />
  </ProtectedRoute>
} />
```

---

### Redirects & Programmatic Navigation

#### ❌ Before (Next.js)
```jsx
router.push("/workspaces");
router.replace("/login");
router.back();
```

#### ✅ After (React Router)
```jsx
navigate("/workspaces");
navigate("/login", { replace: true });
navigate(-1);
```

---

### Query Parameters

#### ❌ Before (Next.js)
```jsx
import { useSearchParams } from "next/navigation";

const searchParams = useSearchParams();
const page = searchParams.get("page");
```

#### ✅ After (React Router)
```jsx
import { useSearchParams } from "react-router-dom";

const [searchParams] = useSearchParams();
const page = searchParams.get("page");
```

---

### Layout/Wrapper Components

#### ❌ Before (Next.js)
```jsx
// app/layout.js
import { ThemeProvider } from "@/context/theme-context";

export const metadata = {
  title: "TaskFlow",
  description: "Real-time task collaboration",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### ✅ After (React Router)
```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/theme-context";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* more routes */}
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

// In index.html or main.jsx - set metadata
document.title = "TaskFlow";
document.querySelector('meta[name="description"]')?.setAttribute("content", "Real-time task collaboration");
```

---

### Removing "use client" (Server Components → Client Components)

In React Router, you don't need `"use client"` - all components are client-side by default. Just remove the directive.

#### ❌ Before
```jsx
"use client";

import { useEffect, useState } from "react";

export default function MyComponent() { ... }
```

#### ✅ After
```jsx
import { useEffect, useState } from "react";

export default function MyComponent() { ... }
```

---

## File Structure Changes

### Next.js (app/ directory)
```
app/
  layout.js              → src/App.jsx (with Router)
  page.js                → src/pages/HomePage.jsx
  login/page.js          → src/pages/LoginPage.jsx
  signup/page.js         → src/pages/SignupPage.jsx
  workspaces/page.js     → src/pages/WorkspacesPage.jsx
  workspaces/[id]/page.js → src/pages/WorkspacePage.jsx (route: /workspaces/:id)
```

### React Router
```
src/
  main.jsx               ← Entry point
  App.jsx                ← Router & route definitions
  pages/                 ← Route components
    HomePage.jsx
    LoginPage.jsx
    SignupPage.jsx
    WorkspacesPage.jsx
    WorkspacePage.jsx
```

---

## Common Gotchas & Solutions

### Problem: Links not working
**Solution:** Make sure Link is inside a `<BrowserRouter>` provider
```jsx
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

### Problem: useParams() returns undefined values
**Solution:** Check route pattern matches parameter names
```jsx
// Route definition must have :paramName
<Route path="/workspaces/:workspaceId" element={<Page />} />

// Then useParams() returns { workspaceId: "..." }
const { workspaceId } = useParams();
```

### Problem: Navigation not working after form submission
**Solution:** Make sure navigate is called AFTER async operations complete
```jsx
const handleSubmit = async (e) => {
  const result = await login(...);
  if (result.success) {
    navigate("/workspaces"); // ✅ After async
  }
};
```

---

## Commands

| Action | Next.js | Vite |
|--------|---------|------|
| Dev Server | `npm run dev` | `npm run dev` |
| Build | `npm run build` | `npm run build` |
| Preview | N/A | `npm run preview` |
| Lint | `npm run lint` | `npm run lint` |

---

**All your components, services, and context still work the same way!** 🎉
Only navigation and routing changed.
