import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { HummingbirdScene } from "./components/HummingbirdScene";
import PasswordGate from "./components/PasswordGate";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  const previewScreen = new URLSearchParams(window.location.search).get("pantalla");
  if (import.meta.env.DEV && previewScreen === "explorar") {
    return <Home openWorldExplorer />;
  }
  if (previewScreen === "colibri") {
    return <HummingbirdPreview />;
  }
  const appBasePath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
  if (currentPath === appBasePath) {
    return <Home />;
  }
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={() => <Home />} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function HummingbirdPreview() {
  const [seedCollected, setSeedCollected] = useState(false);
  return <HummingbirdScene seedCollected={seedCollected} onCollectSeed={() => setSeedCollected(true)} />;
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <PasswordGate>
            <Router />
          </PasswordGate>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
