"use client";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

function App() {
  return (
    <main>
      <Unauthenticated>Logged out</Unauthenticated>
      <Authenticated>Logged in</Authenticated>
      <AuthLoading>Loading...</AuthLoading>
    </main>
  );
}

export default App;
