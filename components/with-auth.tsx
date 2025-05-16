import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export function withAuth(Component) {
  return async function AuthenticatedComponent(props) {
    const session = await getServerSession(authOptions);

    if (!session) {
      redirect(ROUTES.SIGN_IN);
      return null;
    }

    return <Component {...props} />;
  };
}
