import { Redirect } from 'expo-router';

// This is just a dummy index that triggers the AuthGate layout logic.
export default function Index() {
  return <Redirect href="/auth" />;
}
