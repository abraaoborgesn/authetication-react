import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { parseCookies } from 'nookies';

export function withSSRAuth<P>(fn: GetServerSideProps<P>): GetServerSideProps {
  // esse P é só para tipar o return do cookies
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    // está retornando uma função pois o GetSeSide precisa que seja retornado uma função, e lá só está sendo executando a função "withSSRGuest"
    const cookies = parseCookies(ctx); // do lado do servidor sempre passar o ctx como 1º parametro

    if (!cookies["nextauth.token"]) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    return await fn(ctx);
  };
}
