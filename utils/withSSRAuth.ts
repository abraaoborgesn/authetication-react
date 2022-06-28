import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { parseCookies } from "nookies";
import decode from "jwt-decode";
import { validateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
};

export function withSSRAuth<P>(
  fn: GetServerSideProps<P>,
  options?: WithSSRAuthOptions
): GetServerSideProps {
  // esse P é só para tipar o return do cookies
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    // está retornando uma função pois o GetSeSide precisa que seja retornado uma função, e lá só está sendo executando a função "withSSRGuest"
    const cookies = parseCookies(ctx); // do lado do servidor sempre passar o ctx como 1º parametro
    const token = cookies["nextauth.token"];

    if (!token) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    if (options) {
      const user = decode<{ permissions: string[]; roles: string[] }>(token);
      const { permissions, roles } = options;

      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles,
      });

      if (!userHasValidPermissions) {
        return {
          // notFound: true,
          redirect: {
            destination: '/dashboard',
            permanent: false,
          },

        }
      }
    }

    return await fn(ctx);
  };
}
