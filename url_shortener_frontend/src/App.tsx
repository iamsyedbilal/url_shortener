import AppRoutes from "./routes";
import AuthProvider from "./providers/auth-provider";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
