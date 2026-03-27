import Signin from "@/components/Auth/Signin";
import { AuthProvider } from "@/provider/AuthProvider";

const SigninPage = () => {
  return (
    <main>
      <AuthProvider>
        <Signin />
      </AuthProvider>
    </main>
  );
};

export default SigninPage;
