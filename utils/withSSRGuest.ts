import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";

export function withSSRGuest<P>(fn: GetServerSideProps<P>): GetServerSideProps {
  // esse P é só para tipar o return do cookies
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    // está retornando uma função pois o GetSeSide precisa que seja retornado uma função, e lá só está sendo executando a função "withSSRGuest"
    const cookies = parseCookies(ctx); // do lado do servidor sempre passar o ctx como 1º parametro

    if (cookies["nextauth.token"]) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }
    try {
      return await fn(ctx);
    } catch (err) {
      // console.log(err instanceof AuthTokenError);
      if (err instanceof AuthTokenError) {
        console.log(err);

        destroyCookie(ctx, "nextauth.token");
        destroyCookie(ctx, "nextauth.refreshToken");
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }
  };
}
